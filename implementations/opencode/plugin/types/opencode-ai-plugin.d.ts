declare module "@opencode-ai/plugin" {
  export interface SessionSummary {
    files?: number
  }

  export interface SessionTime {
    created?: number
    updated?: number
  }

  export interface SessionRecord {
    id?: string
    title?: string
    projectID?: string
    summary?: SessionSummary
    time?: SessionTime
    [key: string]: unknown
  }

  export interface SessionRequest {
    path?: Record<string, unknown>
    body?: Record<string, unknown>
    query?: Record<string, unknown>
  }

  export interface SessionResponse<T = any> {
    data?: T
  }

  export interface SessionApi {
    create(request: SessionRequest): Promise<SessionResponse>
    get(request: SessionRequest): Promise<SessionResponse<SessionRecord>>
    list(request?: SessionRequest): Promise<SessionResponse<SessionRecord[]>>
    delete(request: SessionRequest): Promise<SessionResponse>
    update(request: SessionRequest): Promise<SessionResponse>
    status(request: SessionRequest): Promise<SessionResponse>
    todo(request: SessionRequest): Promise<SessionResponse>
    messages(request: SessionRequest): Promise<SessionResponse>
    summarize(request: SessionRequest): Promise<SessionResponse>
    promptAsync(request: SessionRequest): Promise<SessionResponse>
    abort(request: SessionRequest): Promise<SessionResponse>
  }

  export interface PluginClient {
    session: SessionApi
  }

  export interface PluginEventInput {
    event: {
      type: string
      properties?: unknown
    }
  }

  export interface PluginInput {
    client: PluginClient
    $: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>
  }

  export interface PluginToolInput {
    tool: {
      type: string
      name?: string
      input?: Record<string, unknown>
      output?: string
    }
  }

  export type Plugin =
    | ((input: PluginInput) => Promise<PluginHooks> | PluginHooks)
    | PluginHooks

  export interface PluginHooks {
    event?(input: PluginEventInput): Promise<void> | void
    tool?(input: PluginToolInput): Promise<void> | void
  }
}
