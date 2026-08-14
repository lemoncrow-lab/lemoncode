// LemonCrow cost/savings statusline segment for the lemoncode footer.
//
// Mirrors integrations/claude/plugin/scripts/statusline.sh's rotating
// dynamic segment (see savings_summary.savings_frames), but reads it
// straight from the MCP sidecar file the running `lemoncrow mcp --host
// lemoncode` server already keeps fresh --
// sessions/<date>/lemoncode/<id>/statusline_frames, written by
// _write_statusline_sidecar_now after every savings event -- instead of
// spawning a subprocess per poll. Silently empty when LemonCrow isn't
// installed or no session has written a sidecar yet.
import fs from "fs"
import os from "os"
import path from "path"
import { createSignal, onCleanup } from "solid-js"

const POLL_INTERVAL_MS = 5000
const FRAME_ROTATE_S = 5
// session_dir() (paths.py) searches the same 3-day window when resolving an
// existing session's date-partitioned directory; mirrored here so a session
// that started yesterday and is still being written to isn't missed.
const SEARCH_DAYS = 3
const HOST = "lemoncode"
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g

function lemoncrowRoot(): string {
  return process.env.LEMONCROW_ROOT || process.env.LEMONCROW_STORE_ROOT || path.join(os.homedir(), ".lemoncrow")
}

function datePath(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  const y = String(d.getFullYear())
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return path.join(y, m, day)
}

// lc-debt: picks the freshest-mtime sidecar across every "lemoncode" session
// from the last SEARCH_DAYS days, not the one specific session this opencode
// instance belongs to -- opencode session ids and lemoncrow MCP session ids
// aren't correlated anywhere yet. Fine for the common single-session case;
// upgrade path is threading opencode's sessionID into the MCP server (e.g.
// via a "chat.message" plugin hook) so it can key the sidecar path exactly.
function findLatestFramesFile(): string | undefined {
  const root = lemoncrowRoot()
  let best: { file: string; mtime: number } | undefined
  for (let offset = 0; offset < SEARCH_DAYS; offset++) {
    const hostDir = path.join(root, "sessions", datePath(offset), HOST)
    let ids: string[]
    try {
      ids = fs.readdirSync(hostDir)
    } catch {
      continue
    }
    for (const id of ids) {
      const framesPath = path.join(hostDir, id, "statusline_frames")
      let mtime: number
      try {
        mtime = fs.statSync(framesPath).mtimeMs
      } catch {
        continue
      }
      if (!best || mtime > best.mtime) best = { file: framesPath, mtime }
    }
  }
  return best?.file
}

function readFrame(): string {
  const file = findLatestFramesFile()
  if (!file) return ""
  let content: string
  try {
    content = fs.readFileSync(file, "utf-8")
  } catch {
    return ""
  }
  const frames = content
    .split("\n")
    .map((line) => line.replace(ANSI_RE, "").trim())
    .filter(Boolean)
  if (frames.length === 0) return ""
  const idx = Math.floor(Date.now() / 1000 / FRAME_ROTATE_S) % frames.length
  return frames[idx]
}

/** Reactive rotating LemonCrow cost/savings segment; "" when nothing to show. */
export function createLcStatuslineSignal() {
  const [frame, setFrame] = createSignal(readFrame())
  const timer = setInterval(() => setFrame(readFrame()), POLL_INTERVAL_MS)
  onCleanup(() => clearInterval(timer))
  return frame
}
