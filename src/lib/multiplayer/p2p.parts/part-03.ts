import { FAST_POLL_MS, defaultIceServers, type RtcPollResponse, type PeerSlot } from "./part-01";
import { P2PRoom } from "./part-02";

export async function P2PRoom_pollOnce(self: P2PRoom): Promise<void> {
    const params = new URLSearchParams({
      room: (self as any).opts.room,
      peer: (self as any).opts.selfId,
      name: (self as any).opts.name ?? "",
      since: String((self as any).cursor),
    });
    const res = await fetch(`/api/rtc?${params}`);
    if ((self as any).closed) return;
    if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
    const body = (await res.json()) as RtcPollResponse;
    if ((self as any).closed) return;
    if (!(self as any).everPolled) {
      (self as any).everPolled = true;
      (self as any).opts.onConnected?.();
    }
    (self as any).reconcileRoster(body.peers);
    const roster = new Set(body.peers.map((p) => p.id));
    for (const sig of body.signals) {
      (self as any).cursor = Math.max((self as any).cursor, sig.id);
      await (self as any).onSignal(sig.from, sig.kind, sig.payload, roster);
      if ((self as any).closed) return;
    }
  }

export function P2PRoom_reconcileRoster(self: P2PRoom, peers: { id: string; name: string }[]): void {
    const alive = new Set(peers.map((p) => p.id));
    for (const p of peers) {
      if (p.id === (self as any).opts.selfId) continue;
      const existing = (self as any).peers.get(p.id);
      if (existing) {
        existing.info.name = p.name;
      } else {
        // Exactly one side dials each pair; the other waits for the offer.
        (self as any).connectTo(p.id, p.name, (self as any).opts.selfId > p.id);
      }
    }
    for (const [id, slot] of (self as any).peers) {
      if (!alive.has(id)) {
        slot.pc.close();
        (self as any).peers.delete(id);
      }
    }
    (self as any).emitPeers();
  }

export function P2PRoom_connectTo(self: P2PRoom, peerId: string, name: string, initiator: boolean): PeerSlot | null {
    if ((self as any).closed) return null;
    const pc = new RTCPeerConnection({
      iceServers: (self as any).opts.iceServers ?? defaultIceServers(),
    });
    const slot: PeerSlot = {
      pc,
      makingOffer: false,
      ignoreOffer: false,
      pendingCandidates: [],
      lastProgressAt: Date.now(),
      recoveryAttempts: 0,
      info: {
        id: peerId,
        name,
        connectionState: pc.connectionState,
        candidateType: null,
        rttMs: null,
      },
    };
    (self as any).peers.set(peerId, slot);

    pc.onicecandidate = (e) => {
      if (e.candidate) void (self as any).sendSignal(peerId, "ice", e.candidate.toJSON());
    };
    pc.onconnectionstatechange = () => {
      slot.info.connectionState = pc.connectionState;
      if (pc.connectionState === "connecting" || pc.connectionState === "connected") {
        slot.lastProgressAt = Date.now();
      }
      if (pc.connectionState === "connected") {
        slot.recoveryAttempts = 0;
        slot.terminal = false;
        void (self as any).readCandidateType(slot);
      }
      (self as any).emitPeers();
      if (pc.connectionState === "failed") {
        // Refires negotiationneeded → a fresh offer through signaling, so a
        // lost offer or dead path cannot wedge the pair (glare-safe).
        pc.restartIce();
      }
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        (self as any).schedulePoll(FAST_POLL_MS);
      }
    };
    pc.onnegotiationneeded = async () => {
      try {
        slot.makingOffer = true;
        await pc.setLocalDescription();
        await (self as any).sendSignal(peerId, "offer", pc.localDescription!.toJSON());
      } catch {
        // A failed offer is retried on the next negotiationneeded.
      } finally {
        slot.makingOffer = false;
      }
    };
    pc.ondatachannel = (e) => (self as any).attachChannel(slot, e.channel);

    if (initiator) {
      // Creating the channels triggers negotiationneeded → the offer.
      (self as any).attachChannel(
        slot,
        pc.createDataChannel("state", { ordered: false, maxRetransmits: 0 }),
      );
      (self as any).attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
    }
    return slot;
  }

export function P2PRoom_attachChannel(self: P2PRoom, slot: PeerSlot, channel: RTCDataChannel): void {
    if (channel.label === "state") slot.state = channel;
    else slot.reliable = channel;
    channel.onopen = () => {
      slot.lastProgressAt = Date.now();
    };
    channel.onmessage = (e) => {
      let msg: { t: string; d?: unknown };
      try {
        msg = JSON.parse(e.data as string) as { t: string; d?: unknown };
      } catch {
        return;
      }
      if (msg.t === "ping") {
        if (slot.state?.readyState === "open") {
          slot.state.send(JSON.stringify({ t: "pong" }));
        }
      } else if (msg.t === "pong") {
        if (slot.pingSentAt) {
          slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
          slot.pingSentAt = undefined;
          (self as any).emitPeers();
        }
      } else {
        (self as any).opts.onMessage?.(
          slot.info.id,
          msg.d,
          channel.label === "state" ? "state" : "reliable",
        );
      }
    };
  }
