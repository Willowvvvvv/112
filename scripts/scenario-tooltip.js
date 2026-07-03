/**
 * 全部场景卡片描述浮层（fixed 定位，避免被弹窗 overflow 裁切）
 * 版本：v1.0.0 · 2026-06-26
 */

let tipEl = null;
let bound = false;
let activeCard = null;

function ensureTipEl() {
  if (tipEl) return tipEl;
  tipEl = document.createElement("div");
  tipEl.className = "scenario-tip-float";
  tipEl.setAttribute("role", "tooltip");
  tipEl.hidden = true;
  document.body.appendChild(tipEl);
  return tipEl;
}

function positionTip(card, text) {
  const el = ensureTipEl();
  el.textContent = text;
  el.hidden = false;
  activeCard = card;

  const rect = card.getBoundingClientRect();
  const margin = 8;
  const maxW = Math.min(300, window.innerWidth - 24);
  el.style.maxWidth = `${maxW}px`;
  el.style.left = "0";
  el.style.top = "0";

  const tipRect = el.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tipRect.width / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - tipRect.width - 12));

  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const showAbove = spaceBelow < tipRect.height + margin && spaceAbove >= spaceBelow;

  const top = showAbove
    ? rect.top - tipRect.height - margin
    : rect.bottom + margin;

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.classList.toggle("scenario-tip-float--above", showAbove);
}

export function hideScenarioTooltip() {
  if (tipEl) tipEl.hidden = true;
  activeCard = null;
}

function refreshActiveTip() {
  if (!activeCard || !tipEl || tipEl.hidden) return;
  const tip = activeCard.getAttribute("data-tip");
  if (!tip) {
    hideScenarioTooltip();
    return;
  }
  positionTip(activeCard, tip);
}

export function bindScenarioTooltips() {
  if (bound) return;
  bound = true;

  document.addEventListener("mouseover", (e) => {
    const card = e.target.closest?.(".scenario-card--with-desc[data-tip]");
    if (card) {
      const tip = card.getAttribute("data-tip");
      if (tip) positionTip(card, tip);
      return;
    }
    if (!e.target.closest?.(".scenario-tip-float")) hideScenarioTooltip();
  });

  document.addEventListener("focusin", (e) => {
    const card = e.target.closest?.(".scenario-card--with-desc[data-tip]");
    if (!card) return;
    const tip = card.getAttribute("data-tip");
    if (tip) positionTip(card, tip);
  });

  document.addEventListener("focusout", (e) => {
    const card = e.target.closest?.(".scenario-card--with-desc[data-tip]");
    if (!card) return;
    hideScenarioTooltip();
  });

  document.addEventListener("scroll", () => hideScenarioTooltip(), true);
  window.addEventListener("resize", refreshActiveTip);
}
