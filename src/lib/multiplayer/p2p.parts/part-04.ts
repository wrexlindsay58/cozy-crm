import { PING_INTERVAL_MS, SIGNAL_RETRY_DELAYS_MS, type SignalKind, type PeerSlot } from "./part-01";
import { P2PRoom } from "./part-02";

export async function P2PRoom_flushPendingCandidates(self: P2PRoom, slot: PeerSlot): Promise<void> {
    while (slot.pendingCandidates.length > 0) {
      const candidate = slot.pendingCandidates.shift()!;
      try {
        await slot.pc.addIceCandidate(candidate);
      } catch (err) {
        if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
      }
      if ((self as any).closed) return;
    }
  }

export async function P2PRoom_onSignal(self: P2PRoom, from: string, kind: SignalKind, payload: unknown, roster: Set<string>): Promise<void> {
    if ((self as any).closed) return;
    let slot = (self as any).peers.get(from);
    if (!slot) {
      // New peers dial us in the same poll that adds them to the roster.
      // Signals outlive membership, so drop senders the roster doesn't vouch for.
      if (!roster.has(from)) return;
      const created = (self as any).connectTo(from, "", false);
      if (!created) return;
      slot = created;
    }
    const polite = (self as any).opts.selfId < from;

    try {
      if (kind === "offer" || kind === "answer") {
        const description = payload as RTCSessionDescriptionInit;
        const collision =
          kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
        slot.ignoreOffer = !polite && collision;
        if (slot.ignoreOffer) return;
        try {
          await slot.pc.setRemoteDescription(description); // implicit rollback when polite
        } catch (err) {
          // A pc resumed from suspend can be unable to take any new remote
          // offer (stale DTLS fingerprint). Rebuild the pair once and apply
          // the same offer to the fresh pc before giving up.
          if (kind !== "offer" || slot.recreatedForOffer) throw err;
          const attempts = slot.recoveryAttempts;
          const name = slot.info.name;
          slot.pc.close();
          (self as any).peers.delete(from);
          const fresh = (self as any).connectTo(from, name, false);
          if (!fresh) return;
          fresh.recoveryAttempts = attempts;
          fresh.recreatedForOffer = true;
          slot = fresh;
          await slot.pc.setRemoteDescription(description);
        }
        if ((self as any).closed) return;
        await (self as any).flushPendingCandidates(slot);
        if ((self as any).closed) return;
        if (kind === "offer") {
          await slot.pc.setLocalDescription();
          if ((self as any).closed) return;
          await (self as any).sendSignal(from, "answer", slot.pc.localDescription!.toJSON());
        }
      } else if (kind === "ice") {
        const candidate = payload as RTCIceCandidateInit;
        if (!slot.pc.remoteDescription) {
          // Candidate raced ahead of its SDP — hold it until the description
          // lands (flushed after every successful setRemoteDescription).
          slot.pendingCandidates.push(candidate);
          return;
        }
        try {
          await slot.pc.addIceCandidate(candidate);
        } catch (err) {
          // The enclosing catch would swallow a rethrow; log the real signal.
          if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
        }
      }
    } catch {
      // Negotiation errors resolve on the next offer cycle; state is visible
      // to the app via connectionState.
    }
  }

export function P2PRoom_sendSignal(self: P2PRoom, to: string, kind: SignalKind, payload: unknown): Promise<void> {
    const prev = (self as any).signalQueues.get(to) ?? Promise.resolve();
    const next = prev.then(() => (self as any).postSignal(to, kind, payload));
    (self as any).signalQueues.set(
      to,
      next.catch(() => {}),
    );
    return next;
  }

export async function P2PRoom_postSignal(self: P2PRoom, to: string, kind: SignalKind, payload: unknown): Promise<void> {
    for (let attempt = 0; ; attempt++) {
      if ((self as any).closed) return;
      try {
        const res = await fetch("/api/rtc", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            op: "signal",
            room: (self as any).opts.room,
            from: (self as any).opts.selfId,
            to,
            kind,
            payload,
          }),
        });
        if (res.ok) return;
        throw new Error(`signal POST failed: ${res.status}`);
      } catch (err) {
        if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
          // Delivery gave up; the pair converges on the next offer cycle (or
          // the watchdog rebuilds it). Logged once so failures are visible.
          console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
          return;
        }
        await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
      }
    }
  }

export function P2PRoom_pingAll(self: P2PRoom): void {
    const wire = JSON.stringify({ t: "ping" });
    for (const slot of (self as any).peers.values()) {
      if (slot.state?.readyState !== "open") continue;
      const stale =
        slot.pingSentAt !== undefined && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
      if (slot.pingSentAt === undefined || stale) {
        // A lost pong must not freeze rttMs forever: expire and re-ping.
        slot.pingSentAt = performance.now();
        slot.state.send(wire);
      }
    }
  }

export function P2PRoom_emitPeers(self: P2PRoom): void {
    // Only notify when something observable actually changed — React state
    // setters otherwise re-render consumers on every poll/ping.
    const list = (self as any).peerList();
    const fingerprint = JSON.stringify(
      list.map((p: any) => [p.id, p.name, p.connectionState, p.candidateType, p.rttMs]),
    );
    if (fingerprint === (self as any).lastPeersFingerprint) return;
    (self as any).lastPeersFingerprint = fingerprint;
    (self as any).opts.onPeersChanged?.(list);
  }
