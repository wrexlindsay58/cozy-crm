import { FAST_POLL_MS, IDLE_POLL_MS, P2PRoom_join, P2PRoom_close, P2PRoom_anyPairConnecting, type SignalKind, type PeerInfo, type P2PRoomOptions, type PeerSlot } from "./part-01";
import { P2PRoom_pollOnce, P2PRoom_reconcileRoster, P2PRoom_connectTo, P2PRoom_attachChannel } from "./part-03";
import { P2PRoom_flushPendingCandidates, P2PRoom_onSignal, P2PRoom_sendSignal, P2PRoom_postSignal, P2PRoom_pingAll, P2PRoom_emitPeers } from "./part-04";
import { P2PRoom_watchdog, P2PRoom_readCandidateType } from "./part-05";

export class P2PRoom {
  private readonly opts: P2PRoomOptions;
  private readonly peers = new Map<string, PeerSlot>();
  /** Per-remote-peer signal delivery chains (order-preserving). */
  private readonly signalQueues = new Map<string, Promise<void>>();
  private cursor = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;
  private everPolled = false;
  private lastPeersFingerprint = "";

  constructor(opts: P2PRoomOptions) {
    this.opts = opts;
  }

  /**
   * The first poll IS the join: it registers this peer and returns the
   * roster. A failed first poll (cold DB, offline tab) must not strand the
   * room: the loop and timers start regardless and the next poll retries.
   */
  async join(): Promise<void> {
    return P2PRoom_join(this);
  }

  close(): void {
    return P2PRoom_close(this);
  }

  /** Send on the unreliable game-state channel (drops stale packets). */
  broadcast(data: unknown): void {
    const wire = JSON.stringify({ t: "d", d: data });
    for (const slot of this.peers.values()) {
      if (slot.state?.readyState === "open") slot.state.send(wire);
    }
  }

  /** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
  send(data: unknown, peerId?: string): void {
    const wire = JSON.stringify({ t: "d", d: data });
    const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
    for (const slot of targets) {
      if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
    }
  }

  peerList(): PeerInfo[] {
    return [...this.peers.values()].map((s) => ({ ...s.info }));
  }

  // ── signaling loop ─────────────────────────────────────────────────────────

  private schedulePoll(delay: number): void {
    if (this.closed) return;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.pollTimer = setTimeout(() => void this.poll(), delay);
  }

  anyPairConnecting(): boolean {
    return P2PRoom_anyPairConnecting(this);
  }

  async pollOnce(): Promise<void> {
    return P2PRoom_pollOnce(this);
  }

  async poll(): Promise<void> {
    return P2PRoom_poll(this);
  }

  reconcileRoster(peers: { id: string; name: string }[]): void {
    return P2PRoom_reconcileRoster(this, peers);
  }

  // ── per-pair connection ────────────────────────────────────────────────────

  connectTo(peerId: string, name: string, initiator: boolean): PeerSlot | null {
    return P2PRoom_connectTo(this, peerId, name, initiator);
  }

  attachChannel(slot: PeerSlot, channel: RTCDataChannel): void {
    return P2PRoom_attachChannel(this, slot, channel);
  }

  /** Apply buffered ICE candidates once a remote description is in place. */
  async flushPendingCandidates(slot: PeerSlot): Promise<void> {
    return P2PRoom_flushPendingCandidates(this, slot);
  }

  async onSignal(from: string, kind: SignalKind, payload: unknown, roster: Set<string>): Promise<void> {
    return P2PRoom_onSignal(this, from, kind, payload, roster);
  }

  /**
   * Signals are serialized per remote peer (a candidate must never overtake
   * its SDP into the DB) and retried on failure with short backoff.
   */
  sendSignal(to: string, kind: SignalKind, payload: unknown): Promise<void> {
    return P2PRoom_sendSignal(this, to, kind, payload);
  }

  async postSignal(to: string, kind: SignalKind, payload: unknown): Promise<void> {
    return P2PRoom_postSignal(this, to, kind, payload);
  }

  // ── diagnostics + recovery ─────────────────────────────────────────────────

  pingAll(): void {
    return P2PRoom_pingAll(this);
  }

  /**
   * Stuck-pair recovery, piggybacked on the ping interval. A pair that has
   * made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
   * RTCPeerConnection (new DTLS identity — fixes the suspend/resume
   * fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
   * visible to the app as its last connectionState, ignored by fast-poll.
   */
  watchdog(): void {
    return P2PRoom_watchdog(this);
  }

  async readCandidateType(slot: PeerSlot): Promise<void> {
    return P2PRoom_readCandidateType(this, slot);
  }

  emitPeers(): void {
    return P2PRoom_emitPeers(this);
  }
}

async function P2PRoom_poll(self: P2PRoom): Promise<void> {
    if ((self as any).closed) return;
    try {
      await (self as any).pollOnce();
    } catch {
      // Transient poll failures are expected (tab sleep, deploy roll); retry.
    }
    (self as any).schedulePoll((self as any).anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
  }
