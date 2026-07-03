/**
 * expert-dropdown — 输入框浮层挂载与事件委托（专家 / 技能 / 引用）
 * 版本: v1.2 | 日期: 2026-06-27
 */
import { positionComposerPopovers } from "./composer-popovers.js";

function removeBodyPopoverLayers() {
  document.body.querySelectorAll(".composer-popover-layer").forEach((el) => el.remove());
}

/**
 * 将专家浮层挂到 body，避免 shell 内层叠/overflow 拦截点击与滚动
 */
export function mountExpertPopoverLayer() {
  removeBodyPopoverLayers();
  const layer = document.querySelector(".composer-popover-layer");
  if (!layer) return null;
  document.body.appendChild(layer);
  return layer;
}

/**
 * @param {HTMLElement | null} layer
 * @param {Record<string, Function>} actions
 */
export function wireExpertPopoverLayer(layer, actions) {
  if (!layer) return;

  layer.addEventListener("click", (e) => {
    if (e.target.closest(".composer-popover-backdrop")) {
      e.preventDefault();
      actions.closeExpertMenu?.();
      actions.closeComposerMenu?.();
      return;
    }
    const toggle = e.target.closest("[data-expert-multi-toggle]");
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      const on = toggle.getAttribute("aria-checked") === "true";
      actions.toggleMultiExpertDiscussion?.(!on);
      return;
    }
    const item = e.target.closest("[data-expert-id]");
    if (item?.dataset.expertId) {
      e.preventDefault();
      e.stopPropagation();
      actions.selectExpert?.(item.dataset.expertId);
      return;
    }
    if (e.target.closest("[data-expert-clear]")) {
      e.preventDefault();
      e.stopPropagation();
      actions.clearExpertSelection?.();
    }
  });
}

/**
 * @param {Record<string, Function>} actions
 */
/** @param {Record<string, Function>} actions */
export function syncComposerPopovers(actions) {
  const layer = mountExpertPopoverLayer();
  if (!layer) return;
  wireExpertPopoverLayer(layer, actions);
  requestAnimationFrame(() => {
    positionComposerPopovers();
    requestAnimationFrame(() => positionComposerPopovers());
  });
}

/** @deprecated 使用 syncComposerPopovers */
export const syncExpertPopover = syncComposerPopovers;

export function teardownExpertPopover() {
  removeBodyPopoverLayers();
}
