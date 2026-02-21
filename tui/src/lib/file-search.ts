import { readdir } from "node:fs/promises";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".rst", ".pdf"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".idea",
  ".vscode",
]);
const MAX_DISCOVERED_FILES = 5000;

type FileCache = {
  cwd: string;
  files: string[];
};

let cache: FileCache | null = null;

export async function searchSupportedFiles(query: string, cwd = process.cwd(), limit = 8): Promise<string[]> {
  const files = await loadFiles(cwd);
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return files.slice(0, limit);
  }

  const ranked = files
    .filter((file) => file.toLowerCase().includes(needle))
    .map((file) => ({ file, score: scoreFile(file, needle) }))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      const aDepth = a.file.split("/").length;
      const bDepth = b.file.split("/").length;
      if (aDepth !== bDepth) {
        return aDepth - bDepth;
      }
      return a.file.localeCompare(b.file);
    });

  return ranked.slice(0, limit).map((entry) => entry.file);
}

function scoreFile(file: string, needle: string): number {
  const normalized = file.toLowerCase();
  const basename = path.basename(normalized);
  if (basename === needle) {
    return 0;
  }
  if (basename.startsWith(needle)) {
    return 1;
  }
  if (normalized.startsWith(needle)) {
    return 2;
  }
  return 3;
}

async function loadFiles(cwd: string): Promise<string[]> {
  if (cache && cache.cwd === cwd) {
    return cache.files;
  }

  const files: string[] = [];
  await collectFiles(cwd, cwd, files);
  cache = { cwd, files };
  return files;
}

async function collectFiles(root: string, dir: string, output: string[]): Promise<void> {
  if (output.length >= MAX_DISCOVERED_FILES) {
    return;
  }

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (output.length >= MAX_DISCOVERED_FILES) {
      return;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      await collectFiles(root, fullPath, output);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }

    output.push(path.relative(root, fullPath));
  }
}
