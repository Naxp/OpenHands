import React from "react";
import {
  getManagedHostContext,
  isManagedHostMode,
  type AgentCanvasManagedHostContext,
} from "#/api/managed-host-config";

export type AgentCanvasHostNavigationAction =
  | "back"
  | "open_external"
  | "close_workspace"
  | "archive_workspace";

export interface AgentCanvasHostNavigationTarget {
  /**
   * Host-defined target family, for example "editor", "finding", or "task".
   * Agent Canvas does not interpret this value.
   */
  kind: string;
  id?: string;
  href?: string;
}

export interface AgentCanvasHostNavigationRequest {
  action: AgentCanvasHostNavigationAction;
  target?: AgentCanvasHostNavigationTarget;
}

export type AgentCanvasHostLifecycleEventType =
  | "conversation_created"
  | "conversation_ready"
  | "conversation_running"
  | "conversation_stopped"
  | "conversation_error"
  | "candidate_available"
  | "backend_degraded"
  | "backend_recovered"
  | "workspace_close_requested"
  | "workspace_archive_requested";

export interface AgentCanvasHostLifecycleEvent {
  type: AgentCanvasHostLifecycleEventType;
  conversationId?: string;
  backendId?: string;
  candidateId?: string;
  errorKind?: string;
}

export interface AgentCanvasHostBridge {
  /**
   * Public, bounded host context. When omitted, the provider reads the
   * runtime-injected managed-host context once at mount.
   */
  context?: AgentCanvasManagedHostContext | null;
  /**
   * Generic navigation handoff owned by the embedding host. Agent Canvas does
   * not know or hard-code product URLs such as an editor or assurance system.
   */
  navigate?: (
    request: AgentCanvasHostNavigationRequest,
  ) => void | Promise<void>;
  /**
   * Low-frequency lifecycle observations. The embedding host decides whether
   * and how these become durable events.
   */
  onLifecycleEvent?: (event: AgentCanvasHostLifecycleEvent) => void;
}

export interface AgentCanvasHostContextValue {
  context: AgentCanvasManagedHostContext | null;
  navigate: AgentCanvasHostBridge["navigate"] | null;
  emitLifecycleEvent: (event: AgentCanvasHostLifecycleEvent) => void;
}

export const AGENT_CANVAS_HOST_NAVIGATION_EVENT =
  "agent-canvas:host-navigation";
export const AGENT_CANVAS_HOST_LIFECYCLE_EVENT =
  "agent-canvas:host-lifecycle";

function dispatchManagedHostEvent<T>(name: string, detail: T): void {
  if (!isManagedHostMode() || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function defaultManagedHostNavigate(
  request: AgentCanvasHostNavigationRequest,
): void {
  dispatchManagedHostEvent(AGENT_CANVAS_HOST_NAVIGATION_EVENT, request);
}

function defaultManagedHostLifecycle(
  event: AgentCanvasHostLifecycleEvent,
): void {
  dispatchManagedHostEvent(AGENT_CANVAS_HOST_LIFECYCLE_EVENT, event);
}

const AgentCanvasHostContext =
  React.createContext<AgentCanvasHostContextValue>({
    context: null,
    navigate: null,
    emitLifecycleEvent: defaultManagedHostLifecycle,
  });

export function AgentCanvasHostProvider({
  value,
  children,
}: {
  value?: AgentCanvasHostBridge;
  children: React.ReactNode;
}) {
  const runtimeContext = React.useMemo(() => getManagedHostContext(), []);

  const resolved = React.useMemo<AgentCanvasHostContextValue>(
    () => ({
      context: value?.context === undefined ? runtimeContext : value.context,
      navigate:
        value?.navigate ?? (isManagedHostMode() ? defaultManagedHostNavigate : null),
      emitLifecycleEvent:
        value?.onLifecycleEvent ?? defaultManagedHostLifecycle,
    }),
    [runtimeContext, value?.context, value?.navigate, value?.onLifecycleEvent],
  );

  return (
    <AgentCanvasHostContext.Provider value={resolved}>
      {children}
    </AgentCanvasHostContext.Provider>
  );
}

export function useAgentCanvasHost(): AgentCanvasHostContextValue {
  return React.useContext(AgentCanvasHostContext);
}

export function useAgentCanvasHostContext(): AgentCanvasManagedHostContext | null {
  return useAgentCanvasHost().context;
}
