/**
 * 小星用户记忆 -> 雷达/资讯个性化上下文（静态 Demo）
 * 版本: v1.0 | 日期: 2026-06-27
 */
import { STAR_DATA } from "../data/mock-data.js";

export const STAR_MEMORIES_STORAGE_KEY = "xb_star_memories_v1.0_20260627";
export const STAR_MEMORIES_UPDATED_EVENT = "xb:star-memories-updated";
export const RADAR_PROFILE_KEY = "xinbao_user_profile_v1";

const KNOWN_RADAR_SECTORS = [
  "医疗器械",
  "航空MRO",
  "新能源",
  "半导体",
  "生物医药",
  "先进制造",
];

export function loadStarMemoriesFromStorage() {
  try {
    const raw = localStorage.getItem(STAR_MEMORIES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    return null;
  }
}

export function saveStarMemoriesToStorage(memories) {
  localStorage.setItem(STAR_MEMORIES_STORAGE_KEY, JSON.stringify(memories));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STAR_MEMORIES_UPDATED_EVENT));
  }
}

export function defaultStarMemories() {
  return [...(STAR_DATA?.memories || [])];
}

export function parseFocusSectorsFromMemories(memories) {
  const found = new Set();
  for (const mem of memories) {
    const m = String(mem).match(/^关注赛道[：:]\s*(.+)$/);
    if (m?.[1]) {
      m[1].split(/[、,，]/).map((s) => s.trim()).filter(Boolean).forEach((s) => found.add(s));
    }
    for (const sector of KNOWN_RADAR_SECTORS) {
      if (String(mem).includes(sector)) found.add(sector);
    }
  }
  return [...found];
}

export function buildRadarUserContext() {
  const memories = loadStarMemoriesFromStorage() || defaultStarMemories();
  let profileSectors = [];
  let profileNote = "";
  try {
    const profileRaw = localStorage.getItem(RADAR_PROFILE_KEY);
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      profileSectors = Array.isArray(profile.sectors) ? profile.sectors : [];
      profileNote = (profile.focusNotes || profile.ddFocus || "").trim();
    }
  } catch { /* ignore */ }

  const fromMemories = parseFocusSectorsFromMemories(memories);
  const focus_sectors = [...new Set([...profileSectors, ...fromMemories])];
  const memoryNotes = memories.filter((m) => !/^关注赛道[：:]/.test(m)).join("；");
  const user_note = profileNote || memoryNotes || null;
  return {
    focus_sectors,
    user_note,
    user_memories: memories,
  };
}
