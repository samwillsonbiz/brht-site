// Phone-only persistence and interruption handling. The rules and online protocol
// remain owned by the existing game. This module never stores online game state,
// room credentials, or an opponent's private cards in the optional report.

export function readMobilePreference(key, fallback = null, storage = undefined) {
  try {
    return (storage ?? globalThis.localStorage).getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function createMobileSession({
  enabled = false,
  saveKey,
  recorder,
  getContext,
  onStatus = () => {},
  onSuspend = () => {},
  onResume = async () => {},
  storage = undefined,
  document: doc = globalThis.document,
  window: win = globalThis.window,
  clock = () => Date.now(),
} = {}) {
  const recordingKey = `${saveKey}-mobile-playtest-v1`;
  const status = { saved: null, recordingSaved: null, connected: true, resuming: false };
  let destroyed = false;
  let resumeTask = null;
  let statusSignature = '';

  const active = () => enabled && !destroyed;
  const context = () => getContext?.() || {};
  const store = () => storage ?? globalThis.localStorage;
  const publish = () => {
    const signature = JSON.stringify(status);
    if (signature !== statusSignature) {
      statusSignature = signature;
      onStatus({ ...status });
    }
  };
  const identity = ({ game, mode, viewer }) => ({
    version: game.s.version,
    mode,
    viewer,
    heroes: game.s.players.map(p => p.hero),
    // Kept outside the exported report. Room identity prevents a different duel
    // with the same Heroes from picking up an earlier opt-in recording.
    room: mode === 'online' ? game.room?.id : null,
  });
  const sameIdentity = (a, b) => a && a.version === b.version && a.mode === b.mode &&
    a.viewer === b.viewer && a.room === b.room && JSON.stringify(a.heroes) === JSON.stringify(b.heroes);

  function persistRecording(ctx) {
    if (!recorder?.enabled || !ctx.game) return;
    try {
      const report = recorder.export();
      if (!report) return;
      const payload = {
        schema: 1,
        savedAt: clock(),
        identity: identity(ctx),
        report,
        state: recorder.state,
        lastFrame: recorder.lastFrame,
        previousLog: recorder.previousLog,
      };
      store().setItem(recordingKey, JSON.stringify(payload));
      status.recordingSaved = true;
    } catch {
      status.recordingSaved = false;
    }
  }

  function save() {
    if (!active()) return false;
    const ctx = context();
    if (!ctx.game || ctx.screen !== 'game') return false;
    if (ctx.mode !== 'online') {
      try {
        store().setItem(saveKey, JSON.stringify(ctx.game.s));
        status.saved = true;
      } catch {
        status.saved = false;
      }
    }
    if (recorder?.enabled) recorder.observe(ctx.game.s, ctx.viewer, ctx.mode, !doc?.hidden);
    persistRecording(ctx);
    publish();
    return ctx.mode === 'online' || status.saved === true;
  }

  function checkpoint() {
    if (!active()) return false;
    return save();
  }

  // Call only when the app resumes its saved local match or reconnects a saved
  // online seat. New matches deliberately clear the old recording first.
  function restoreRecording() {
    if (!active() || !recorder || recorder.enabled) return false;
    const ctx = context();
    if (!ctx.game || ctx.screen !== 'game') return false;
    try {
      const raw = store().getItem(recordingKey);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      const report = saved.report;
      if (saved.schema !== 1 || !sameIdentity(saved.identity, identity(ctx)) ||
          !report || typeof report !== 'object' || !Array.isArray(report.notes) ||
          !Number.isFinite(report.foregroundMs) || !Number.isFinite(report.hiddenMs) ||
          !report.byState || typeof report.byState !== 'object' ||
          !report.observed || typeof report.observed !== 'object') return false;
      const now = clock();
      const restored = structuredClone(report);
      const finished = restored.complete === true;
      delete restored.complete;
      delete restored.measurement;
      // Time away from a discarded/reloaded tab is an interruption, never
      // foreground decision time. Finished reports do not accrue more time.
      if (!finished && Number.isFinite(saved.savedAt)) {
        restored.hiddenMs += Math.max(0, now - saved.savedAt);
      }
      recorder.report = restored;
      recorder.enabled = true;
      recorder.finished = finished;
      recorder.state = typeof saved.state === 'string' ? saved.state : 'resumed';
      recorder.last = now;
      recorder.visible = !doc?.hidden;
      recorder.lastFrame = typeof saved.lastFrame === 'string' ? saved.lastFrame : null;
      recorder.previousLog = Array.isArray(saved.previousLog) ? saved.previousLog : [];
      recorder.observe(ctx.game.s, ctx.viewer, ctx.mode, !doc?.hidden);
      status.recordingSaved = true;
      publish();
      return true;
    } catch {
      return false;
    }
  }

  function clearRecording() {
    if (!active()) return;
    try { store().removeItem(recordingKey); } catch { /* A new match still plays. */ }
    status.recordingSaved = null;
    status.saved = null;
    status.resuming = false;
    publish();
  }

  function setConnected(connected) {
    if (!active()) return;
    status.connected = !!connected;
    // The existing poller invokes this after it has applied a fresh snapshot.
    // That also releases a failed foreground refresh without a second command.
    if (connected) status.resuming = false;
    publish();
  }

  async function resume() {
    if (!active() || doc?.hidden) return;
    if (resumeTask) return resumeTask;
    const ctx = context();
    if (!ctx.game || ctx.screen !== 'game') return;
    status.resuming = ctx.mode === 'online';
    if (status.resuming) status.connected = false;
    publish();
    resumeTask = (async () => {
      try {
        await Promise.resolve().then(() => onResume(ctx));
        if (!active() || context().game !== ctx.game) return;
        status.resuming = false;
        if (ctx.mode === 'online') status.connected = true;
        if (recorder?.enabled) recorder.observe(ctx.game.s, ctx.viewer, ctx.mode, !doc?.hidden);
      } catch {
        // The normal poller keeps reconnecting. Leave controls gated until it
        // applies a fresh snapshot; do not replay a command on the user's behalf.
        if (context().game === ctx.game && status.resuming) status.connected = false;
      } finally {
        resumeTask = null;
        if (active()) publish();
      }
    })();
    return resumeTask;
  }

  function suspend() {
    if (!active()) return;
    checkpoint();
    onSuspend(context());
  }
  const visibility = () => { if (doc.hidden) suspend(); else void resume(); };
  const pageshow = event => { if (event.persisted) void resume(); };
  const online = () => { if (context().mode === 'online') void resume(); };
  const offline = () => {
    if (!active() || context().mode !== 'online') return;
    status.connected = false;
    status.resuming = true;
    checkpoint();
    publish();
  };
  if (active()) {
    doc?.addEventListener('visibilitychange', visibility);
    win?.addEventListener('pagehide', suspend);
    win?.addEventListener('pageshow', pageshow);
    win?.addEventListener('online', online);
    win?.addEventListener('offline', offline);
  }

  return {
    save, checkpoint, restoreRecording, clearRecording, resume, setConnected,
    get status() { return { ...status }; },
    get resuming() { return status.resuming; },
    destroy() {
      destroyed = true;
      doc?.removeEventListener('visibilitychange', visibility);
      win?.removeEventListener('pagehide', suspend);
      win?.removeEventListener('pageshow', pageshow);
      win?.removeEventListener('online', online);
      win?.removeEventListener('offline', offline);
    },
  };
}
