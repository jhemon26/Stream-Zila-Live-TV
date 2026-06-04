# Stream Zila — AI Context

## What this app is

Stream Zila is a professional live TV streaming web application. It displays 1200+ IPTV channels organized by category, allows users to search and filter channels, and plays HLS streams directly in the browser using HLS.js.

## Tech stack

| Layer          | Technology                       |
|----------------|----------------------------------|
| UI framework   | React 18 + Vite 5                |
| Video playback | HLS.js 1.x                       |
| Styling        | CSS Modules + CSS custom properties |
| Icons          | Google Material Symbols Outlined |
| Fonts          | Inter (Google Fonts)             |
| Deployment     | GitHub Actions → GitHub Pages    |
| Channel data   | JSON API (auto-refreshed daily)  |

## Repository layout

```
stream-zila/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # CI/CD: build + deploy to GitHub Pages
│       └── refresh-channels.yml   # Cron: fetch latest channels.json daily
│
├── public/
│   └── channels.json              # Cached channel list (committed, auto-refreshed)
│
├── src/
│   ├── components/
│   │   ├── Header/                # Top bar: logo, search, live counter
│   │   ├── Sidebar/               # Category navigation with icons + counts
│   │   ├── ChannelGrid/           # Responsive grid of channel cards
│   │   ├── ChannelCard/           # Individual card: logo, name, group, LIVE badge
│   │   └── Player/                # HLS video player panel with channel info
│   ├── hooks/
│   │   └── useChannels.js         # Fetches channels.json (local → fallback)
│   ├── App.jsx                    # Root: state, filtering, layout composition
│   ├── App.module.css
│   ├── index.css                  # Global styles, CSS variables, resets
│   └── main.jsx
│
├── docs/
│   ├── AiContext.md               # This file
│   └── ProgressLog.md             # Chronological build log
│
├── index.html
├── package.json
└── vite.config.js
```

## Channel data source

- **Primary (local, committed):** `public/channels.json`  
  Auto-refreshed daily by the `Refresh Channels` GitHub Action. This is what the deployed app reads from — no runtime API calls needed.

- **Fallback (runtime):** `https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/channels.json`  
  Used when the local file is missing or empty (e.g., during local development before running the refresh action).

### Channel object shape

```json
{
  "name":  "CNN International",
  "logo":  "https://example.com/cnn.png",
  "group": "News",
  "url":   "https://example.com/cnn/stream.m3u8"
}
```

## Data flow

```
useChannels (hook)
  └─ fetch public/channels.json  →  on fail: fetch fallback URL
       │
       └─ channels[]  →  App.jsx (state: channels, activeCategory, searchQuery, selectedChannel)
            │
            ├─ categories (derived)  →  Sidebar
            ├─ filteredChannels      →  ChannelGrid → ChannelCard[]
            └─ selectedChannel       →  Player (HLS.js)
```

## Component responsibilities

### `App.jsx`
- Owns all application state: `channels`, `activeCategory`, `searchQuery`, `selectedChannel`, `sidebarOpen`
- Derives `categories` (with counts) from raw channel data
- Derives `filteredChannels` (by category + search) via `useMemo`
- Orchestrates layout: Header + Sidebar + (Player if active) + ChannelGrid

### `Header`
- Search input (controlled, real-time filter)
- Sidebar toggle button
- Live indicator showing total channel count

### `Sidebar`
- Scrollable list of all category buttons with icon + label + count
- "All Channels" always first; remaining sorted by channel count descending
- Active category highlighted with red accent

### `ChannelGrid`
- Loading spinner, error state, empty state
- Toolbar showing filtered channel count + active category badge
- Responsive CSS Grid: `repeat(auto-fill, minmax(160px, 1fr))`
- Renders a `ChannelCard` per channel

### `ChannelCard`
- Shows logo via `<img>` with graceful fallback to colored initial tile
- LIVE badge (pulsing green dot) on every card
- Active (currently playing) card highlighted with red border glow
- Click → `onSelectChannel(channel)`

### `Player`
- Mounts when `selectedChannel` is set; unmounts on close
- Uses `HLS.js` if supported, falls back to native `<video>` HLS for Safari
- Shows loading overlay while connecting, error overlay on fatal failure
- Info bar below video: logo, LIVE badge, channel name, group
- Mute and fullscreen controls (appear on hover)

## Design system

All tokens are CSS custom properties in `src/index.css`:

| Token            | Value      | Usage                         |
|------------------|------------|-------------------------------|
| `--bg-primary`   | `#08080e`  | App background                |
| `--bg-surface`   | `#10101a`  | Header, sidebar               |
| `--bg-elevated`  | `#181826`  | Logo fallback backgrounds     |
| `--bg-hover`     | `#1e1e2e`  | Hover states                  |
| `--accent`       | `#e53935`  | Active states, highlights     |
| `--accent-dim`   | `rgba(229,57,53,0.12)` | Active bg tint    |
| `--text-primary` | `#f2f2f6`  | Main text                     |
| `--text-secondary`| `#8a8a9e` | Labels, secondary info        |
| `--text-muted`   | `#484858`  | Counts, hints                 |
| `--live`         | `#43a047`  | LIVE badges                   |
| `--border`       | `#1e1e2e`  | Dividers, card borders        |

**Fonts:** Inter (variable weight 300–700), Material Symbols Outlined  
**Icons:** Google Material Symbols Outlined — no emojis anywhere

## GitHub Actions

### `deploy.yml`
Triggered by: push to `main`, completion of `Refresh Channels`, or manual dispatch.  
Steps: checkout → Node 20 → `npm ci` → `npm run build` (with `VITE_BASE_PATH=/<repo-name>/`) → upload artifact → deploy to GitHub Pages.

### `refresh-channels.yml`
Triggered by: daily cron at 04:00 UTC or manual dispatch.  
Steps: checkout → `curl` channels.json from upstream → check diff → commit + push if changed.  
A push from this workflow triggers `deploy.yml`, so the live site always has fresh channel data.

## Key implementation notes

- `VITE_BASE_PATH` env var drives `base` in vite.config.js so the app works on both GitHub Pages project sites (`/repo-name/`) and custom domains (`/`).
- `useChannels` attempts local `./channels.json` first. If the array is empty, it falls back to the upstream URL. This means local dev works without running the refresh action.
- HLS.js is destroyed and re-created on each channel change to avoid stream leaks.
- Channel cards use a deterministic color hash for the fallback tile so each channel always gets the same color.
- The sidebar categories are sorted by channel count descending, so the most-populated ones appear first.
