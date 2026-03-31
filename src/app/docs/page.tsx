export const metadata = {
  title: "API Docs — AgentPulse",
  description: "AgentPulse REST API documentation. Register endpoints, run health checks, manage webhooks, and embed uptime badges.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/endpoints",
    desc: "List all monitored endpoints",
    response: '[{ "id": "...", "name": "OpenAI API", "url": "https://api.openai.com/v1/models", "type": "http", "slug": "openai-api" }]',
  },
  {
    method: "POST",
    path: "/api/endpoints",
    desc: "Register a new endpoint",
    body: '{ "name": "My Agent", "url": "https://agent.example.com/health", "type": "http|mcp|acp", "slug": "my-agent" }',
    response: '{ "id": "...", "name": "My Agent", "slug": "my-agent" }',
  },
  {
    method: "DELETE",
    path: "/api/endpoints/:id",
    desc: "Remove an endpoint",
    response: '{ "deleted": true }',
  },
  {
    method: "POST",
    path: "/api/endpoints/check",
    desc: "Trigger an immediate health check",
    body: '{ "endpoint_id": "..." }',
    response: '{ "endpoint": "My Agent", "status": "up", "responseTime": 142, "statusCode": 200 }',
  },
  {
    method: "GET",
    path: "/api/status/:slug",
    desc: "Get endpoint status, uptime %, checks, and incidents",
    response: '{ "endpoint": {...}, "status": "up", "uptimePercent": 99.87, "avgResponseTime": 142, "checks": [...], "incidents": [...] }',
  },
  {
    method: "GET",
    path: "/api/badge/:slug",
    desc: "SVG uptime badge (embed in READMEs)",
    response: "SVG image (image/svg+xml)",
  },
  {
    method: "GET",
    path: "/api/endpoints/:id/checks",
    desc: "Get check history for an endpoint (last 288 checks)",
    response: '[{ "id": "...", "status": "up", "response_time": 142, "checked_at": "2026-03-31 05:00:00" }]',
  },
  {
    method: "POST",
    path: "/api/webhooks",
    desc: "Register a webhook for incident alerts",
    body: '{ "url": "https://hooks.example.com/alert", "endpoint_id": null, "events": "incident.created,incident.resolved" }',
    response: '{ "id": "...", "url": "...", "events": "..." }',
  },
  {
    method: "POST",
    path: "/api/waitlist",
    desc: "Join the Pro/Team waitlist",
    body: '{ "email": "you@company.com", "plan": "pro" }',
    response: '{ "success": true }',
  },
  {
    method: "POST",
    path: "/api/seed",
    desc: "Seed demo endpoints (5 popular APIs)",
    response: '{ "seeded": ["OpenAI API", "Anthropic API", ...] }',
  },
];

const methodColor: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">📡 API Documentation</h1>
        <p className="text-zinc-400 mb-2">Base URL: <code className="text-emerald-400 bg-zinc-800 px-2 py-0.5 rounded text-sm">https://agentpulse-woad.vercel.app</code></p>
        <p className="text-zinc-500 text-sm mb-12">All endpoints return JSON. No authentication required for beta.</p>

        <div className="space-y-6">
          {endpoints.map((ep, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                <span className={`text-xs font-bold px-2.5 py-1 rounded border ${methodColor[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-zinc-200">{ep.path}</code>
                <span className="text-zinc-500 text-sm ml-auto">{ep.desc}</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                {ep.body && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Request Body</p>
                    <pre className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto">{ep.body}</pre>
                  </div>
                )}
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Response</p>
                  <pre className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto">{ep.response}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-4">🏷️ Badge Embed</h2>
          <p className="text-zinc-400 text-sm mb-4">Add uptime badges to your README or documentation:</p>
          <pre className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto mb-4">
{`<!-- Markdown -->
![uptime](https://agentpulse-woad.vercel.app/api/badge/your-slug)

<!-- HTML -->
<img src="https://agentpulse-woad.vercel.app/api/badge/your-slug" alt="uptime" />`}
          </pre>
        </div>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-4">🔔 Webhook Payload</h2>
          <p className="text-zinc-400 text-sm mb-4">When an incident is detected or resolved, we POST to your webhook URL:</p>
          <pre className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto">
{`{
  "event": "incident.created",
  "endpoint": {
    "name": "OpenAI API",
    "url": "https://api.openai.com/v1/models",
    "slug": "openai-api"
  },
  "incident": {
    "id": "abc-123",
    "started_at": "2026-03-31T05:00:00Z",
    "type": "downtime"
  },
  "timestamp": "2026-03-31T05:00:00Z"
}`}
          </pre>
        </div>

        <footer className="mt-16 text-center text-zinc-600 text-xs">
          AgentPulse API Docs · <a href="/" className="text-emerald-400 hover:underline">Home</a> · <a href="/dashboard" className="text-emerald-400 hover:underline">Dashboard</a>
        </footer>
      </div>
    </main>
  );
}
