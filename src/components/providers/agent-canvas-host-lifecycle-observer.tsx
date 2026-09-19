import React from "react";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { isNoBackend } from "#/api/backend-registry/active-store";
import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import { useBackendsHealth } from "#/hooks/query/use-backends-health";
import { ExecutionStatus } from "#/types/agent-server/core";
import { useAgentCanvasHost } from "./agent-canvas-host-provider";

/**
 * Emits low-frequency, evidence-backed lifecycle observations for a trusted
 * embedding host. Durable publication, retry, signing, and authorization are
 * intentionally host responsibilities rather than Agent Canvas concerns.
 */
export function AgentCanvasHostLifecycleObserver() {
  const { backend } = useActiveBackend();
  const { emitLifecycleEvent } = useAgentCanvasHost();
  const monitoredBackends = React.useMemo(
    () => (isNoBackend(backend) ? [] : [backend]),
    [backend],
  );
  const backendHealth = useBackendsHealth(monitoredBackends)[backend.id];
  const activeConversation = useActiveConversation();

  const previousHealthRef = React.useRef<{
    backendId: string;
    connected: boolean | null;
  } | null>(null);
  const previousConversationRef = React.useRef<{
    conversationId: string;
    status: ExecutionStatus | null;
  } | null>(null);

  React.useEffect(() => {
    if (isNoBackend(backend)) {
      previousHealthRef.current = null;
      return;
    }

    const connected = backendHealth?.isConnected ?? null;
    const previous = previousHealthRef.current;

    if (!previous || previous.backendId !== backend.id) {
      if (connected === false) {
        emitLifecycleEvent({
          type: "backend_degraded",
          backendId: backend.id,
          errorKind: "health_probe_failed",
        });
      }
      previousHealthRef.current = { backendId: backend.id, connected };
      return;
    }

    if (connected === false && previous.connected !== false) {
      emitLifecycleEvent({
        type: "backend_degraded",
        backendId: backend.id,
        errorKind: "health_probe_failed",
      });
    } else if (connected === true && previous.connected === false) {
      emitLifecycleEvent({
        type: "backend_recovered",
        backendId: backend.id,
      });
    }

    previousHealthRef.current = { backendId: backend.id, connected };
  }, [backend, backendHealth?.isConnected, emitLifecycleEvent]);

  React.useEffect(() => {
    const conversation = activeConversation.data;
    if (!conversation) {
      previousConversationRef.current = null;
      return;
    }

    const previous = previousConversationRef.current;
    const isNewConversation =
      !previous || previous.conversationId !== conversation.id;
    const statusChanged =
      isNewConversation || previous.status !== conversation.execution_status;

    if (isNewConversation) {
      emitLifecycleEvent({
        type: "conversation_ready",
        conversationId: conversation.id,
        backendId: backend.id,
      });
    }

    if (statusChanged) {
      switch (conversation.execution_status) {
        case ExecutionStatus.RUNNING:
          emitLifecycleEvent({
            type: "conversation_running",
            conversationId: conversation.id,
            backendId: backend.id,
          });
          break;
        case ExecutionStatus.PAUSED:
          emitLifecycleEvent({
            type: "conversation_stopped",
            conversationId: conversation.id,
            backendId: backend.id,
          });
          break;
        case ExecutionStatus.ERROR:
        case ExecutionStatus.STUCK:
          emitLifecycleEvent({
            type: "conversation_error",
            conversationId: conversation.id,
            backendId: backend.id,
            errorKind: conversation.execution_status,
          });
          break;
        default:
          break;
      }
    }

    previousConversationRef.current = {
      conversationId: conversation.id,
      status: conversation.execution_status,
    };
  }, [
    activeConversation.data,
    backend.id,
    emitLifecycleEvent,
  ]);

  return null;
}
