"use client";

import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ArchitectureDiagramProps = {
  type: "payments" | "identity";
};

type NodeType = "internal" | "external";

export type NodeMeta = {
  title: string;
  description: string;
  risks?: string[];
  invariants?: string[];
};

type DiagramConfig = {
  nodes: Record<string, NodeMeta>;
  flows: string[][];
};

type DiagramContextValue = {
  config: DiagramConfig;
  highlightedFlowIndices: Set<number>;
  getFlowIndicesForNode: (nodeId: string) => number[];
  setHighlightedFromNode: (nodeId: string | null) => void;
  getMeta: (nodeId: string) => NodeMeta | undefined;
};

const DiagramContext = createContext<DiagramContextValue | null>(null);

function useDiagram() {
  const ctx = useContext(DiagramContext);
  if (!ctx) throw new Error("Node/Arrow must be used inside ArchitectureDiagram");
  return ctx;
}

const PAYMENTS_CONFIG: DiagramConfig = {
  nodes: {
    client: {
      title: "Client",
      description: "Initiates payment requests. Must be authenticated and authorized for the operation.",
      risks: ["Untrusted input", "Session hijacking"],
      invariants: ["Request must be idempotent-keyed when applicable"],
    },
    api: {
      title: "API",
      description: "Orchestrates the payment flow, validates input, and calls the payment provider.",
      risks: ["Injection", "Replay if idempotency missing"],
      invariants: ["Idempotency enforced for payment creation", "Idempotency key scoped per client"],
    },
    "payment-provider": {
      title: "Payment Provider",
      description: "External PSP. Processes payment and sends async confirmation via webhook.",
      risks: ["Provider downtime", "Webhook delay or loss"],
      invariants: ["Webhook must be verified with signature", "One-to-one mapping webhook → intent"],
    },
    webhook: {
      title: "Webhook",
      description: "Receives async callbacks from the provider. Verifies signature and updates state.",
      risks: ["Replay", "Forged webhooks if verification is weak"],
      invariants: ["Signature verification mandatory", "Idempotent processing by provider event id"],
    },
    database: {
      title: "Database",
      description: "Persistent store for payment state and idempotency records.",
      risks: ["Consistency under failure", "Schema drift"],
      invariants: ["Transactions for state transitions", "Idempotency keys stored and checked"],
    },
  },
  flows: [
    ["client", "api", "payment-provider"],
    ["payment-provider", "webhook", "database"],
  ],
};

const IDENTITY_CONFIG: DiagramConfig = {
  nodes: {
    client: {
      title: "Client",
      description: "Requests identity verification. Trust boundary starts here.",
      risks: ["Impersonation", "Token leakage"],
      invariants: ["Consent and scope bounded by policy"],
    },
    "identity-gateway": {
      title: "Identity Gateway",
      description: "Validates requests and routes to national APIs or internal services.",
      risks: ["Misconfiguration", "Audit gaps"],
      invariants: ["All calls logged and auditable", "Token scope enforced"],
    },
    token: {
      title: "Token",
      description: "Issued after verification. Used for downstream access.",
      risks: ["Theft", "Over-scoped claims"],
      invariants: ["Short-lived", "Least privilege scopes"],
    },
    "internal-services": {
      title: "Internal Services",
      description: "Consume identity tokens for authorization decisions.",
      risks: ["Token misuse", "Cache poisoning"],
      invariants: ["Validate token on every critical path", "No PII in logs"],
    },
    "national-apis": {
      title: "National APIs",
      description: "External government or identity providers. Trust boundary.",
      risks: ["Availability", "Schema changes", "Data residency"],
      invariants: ["Adapter layer for normalization", "Strict data minimization"],
    },
  },
  flows: [
    ["client", "identity-gateway", "token", "internal-services"],
    ["identity-gateway", "national-apis"],
  ],
};

const FLOW_LABEL: Record<"payments" | "identity", string> = {
  payments: "Transactional Flow Overview",
  identity: "Identity Trust Boundary Flow",
};

const SYSTEM_INVARIANTS: Record<"payments" | "identity", string[]> = {
  payments: [
    "A payment intent cannot transition from failed to succeeded.",
    "Reservation \"paid\" is set only after a verified webhook; frontend and redirect cannot set it.",
    "Webhook events are processed idempotently by provider event_id.",
    "Availability for a slot is updated under pessimistic lock (SELECT FOR UPDATE); no optimistic commit.",
    "Idempotency keys are scoped per client and stored; duplicate key returns original response.",
    "Payment and reservation state changes for a webhook occur in a single database transaction.",
  ],
  identity: [
    "Tokens must not contain PII; only claims required for authorization (sub, roles, exp).",
    "\"Verified\" is never issued when verification against national APIs did not succeed.",
    "Only the gateway calls national APIs and issues tokens; services validate tokens only.",
    "Session tokens are short-lived; re-validation on every login.",
    "RBAC is enforced at gateway (route) and at service (resource); no bypass.",
    "All authentication and token issuance events are logged for audit.",
  ],
};

// --- Tooltip (minimal, senior-level) ---

function NodeTooltip({
  nodeId,
  meta,
  visible,
  anchorRef,
}: {
  nodeId: string;
  meta: NodeMeta;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (visible) updatePosition();
  }, [visible, updatePosition]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 -translate-x-1/2 pointer-events-none"
      style={{ left: coords.x, top: coords.y }}
      role="tooltip"
      id={`tooltip-${nodeId}`}
      aria-hidden={!visible}
    >
      <div
        className="w-64 border-2 border-sega-cyan bg-sega-bg-dark p-3 shadow-sega-glow text-left"
      >
        <p className="text-[11px] font-medium text-sega-cyan font-pixel mb-1">{meta.title}</p>
        <p className="text-[10px] text-sega-white/80 leading-relaxed mb-2 font-reading">{meta.description}</p>
        {meta.risks && meta.risks.length > 0 && (
          <div className="mb-2">
            <span className="text-[9px] uppercase tracking-wider text-sega-yellow font-pixel">Risks</span>
            <ul className="text-[10px] text-sega-white/60 mt-0.5 list-disc list-inside space-y-0.5 font-reading">
              {meta.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {meta.invariants && meta.invariants.length > 0 && (
          <div>
            <span className="text-[9px] uppercase tracking-wider text-sega-green font-pixel">Invariants</span>
            <ul className="text-[10px] text-sega-white/60 mt-0.5 list-disc list-inside space-y-0.5 font-reading">
              {meta.invariants.map((inv, i) => (
                <li key={i}>{inv}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Node (interactive, tooltip, trust boundary, highlight) ---

function Node({
  nodeId,
  nodeType,
}: {
  nodeId: string;
  nodeType: NodeType;
}) {
  const anchorRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { getMeta, getFlowIndicesForNode, setHighlightedFromNode, highlightedFlowIndices } =
    useDiagram();

  const meta = getMeta(nodeId);
  const isExternal = nodeType === "external";
  const flowIndices = useMemo(() => getFlowIndicesForNode(nodeId), [nodeId, getFlowIndicesForNode]);
  const isHighlighted =
    highlightedFlowIndices.size > 0 && flowIndices.some((i) => highlightedFlowIndices.has(i));

  const handleEnter = useCallback(() => {
    setHighlightedFromNode(nodeId);
    setTooltipVisible(true);
  }, [nodeId, setHighlightedFromNode]);

  const handleLeave = useCallback(() => {
    setHighlightedFromNode(null);
    setTooltipVisible(false);
  }, [setHighlightedFromNode]);

  const label = meta?.title ?? nodeId;
  const strokeDasharray = isExternal ? "4 2" : undefined;

  return (
    <>
      <div
        ref={(el) => {
          anchorRef.current = el;
        }}
        className="relative inline-flex cursor-default"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        tabIndex={0}
        role="button"
        aria-label={label}
        aria-describedby={tooltipVisible ? `tooltip-${nodeId}` : undefined}
      >
        <svg
          width="155"
          height="32"
          viewBox="0 0 155 32"
          className={`flex-shrink-0 transition-opacity duration-150 ${isHighlighted ? "opacity-100" : "opacity-90"}`}
          aria-hidden
        >
          <rect
            x="1"
            y="1"
            width="153"
            height="30"
            rx="4"
            fill={isExternal ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)"}
            stroke={isExternal ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)"}
            strokeWidth="1"
            strokeDasharray={strokeDasharray}
            className={isHighlighted ? "stroke-white/25" : ""}
          />
          <text
            x="77.5"
            y="20"
            textAnchor="middle"
            fill={isExternal ? "#d1d5db" : "#e5e7eb"}
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "10px",
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </text>
        </svg>
      </div>
      {meta && (
        <NodeTooltip
          nodeId={nodeId}
          meta={meta}
          visible={tooltipVisible}
          anchorRef={anchorRef}
        />
      )}
    </>
  );
}

// --- Arrows (participate in flow highlight) ---

function Arrow({ flowIndex }: { flowIndex: number }) {
  const { highlightedFlowIndices } = useDiagram();
  const isHighlighted = highlightedFlowIndices.has(flowIndex);

  return (
    <svg
      width="16"
      height="32"
      viewBox="0 0 16 32"
      className={`flex-shrink-0 md:rotate-0 rotate-90 transition-opacity duration-150 ${isHighlighted ? "opacity-70" : "opacity-40"}`}
      aria-hidden
    >
      <line
        x1="2"
        y1="16"
        x2="10"
        y2="16"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.75"
      />
      <path
        d="M10 13 L13 16 L10 19 Z"
        fill="rgba(255,255,255,0.35)"
      />
    </svg>
  );
}

function ArrowVerticalAsync({ flowIndex }: { flowIndex: number }) {
  const { highlightedFlowIndices } = useDiagram();
  const isHighlighted = highlightedFlowIndices.has(flowIndex);

  return (
    <svg
      width="32"
      height="48"
      viewBox="0 0 32 48"
      className={`flex-shrink-0 transition-opacity duration-150 ${isHighlighted ? "opacity-70" : "opacity-40"}`}
      aria-hidden
    >
      <text
        x="16"
        y="14"
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: "9px",
        }}
      >
        async callback
      </text>
      <line
        x1="16"
        y1="18"
        x2="16"
        y2="40"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.75"
        strokeDasharray="3 3"
      />
      <path
        d="M13 37 L16 42 L19 37 Z"
        fill="rgba(255,255,255,0.35)"
      />
    </svg>
  );
}

// --- Diagram provider (injects config + highlight state) ---

function DiagramProvider({
  config,
  children,
}: {
  config: DiagramConfig;
  children: React.ReactNode;
}) {
  const [highlightedFlowIndices, setHighlightedFlowIndices] = useState<Set<number>>(new Set());

  const getFlowIndicesForNode = useCallback(
    (nodeId: string) => {
      return config.flows
        .map((flow, index) => (flow.includes(nodeId) ? index : -1))
        .filter((i) => i >= 0);
    },
    [config.flows]
  );

  const setHighlightedFromNode = useCallback((nodeId: string | null) => {
    if (!nodeId) {
      setHighlightedFlowIndices(new Set());
      return;
    }
    const indices = config.flows
      .map((flow, index) => (flow.includes(nodeId) ? index : -1))
      .filter((i) => i >= 0);
    setHighlightedFlowIndices(new Set(indices));
  }, [config.flows]);

  const getMeta = useCallback(
    (id: string) => config.nodes[id],
    [config.nodes]
  );

  const value = useMemo<DiagramContextValue>(
    () => ({
      config,
      highlightedFlowIndices,
      getFlowIndicesForNode,
      setHighlightedFromNode,
      getMeta,
    }),
    [
      config,
      highlightedFlowIndices,
      getFlowIndicesForNode,
      setHighlightedFromNode,
      getMeta,
    ]
  );

  return (
    <DiagramContext.Provider value={value}>
      {children}
    </DiagramContext.Provider>
  );
}

// --- Segment renderer (for Identity) ---

function renderSegment(
  nodeIds: string[],
  nodeType: NodeType,
  flowIndex: number
) {
  return nodeIds.map((nodeId, i) => (
    <Fragment key={nodeId}>
      <Node nodeId={nodeId} nodeType={nodeType} />
      {i < nodeIds.length - 1 && <Arrow flowIndex={flowIndex} />}
    </Fragment>
  ));
}

// --- Payments diagram ---

function PaymentsDiagram() {
  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-2">
        <Node nodeId="client" nodeType="external" />
        <Arrow flowIndex={0} />
        <div className="border-2 border-dashed border-sega-cyan/60 p-6 relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-2">
          <span className="absolute -top-2 left-4 font-pixel text-[10px] text-sega-cyan bg-sega-bg-dark border-2 border-sega-cyan px-2">
            Internal System
          </span>
          <Node nodeId="api" nodeType="internal" />
        </div>
        <Arrow flowIndex={0} />
        <div className="flex flex-col items-center relative">
          <Node nodeId="payment-provider" nodeType="external" />
          <div className="hidden md:flex flex-col items-center absolute top-full mt-2">
            <ArrowVerticalAsync flowIndex={1} />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center w-full gap-2 md:gap-2 md:min-w-0">
        <div className="md:hidden">
          <ArrowVerticalAsync flowIndex={1} />
        </div>
        <div className="border-2 border-dashed border-sega-cyan/60 p-6 relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-2">
          <span className="absolute -top-2 left-4 font-pixel text-[10px] text-sega-cyan bg-sega-bg-dark border-2 border-sega-cyan px-2">
            Internal System
          </span>
          <Node nodeId="webhook" nodeType="internal" />
          <Arrow flowIndex={1} />
          <Node nodeId="database" nodeType="internal" />
        </div>
      </div>
    </div>
  );
}

// --- Identity diagram ---

const IDENTITY_LAYOUT = {
  externalStart: ["client"] as const,
  internal: ["identity-gateway", "token", "internal-services"] as const,
  externalEnd: ["national-apis"] as const,
};

function IdentityDiagram() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-2">
        {renderSegment([...IDENTITY_LAYOUT.externalStart], "external", 0)}
      </div>
      <Arrow flowIndex={0} />
      <div className="border-2 border-dashed border-sega-cyan/60 p-6 relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-2">
        <span className="absolute -top-2 left-4 font-pixel text-[10px] text-sega-cyan bg-sega-bg-dark border-2 border-sega-cyan px-2">
          Internal System
        </span>
        {renderSegment([...IDENTITY_LAYOUT.internal], "internal", 0)}
      </div>
      <Arrow flowIndex={1} />
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-2">
        {renderSegment([...IDENTITY_LAYOUT.externalEnd], "external", 1)}
      </div>
    </div>
  );
}

// --- Export ---

function SystemInvariantsPanel({ invariants }: { invariants: string[] }) {
  return (
    <div className="mt-6 pt-5 border-t-2 border-sega-cyan/40">
      <p className="font-pixel text-[10px] text-sega-yellow mb-2">
        System Invariants
      </p>
      <ul className="space-y-1.5 text-[11px] text-sega-white/80 leading-relaxed font-reading">
        {invariants.map((inv, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-sega-cyan shrink-0">·</span>
            <span>{inv}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ArchitectureDiagram({ type }: ArchitectureDiagramProps) {
  const flowLabel = FLOW_LABEL[type];
  const config = type === "payments" ? PAYMENTS_CONFIG : IDENTITY_CONFIG;
  const invariants = SYSTEM_INVARIANTS[type];

  return (
    <div className="mt-10 border-t-2 border-sega-cyan/40 pt-8">
      <p className="font-pixel text-xs text-sega-yellow mb-6">
        {flowLabel}
      </p>
      <div className="bg-sega-bg-dark/80 border-2 border-sega-cyan/50 p-6">
        <DiagramProvider config={config}>
          {type === "payments" ? <PaymentsDiagram /> : <IdentityDiagram />}
        </DiagramProvider>
        <SystemInvariantsPanel invariants={invariants} />
      </div>
    </div>
  );
}
