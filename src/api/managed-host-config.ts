/**
 * Runtime contract for embedding Agent Canvas behind a trusted host/BFF.
 *
 * Managed-host configuration is intentionally browser-visible. It MUST contain
 * identifiers and presentation context only — never Agent Server API keys,
 * service credentials, signing material, deployment credentials, or other
 * secrets.
 *
 * A hosting server may inject this object before the application bundle loads:
 *
 *   window.__AGENT_CANVAS_MANAGED_HOST__ = {
 *     version: 1,
 *     backend: { id: "ran-gateway", name: "RAN Workspace" },
 *     context: { launchId: "...", repository: "owner/repo", baseSha: "..." }
 *   }
 *
 * When present, Agent Canvas treats the backend as host-owned. Browser requests
 * may be credential-less because the same-origin host/BFF is responsible for
 * authenticating the user and injecting any private downstream credential.
 */

export interface AgentCanvasManagedHostActor {
  id: string;
  displayName?: string;
  roles?: string[];
}

export interface AgentCanvasManagedHostContext {
  launchId?: string;
  traceId?: string;
  projectId?: string;
  siteId?: string;
  repository?: string;
  branch?: string;
  baseSha?: string;
  /** Absolute workspace root selected by the trusted host. */
  workingDir?: string;
  agentProfileId?: string;
  capabilityProfile?: string;
  contextGeneration?: string;
  actor?: AgentCanvasManagedHostActor;
}

export interface AgentCanvasManagedHostBackend {
  id?: string;
  name?: string;
  /**
   * Browser-facing Agent Server/BFF base URL. Omit for same-origin.
   * This value is public runtime configuration, not an internal backend URL.
   */
  baseUrl?: string;
}

export interface AgentCanvasManagedHostConfig {
  version: 1;
  backend?: AgentCanvasManagedHostBackend;
  context?: AgentCanvasManagedHostContext;
}

const MANAGED_HOST_WINDOW_KEY = "__AGENT_CANVAS_MANAGED_HOST__";
const DEFAULT_MANAGED_BACKEND_ID = "managed-host";
const DEFAULT_MANAGED_BACKEND_NAME = "Managed Workspace";

function cleanString(value: unknown, maxLength = 2048): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function cleanStringArray(
  value: unknown,
  maxItems = 64,
  maxLength = 256,
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const cleaned = value
    .slice(0, maxItems)
    .map((item) => cleanString(item, maxLength))
    .filter((item): item is string => Boolean(item));

  return cleaned.length > 0 ? cleaned : undefined;
}

function parseActor(value: unknown): AgentCanvasManagedHostActor | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const actor = value as Record<string, unknown>;
  const id = cleanString(actor.id, 512);
  if (!id) return undefined;

  return {
    id,
    ...(cleanString(actor.displayName, 512)
      ? { displayName: cleanString(actor.displayName, 512) }
      : {}),
    ...(cleanStringArray(actor.roles) ? { roles: cleanStringArray(actor.roles) } : {}),
  };
}

function parseContext(value: unknown): AgentCanvasManagedHostContext | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const context = value as Record<string, unknown>;

  const parsed: AgentCanvasManagedHostContext = {
    ...(cleanString(context.launchId, 512)
      ? { launchId: cleanString(context.launchId, 512) }
      : {}),
    ...(cleanString(context.traceId, 512)
      ? { traceId: cleanString(context.traceId, 512) }
      : {}),
    ...(cleanString(context.projectId, 512)
      ? { projectId: cleanString(context.projectId, 512) }
      : {}),
    ...(cleanString(context.siteId, 512)
      ? { siteId: cleanString(context.siteId, 512) }
      : {}),
    ...(cleanString(context.repository, 1024)
      ? { repository: cleanString(context.repository, 1024) }
      : {}),
    ...(cleanString(context.branch, 1024)
      ? { branch: cleanString(context.branch, 1024) }
      : {}),
    ...(cleanString(context.baseSha, 128)
      ? { baseSha: cleanString(context.baseSha, 128) }
      : {}),
    ...(cleanString(context.workingDir, 2048)
      ? { workingDir: cleanString(context.workingDir, 2048) }
      : {}),
    ...(cleanString(context.agentProfileId, 512)
      ? { agentProfileId: cleanString(context.agentProfileId, 512) }
      : {}),
    ...(cleanString(context.capabilityProfile, 512)
      ? { capabilityProfile: cleanString(context.capabilityProfile, 512) }
      : {}),
    ...(cleanString(context.contextGeneration, 512)
      ? { contextGeneration: cleanString(context.contextGeneration, 512) }
      : {}),
    ...(parseActor(context.actor) ? { actor: parseActor(context.actor) } : {}),
  };

  return Object.keys(parsed).length > 0 ? parsed : undefined;
}

function normalizeBrowserBaseUrl(value: unknown): string | undefined {
  const raw = cleanString(value);
  if (!raw) return undefined;

  try {
    if (typeof window !== "undefined") {
      const resolved = new URL(raw, window.location.origin);
      return resolved.toString().replace(/\/$/, "");
    }

    if (/^https?:\/\//i.test(raw)) {
      return raw.replace(/\/$/, "");
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function parseManagedHostConfig(
  value: unknown,
): AgentCanvasManagedHostConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1) return null;

  const backendRaw =
    typeof raw.backend === "object" && raw.backend !== null
      ? (raw.backend as Record<string, unknown>)
      : null;

  const backend: AgentCanvasManagedHostBackend | undefined = backendRaw
    ? {
        ...(cleanString(backendRaw.id, 512)
          ? { id: cleanString(backendRaw.id, 512) }
          : {}),
        ...(cleanString(backendRaw.name, 512)
          ? { name: cleanString(backendRaw.name, 512) }
          : {}),
        ...(normalizeBrowserBaseUrl(backendRaw.baseUrl)
          ? { baseUrl: normalizeBrowserBaseUrl(backendRaw.baseUrl) }
          : {}),
      }
    : undefined;

  return {
    version: 1,
    ...(backend && Object.keys(backend).length > 0 ? { backend } : {}),
    ...(parseContext(raw.context) ? { context: parseContext(raw.context) } : {}),
  };
}

export function getManagedHostConfig(): AgentCanvasManagedHostConfig | null {
  if (typeof window === "undefined") return null;

  return parseManagedHostConfig(
    (window as unknown as Record<string, unknown>)[MANAGED_HOST_WINDOW_KEY],
  );
}

export function isManagedHostMode(): boolean {
  return getManagedHostConfig() !== null;
}

export function getManagedHostBackendId(): string {
  return getManagedHostConfig()?.backend?.id ?? DEFAULT_MANAGED_BACKEND_ID;
}

export function getManagedHostBackendName(): string {
  return getManagedHostConfig()?.backend?.name ?? DEFAULT_MANAGED_BACKEND_NAME;
}

export function getManagedHostBackendBaseUrl(): string | null {
  const configured = getManagedHostConfig()?.backend?.baseUrl;
  if (configured) return configured;

  return typeof window !== "undefined" ? window.location.origin : null;
}

export function getManagedHostContext(): AgentCanvasManagedHostContext | null {
  return getManagedHostConfig()?.context ?? null;
}
