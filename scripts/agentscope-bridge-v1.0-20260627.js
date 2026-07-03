/**
 * agent-bridge — 产品壳与分析服务后端的 SSE / Chat 桥接
 * 版本: v2.5 | 日期: 2026-06-27
 *
 * 单轮回复使用 agent-blocks 消息：text + tool（含 MCP 完整 output）+ 确认卡。
 */
import {
  loadAgentscopeManifest,
  resolveExpertBinding,
  getApiConfig,
  ensureRunnableSession,
} from "./agentscope-config-v1.0-20260627.js";
import {
  wrapFinstepPublicText,
  mapToolStatusLabel,
} from "./finstep-data-wrapper-v1.0-20260627.js";
import { collectSourceCitationsFromAgentBlocks } from "./source-citations-demo-v1.0-20260629.js";

const EVT = {
  REPLY_START: "REPLY_START",
  REPLY_END: "REPLY_END",
  TEXT_BLOCK_START: "TEXT_BLOCK_START",
  TEXT_BLOCK_DELTA: "TEXT_BLOCK_DELTA",
  TEXT_BLOCK_END: "TEXT_BLOCK_END",
  TOOL_CALL_START: "TOOL_CALL_START",
  TOOL_CALL_DELTA: "TOOL_CALL_DELTA",
  TOOL_CALL_END: "TOOL_CALL_END",
  TOOL_RESULT_START: "TOOL_RESULT_START",
  TOOL_RESULT_TEXT_DELTA: "TOOL_RESULT_TEXT_DELTA",
  TOOL_RESULT_DATA_DELTA: "TOOL_RESULT_DATA_DELTA",
  TOOL_RESULT_END: "TOOL_RESULT_END",
  THINKING_BLOCK_START: "THINKING_BLOCK_START",
  THINKING_BLOCK_DELTA: "THINKING_BLOCK_DELTA",
  REQUIRE_USER_CONFIRM: "REQUIRE_USER_CONFIRM",
  USER_CONFIRM_RESULT: "USER_CONFIRM_RESULT",
};

async function cancelServerRun(apiBase, userId, sessionId, agentId) {
  const qs = new URLSearchParams({ agent_id: agentId });
  try {
    await apiFetch(apiBase, userId, `/sessions/${sessionId}/cancel?${qs}`, { method: "POST" });
  } catch (err) {
    console.warn("[agent-bridge] cancel run failed", err);
  }
}
const CONNECTING_TEXT = "正在连接 Finstep 分析服务…";
const CONFIRM_HINT_TEXT = "数据服务需要你确认一项选择后继续。";

async function apiFetch(apiBase, userId, path, init = {}) {
  const headers = { "X-User-ID": userId, ...(init.headers || {}) };
  if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const res = await fetch(`${apiBase}${path}`, { ...init, headers });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${path} -> ${res.status}: ${detail}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res;
}

async function* streamEvents(apiBase, userId, sessionId, agentId, signal) {
  const qs = new URLSearchParams({ agent_id: agentId });
  const res = await apiFetch(apiBase, userId, `/sessions/${sessionId}/stream?${qs}`, {
    method: "GET",
    signal,
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json) yield JSON.parse(json);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function pruneIncompleteAgentTail(messages) {
  while (messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last.role !== "agent") break;
    if (last.type === "agent-blocks" && last.streaming) {
      messages.pop();
      continue;
    }
    if (last.type === "tool-run" || last.type === "tool-status") {
      messages.pop();
      continue;
    }
    if (last.type === "text" && (last.streaming || last.text === CONNECTING_TEXT)) {
      messages.pop();
      continue;
    }
    break;
  }
}

function hasAskingToolBlock(blocks) {
  return (blocks || []).some((b) => b.type === "tool" && b.callState === "asking");
}

function finalizeAgentTextBlock(turn, tb, state, opts = {}) {
  if (!tb) return;
  tb.streaming = false;
  tb.markdown = false;
  tb.text = wrapFinstepPublicText(tb.text || "");

  if (state.hasTextDelta) return;

  const hasTools = turn.blocks.some((b) => b.type === "tool");
  const hasToolOutput = turn.blocks.some((b) => b.type === "tool" && b.output);
  const needsConfirm = state.awaitingConfirm || hasAskingToolBlock(turn.blocks);

  if (needsConfirm) {
    if (!tb.text.trim() || tb.text === CONNECTING_TEXT) {
      tb.text = opts.confirmText || CONFIRM_HINT_TEXT;
    }
    return;
  }

  if (!tb.text.trim() || tb.text === CONNECTING_TEXT) {
    if (hasToolOutput) {
      tb.text = "";
      return;
    }
    if (hasTools) {
      tb.text = opts.toolsPendingText || "数据检索进行中，请稍候…";
      return;
    }
    if (!state.sawReplyStart) {
      tb.text = opts.staleSessionText
        || "上一轮会话未正常结束，已尝试恢复。请重新发送问题；若仍无响应请刷新页面。";
      return;
    }
    tb.text = opts.emptyText || "分析服务未返回结果，请稍后重试。";
  }
}

/**
 * @param {object} hooks
 */
export function createAgentscopeBridge(hooks) {
  let activeAbort = null;
  let liveCtx = null;

  const createTurnRuntime = (turn, hooksApi, sessionId, agentId) => {
    const state = {
      finished: false,
      streamError: null,
      hasTextDelta: false,
      awaitingConfirm: false,
      sawReplyStart: false,
      sawStreamActivity: false,
    };

    const getTurnMsg = () => {
      if (turn.msgIdx != null) {
        const sess = hooksApi.getSession();
        const existing = sess?.messages?.[turn.msgIdx];
        if (existing?.type === "agent-blocks") return existing;
      }
      const msg = {
        role: "agent",
        type: "agent-blocks",
        replyId: turn.replyId,
        blocks: turn.blocks,
        streaming: true,
      };
      hooksApi.pushAgent(msg);
      turn.msgIdx = hooksApi.getSession().messages.length - 1;
      return msg;
    };

    const findTextBlock = () => turn.blocks.find((b) => b.type === "text");

    const ensureTextBlock = () => {
      let tb = findTextBlock();
      if (!tb) {
        tb = { type: "text", text: "", streaming: true, markdown: false };
        turn.blocks.push(tb);
      }
      return tb;
    };

    const findToolBlock = (toolCallId) => turn.blocks.find(
      (b) => b.type === "tool" && b.id === toolCallId,
    );

    const ensureToolBlock = (toolCallId, toolName) => {
      let tb = findToolBlock(toolCallId);
      if (!tb) {
        tb = {
          type: "tool",
          id: toolCallId,
          name: toolName,
          label: mapToolStatusLabel(toolName),
          input: "",
          output: "",
          callState: "pending",
          resultState: null,
          expanded: false,
        };
        turn.blocks.push(tb);
        const textB = findTextBlock();
        if (textB) textB.streaming = false;
      }
      return tb;
    };

    /** @type {((v: {ok: boolean}) => void) | null} */
    let resolveTurnComplete = null;
    const turnComplete = new Promise((resolve) => {
      resolveTurnComplete = resolve;
    });

    const handleEvent = (event) => {
      if (state.finished && event.type !== EVT.REPLY_END) return;

      if (event.reply_id && turn.replyId && event.reply_id !== turn.replyId) return;
      if (event.reply_id || event.type === EVT.REPLY_START) {
        state.sawStreamActivity = true;
      }

      if (event.type === EVT.REPLY_START) {
        state.sawReplyStart = true;
        turn.replyId = event.reply_id;
        const msg = getTurnMsg();
        msg.replyId = event.reply_id;
      } else if (event.type === EVT.TEXT_BLOCK_DELTA && event.reply_id === turn.replyId) {
        const tb = ensureTextBlock();
        state.hasTextDelta = true;
        tb.markdown = false;
        if (tb.text === CONNECTING_TEXT) tb.text = "";
        tb.text = wrapFinstepPublicText((tb.text || "") + (event.delta || ""));
        tb.streaming = true;
        getTurnMsg();
        hooksApi.rerender();
        hooksApi.scroll();
      } else if (event.type === EVT.TOOL_CALL_START && event.reply_id === turn.replyId) {
        ensureToolBlock(event.tool_call_id, event.tool_call_name);
        getTurnMsg();
        hooksApi.rerender();
        hooksApi.scroll();
      } else if (event.type === EVT.TOOL_CALL_DELTA && event.reply_id === turn.replyId) {
        const tb = ensureToolBlock(event.tool_call_id, event.tool_call_name || "");
        tb.input = (tb.input || "") + (event.delta || "");
        hooksApi.rerender();
      } else if (event.type === EVT.TOOL_RESULT_START && event.reply_id === turn.replyId) {
        const tb = ensureToolBlock(event.tool_call_id, event.tool_call_name);
        tb.resultState = "running";
        hooksApi.rerender();
      } else if (event.type === EVT.TOOL_RESULT_TEXT_DELTA && event.reply_id === turn.replyId) {
        const tb = ensureToolBlock(event.tool_call_id, event.tool_call_name || "");
        tb.output = wrapFinstepPublicText((tb.output || "") + (event.delta || ""));
        if (tb.output && !tb._hadOutput) {
          tb.expanded = true;
          tb._hadOutput = true;
        }
        hooksApi.rerender();
        hooksApi.scroll();
      } else if (event.type === EVT.TOOL_RESULT_END && event.reply_id === turn.replyId) {
        const tb = findToolBlock(event.tool_call_id);
        if (tb) {
          tb.resultState = event.state || "success";
          tb.callState = "finished";
        }
        hooksApi.rerender();
      } else if (event.type === EVT.REQUIRE_USER_CONFIRM && event.reply_id === turn.replyId) {
        state.awaitingConfirm = true;
        for (const tc of event.tool_calls || []) {
          const tb = ensureToolBlock(tc.id, tc.name);
          tb.callState = "asking";
          tb.input = tc.input || tb.input;
          tb.suggestedRules = tc.suggested_rules || [];
        }
        const textB = findTextBlock();
        if (textB) {
          textB.streaming = false;
          if (!textB.text.trim() || textB.text === CONNECTING_TEXT) {
            textB.text = CONFIRM_HINT_TEXT;
            textB.markdown = false;
          }
        }
        const msg = getTurnMsg();
        msg.awaitingConfirm = true;
        msg.confirmCtx = { sessionId, agentId };
        hooksApi.setStreaming(false);
        hooksApi.rerender();
        hooksApi.scroll();
      } else if (event.type === EVT.REPLY_END && event.reply_id === turn.replyId) {
        state.finished = true;
        const msg = getTurnMsg();
        msg.streaming = false;
        msg.awaitingConfirm = false;
        state.awaitingConfirm = false;
        for (const b of turn.blocks) {
          if (b.type === "text") b.streaming = false;
        }
        msg.sourceCitations = collectSourceCitationsFromAgentBlocks(turn.blocks);
        hooksApi.setStreaming(false);
        hooksApi.rerender();
        resolveTurnComplete?.({ ok: true });
      }
    };

    const consume = async (signal) => {
      try {
        for await (const event of streamEvents(
          hooksApi.apiBase, hooksApi.userId, sessionId, agentId, signal,
        )) {
          handleEvent(event);
        }
      } catch (err) {
        if (err?.name !== "AbortError") state.streamError = err;
      }
    };

    return {
      state,
      turnComplete,
      getTurnMsg,
      findTextBlock,
      ensureTextBlock,
      consume,
      finalize: (opts) => {
        const msg = getTurnMsg();
        msg.streaming = false;
        finalizeAgentTextBlock(turn, findTextBlock(), state, opts);
        msg.sourceCitations = collectSourceCitationsFromAgentBlocks(turn.blocks);
        hooksApi.setStreaming(false);
        hooksApi.rerender();
        hooksApi.scroll();
      },
    };
  };

  const waitForTurn = async (runtime, signal, streamTask, opts = {}) => {
    const deadline = Date.now() + (opts.timeoutMs ?? 300000);
    const idleMs = opts.idleMs ?? 60000;
    const idleDeadline = Date.now() + idleMs;

    while (!runtime.state.finished && !runtime.state.awaitingConfirm && Date.now() < deadline) {
      if (!runtime.state.sawReplyStart && Date.now() > idleDeadline) break;
      await new Promise((r) => setTimeout(r, 150));
    }

    if (!runtime.state.finished && !runtime.state.awaitingConfirm) {
      signal.abort();
    }
    if (!runtime.state.awaitingConfirm) {
      await streamTask.catch(() => {});
    }
  };

  const runLiveQuery = async (userText, opts = {}) => {
    const sess = hooks.getSession();
    if (!sess) return { ok: false, error: "no_session" };

    const manifest = await loadAgentscopeManifest();
    const binding = resolveExpertBinding(manifest, hooks.state);
    if (!binding) return { ok: false, error: "bridge_disabled" };

    let sessionId;
    try {
      sessionId = await ensureRunnableSession(manifest, binding);
    } catch (err) {
      return { ok: false, error: `session_recover_failed: ${err?.message || err}` };
    }

    const { apiBase, userId } = getApiConfig(manifest);

    activeAbort?.abort();
    activeAbort = new AbortController();
    const signal = activeAbort.signal;

    pruneIncompleteAgentTail(sess.messages);

    const turn = { replyId: null, msgIdx: null, blocks: [] };
    const hooksApi = {
      apiBase,
      userId,
      getSession: hooks.getSession,
      pushAgent: hooks.pushAgent,
      rerender: hooks.rerender,
      scroll: hooks.scroll,
      setStreaming: hooks.setStreaming,
    };
    const runtime = createTurnRuntime(turn, hooksApi, sessionId, binding.agentId);

    hooks.setStreaming(true);
    const bootText = runtime.ensureTextBlock();
    bootText.text = CONNECTING_TEXT;
    bootText.markdown = false;
    runtime.getTurnMsg();
    hooks.rerender();
    hooks.scroll();

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      name: "user",
      content: [{ id: crypto.randomUUID(), type: "text", text: userText }],
      metadata: {},
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    };

    liveCtx = {
      apiBase,
      userId,
      sessionId,
      agentId: binding.agentId,
      turn,
      turnComplete: runtime.turnComplete,
      runtime,
    };

    const streamTask = runtime.consume(signal);

    try {
      await apiFetch(apiBase, userId, "/chat/", {
        method: "POST",
        body: JSON.stringify({
          agent_id: binding.agentId,
          session_id: sessionId,
          input: userMsg,
        }),
      });
    } catch (err) {
      activeAbort.abort();
      await streamTask.catch(() => {});
      const tb = runtime.ensureTextBlock();
      tb.streaming = false;
      tb.markdown = false;
      tb.text = wrapFinstepPublicText(
        opts.errorText || `暂时无法连接 Finstep 分析服务（${err?.message || "网络错误"}）。请确认后端已启动。`,
      );
      runtime.getTurnMsg().streaming = false;
      hooks.setStreaming(false);
      hooks.rerender();
      liveCtx = null;
      return { ok: false, error: String(err?.message || err) };
    }

    await waitForTurn(runtime, signal, streamTask, opts);
    runtime.finalize(opts);

    const tb = runtime.findTextBlock();
    if (runtime.state.streamError) {
      liveCtx = null;
      return { ok: false, error: String(runtime.state.streamError?.message || runtime.state.streamError) };
    }
    if (runtime.state.awaitingConfirm) {
      return { ok: true, awaitingConfirm: true, turnComplete: runtime.turnComplete };
    }
    liveCtx = null;
    return { ok: true, text: tb?.text || "" };
  };

  const confirmToolCall = async (toolBlock, confirm, rules = null, opts = {}) => {
    let ctx = liveCtx;
    let runtime = ctx?.runtime;

    if (!ctx?.turn?.replyId && opts.msgIndex != null) {
      const sess = hooks.getSession();
      const msg = sess?.messages?.[opts.msgIndex];
      if (msg?.type === "agent-blocks" && msg.replyId) {
        const manifest = await loadAgentscopeManifest();
        const binding = resolveExpertBinding(manifest, hooks.state);
        if (binding) {
          const { apiBase, userId } = getApiConfig(manifest);
          const sessionId = msg.confirmCtx?.sessionId
            || (await ensureRunnableSession(manifest, binding));
          const turn = {
            replyId: msg.replyId,
            msgIdx: opts.msgIndex,
            blocks: msg.blocks,
          };
          const hooksApi = {
            apiBase,
            userId,
            getSession: hooks.getSession,
            pushAgent: hooks.pushAgent,
            rerender: hooks.rerender,
            scroll: hooks.scroll,
            setStreaming: hooks.setStreaming,
          };
          runtime = createTurnRuntime(turn, hooksApi, sessionId, binding.agentId);
          ctx = {
            apiBase,
            userId,
            sessionId,
            agentId: msg.confirmCtx?.agentId || binding.agentId,
            turn,
            turnComplete: runtime.turnComplete,
            runtime,
          };
        }
      }
    }

    if (!ctx?.turn?.replyId || !runtime) {
      return { ok: false, error: "no_active_turn" };
    }

    const { apiBase, userId, sessionId, agentId, turn } = ctx;
    const event = {
      type: EVT.USER_CONFIRM_RESULT,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      reply_id: turn.replyId,
      confirm_results: [{
        confirmed: confirm,
        tool_call: {
          type: "tool_call",
          id: toolBlock.id,
          name: toolBlock.name,
          input: toolBlock.input || "",
          state: "asking",
          suggested_rules: toolBlock.suggestedRules || [],
        },
        rules: rules ?? null,
      }],
    };

    try {
      activeAbort?.abort();
      activeAbort = new AbortController();
      const signal = activeAbort.signal;

      hooks.setStreaming(true);
      const msg = hooks.getSession()?.messages?.[turn.msgIdx];
      if (msg) msg.awaitingConfirm = false;
      toolBlock.callState = confirm ? "allowed" : "finished";

      liveCtx = { ...ctx, runtime, turnComplete: runtime.turnComplete };
      const streamTask = runtime.consume(signal);

      await apiFetch(apiBase, userId, "/chat/", {
        method: "POST",
        body: JSON.stringify({
          agent_id: agentId,
          session_id: sessionId,
          input: event,
        }),
      });
      hooks.rerender();

      await waitForTurn(runtime, signal, streamTask, opts);
      runtime.finalize(opts);

      const done = runtime.state.finished
        ? { ok: true }
        : await Promise.race([
          runtime.turnComplete,
          new Promise((resolve) => setTimeout(() => resolve({ ok: false, timeout: true }), 5000)),
        ]);

      liveCtx = runtime.state.awaitingConfirm ? liveCtx : null;
      return done;
    } catch (err) {
      return { ok: false, error: String(err?.message || err) };
    }
  };

  return {
    runLiveQuery,
    confirmToolCall,
    abortLive: () => {
      const ctx = liveCtx;
      activeAbort?.abort();
      activeAbort = null;
      if (ctx?.sessionId && ctx?.agentId) {
        void cancelServerRun(ctx.apiBase, ctx.userId, ctx.sessionId, ctx.agentId);
      }
      if (ctx?.runtime) {
        ctx.runtime.finalize({
          emptyText: "已中断。",
          toolsPendingText: "已中断。",
        });
        const msg = ctx.runtime.getTurnMsg();
        msg.streaming = false;
      }
      hooks.setStreaming(false);
      hooks.rerender();
      liveCtx = null;
    },
    loadAgentscopeManifest,
  };
}
