import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { EarnConfig } from "../types/index.ts";
import { CONFIG_FILE } from "../constants.ts";

function getConfigPath(): string {
  return join(homedir(), CONFIG_FILE);
}

export function loadConfig(): EarnConfig {
  const path = getConfigPath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as EarnConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: EarnConfig): void {
  const path = getConfigPath();
  const existing = loadConfig();
  const merged = { ...existing, ...config };
  writeFileSync(path, JSON.stringify(merged, null, 2), "utf-8");
}

export function getConfigValue(key: keyof EarnConfig): string | undefined {
  const config = loadConfig();
  return config[key];
}
