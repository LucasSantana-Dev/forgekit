declare module "fs" {
  export function existsSync(path: string): boolean
  export function mkdirSync(path: string, options?: Record<string, unknown>): void
  export function readFileSync(path: string, encoding?: string): string
  export function writeFileSync(path: string, data: string): void
  export function unlinkSync(path: string): void
  export function readdirSync(path: string): string[]
}

declare module "path" {
  export function join(...parts: string[]): string
}

declare module "child_process" {
  export function execFileSync(
    file: string,
    args?: string[],
  ): string | Buffer
}

declare const process: {
  env: Record<string, string | undefined>
}
