/**
 * composer-popovers.js — 输入框浮层 fixed 定位（专家 / 技能 / 引用）
 * 版本：v1.3-20260627
 */

/** 将浮层对齐到触发按钮，使用 fixed + body 挂载避免被裁切与点击拦截 */
export function positionComposerPopovers() {
  const pairs = [
    ["expert-selector-trigger", "expert-dropdown-float", { maxHeight: 400 }],
    ["composer-skill-trigger", "composer-menu-skill", { maxHeight: 280 }],
    ["composer-cite-trigger", "composer-menu-cite", { maxHeight: 280 }],
  ];
  const margin = 8;
  const gap = 6;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  for (const [anchorId, popoverId, opts] of pairs) {
    const anchor = document.getElementById(anchorId);
    const popover = document.getElementById(popoverId);
    if (!anchor || !popover) continue;

    const anchorRect = anchor.getBoundingClientRect();
    const maxH = opts.maxHeight || 400;
    popover.style.width = `${Math.min(360, vw - margin * 2)}px`;
    popover.style.maxHeight = `${Math.min(maxH, vh - margin * 2)}px`;

    const popW = popover.offsetWidth || Math.min(320, vw - margin * 2);
    let popH = popover.offsetHeight;
    if (!popH) popH = Math.min(maxH, vh - margin * 2);

    let left = anchorRect.left;
    left = Math.max(margin, Math.min(left, vw - popW - margin));

    const spaceBelow = vh - anchorRect.bottom - gap - margin;
    const spaceAbove = anchorRect.top - gap - margin;
    const openUp = spaceBelow < Math.min(popH, maxH) && spaceAbove > spaceBelow;

    let top;
    const targetH = Math.min(popH, maxH, openUp ? spaceAbove : spaceBelow);
    if (openUp) {
      top = anchorRect.top - targetH - gap;
      if (top < margin) top = margin;
    } else {
      top = anchorRect.bottom + gap;
      if (top + targetH > vh - margin) top = Math.max(margin, vh - targetH - margin);
    }

    popover.style.top = `${Math.round(top)}px`;
    popover.style.left = `${Math.round(left)}px`;
    popover.style.visibility = "visible";
  }
}
