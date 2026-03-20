import { parseMermaidMindmap } from "./parseMermaidMindmap.js";
import { toMindElixirData, getBranchColors } from "./toMindElixirData.js";

export function buildMindmapModel(source) {
  try {
    const parsed = parseMermaidMindmap(source);
    const data = toMindElixirData(parsed);
    return {
      ok: true,
      data,
      branchColors: getBranchColors(data),
      error: null,
    };
  } catch (e) {
    return {
      ok: false,
      data: null,
      branchColors: new Map(),
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }
}

