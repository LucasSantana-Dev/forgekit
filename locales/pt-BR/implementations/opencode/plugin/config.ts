import { readFileSync, existsSync } from "fs"
import { join } from "path"

export interface AutopilotConfig {
  maxConcurrent: number
  pollIntervalMs: number
  bootDelayMs: number
  dailyTaskLimit: number
  maxTasksPerPlan: number
  idleThresholdMs: number
  staleThresholdMs: number
  maxSessionsPerProject: number
  compactAfterMessages: number
  autoDispatch: boolean
  notifications: {
    onComplete: boolean
    onBlocked: boolean
    onPush: boolean
    sound: boolean
  }
}

const DEFAULTS: AutopilotConfig = {
  maxConcurrent: 2,
  pollIntervalMs: 60_000,
  bootDelayMs: 12_000,
  dailyTaskLimit: 10,
  maxTasksPerPlan: 15,
  idleThresholdMs: 2 * 60 * 60 * 1000,
  staleThresholdMs: 24 * 60 * 60 * 1000,
  maxSessionsPerProject: 3,
  compactAfterMessages: 20,
  autoDispatch: true,
  notifications: {
    onComplete: true,
    onBlocked: true,
    onPush: false,
    sound: false,
  },
}

export function loadConfig(stateDir: string): AutopilotConfig {
  const configFile = join(stateDir, "config.json")
  if (!existsSync(configFile)) return DEFAULTS
  try {
    const userConfig = JSON.parse(readFileSync(configFile, "utf-8"))
    return { ...DEFAULTS, ...userConfig }
  } catch {
    return DEFAULTS
  }
}
