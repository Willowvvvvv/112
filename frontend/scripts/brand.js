/**
 * 财跃启明星 · 品牌资源
 * 版本: v1.0 · 2026-06-25
 */

export const BRAND_NAME = "财跃启明星";
export const BRAND_SLOGAN = "做尽调，上财跃启明星";
export const BRAND_FULL_TITLE = "财跃启明星 · 一级市场 AI 尽调平台";

export const BRAND_LOGO_SRC = "./assets/logo-v1.0-20250625.png";

/**
 * @param {string} [className]
 * @param {number} [size]
 */
export function brandLogo(className = "brand-logo", size = 28) {
  return `<img class="${className}" src="${BRAND_LOGO_SRC}" width="${size}" height="${size}" alt="财跃启明星" decoding="async" />`;
}
