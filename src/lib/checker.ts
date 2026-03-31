export interface CheckResult {
  status: "up" | "down" | "degraded";
  responseTime: number;
  statusCode: number | null;
  error: string | null;
}

export async function checkEndpoint(url: string, type: string): Promise<CheckResult> {
  const timeout = 5000;
  const start = Date.now();

  try {
    if (type === "mcp") return await checkMcp(url, timeout, start);
    if (type === "acp") return await checkAcp(url, timeout, start);
    return await checkHttp(url, timeout, start);
  } catch (err: unknown) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      statusCode: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkHttp(url: string, timeout: number, start: number): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal, method: "GET", redirect: "follow" });
    const responseTime = Date.now() - start;
    return {
      status: res.ok ? "up" : (res.status >= 500 ? "down" : "degraded"),
      responseTime,
      statusCode: res.status,
      error: res.ok ? null : `HTTP ${res.status}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkMcp(url: string, timeout: number, start: number): Promise<CheckResult> {
  // MCP SSE: try to connect and get initial response
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/event-stream" },
    });
    const responseTime = Date.now() - start;
    return {
      status: res.ok ? "up" : "down",
      responseTime,
      statusCode: res.status,
      error: res.ok ? null : `MCP SSE ${res.status}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkAcp(url: string, timeout: number, start: number): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const responseTime = Date.now() - start;
    if (!res.ok) return { status: "down", responseTime, statusCode: res.status, error: `HTTP ${res.status}` };
    const body = await res.json();
    // Basic ACP manifest validation
    const valid = body && (body.name || body.agent_card || body.capabilities);
    return {
      status: valid ? "up" : "degraded",
      responseTime,
      statusCode: res.status,
      error: valid ? null : "Invalid ACP manifest structure",
    };
  } finally {
    clearTimeout(timer);
  }
}
