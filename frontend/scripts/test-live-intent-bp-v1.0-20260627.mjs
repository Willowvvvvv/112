/**
 * live-intent 快速初筛：无 BP 时应先拉公开面
 * 版本: v1.0 | 日期: 2026-06-27
 */
import { buildLivePrompt } from "./live-intent-v1.0-20260627.js";

const prompt = buildLivePrompt({
  text: "",
  chatMode: "bp",
  session: { company: "上海某智能科技有限公司" },
});

const checks = [
  [prompt.includes("禁止先向用户索要材料清单"), "应禁止先索要材料"],
  [prompt.includes("风险 scan"), "应包含风险 scan"],
  [prompt.includes("联网搜索"), "应包含联网搜索"],
  [prompt.includes("公开面初步判断"), "应标注公开面初步判断"],
  [prompt.includes("上海某智能科技有限公司"), "应带入会话企业名"],
];

let failed = 0;
for (const [ok, msg] of checks) {
  if (!ok) {
    console.error("FAIL:", msg);
    failed++;
  }
}
if (failed) process.exit(1);
console.log("test-live-intent-bp ok");
