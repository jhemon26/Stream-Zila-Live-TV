import { useState } from 'react'
import styles from './ChannelCard.module.css'

const FALLBACK_COLORS = [
  '#e53935','#d81b60','#8e24aa','#3949ab',
  '#1976d2','#0097a7','#00897b','#43a047',
  '#fb8c00','#6d4c41','#546e7a','#7e57c2',
]

function getAccentColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}

export default function ChannelCard({ channel, isActive, onSelect }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const initial   = channel.name?.charAt(0)?.toUpperCase() || '?'
  const accentColor = getAccentColor(channel.name || '')

  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(channel)}
      title={channel.name}
    >
      <div className={styles.logoArea}>
        {/* Colored fallback tile — always visible immediately */}
        <div
          className={styles.fallback}
          style={{ background: accentColor, opacity: imgLoaded ? 0 : 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'rgba(255,255,255,0.55)' }}>
            live_tv
          </span>
          <span className={styles.fallbackInitial}>{initial}</span>
        </div>

        {/* Image fades in on top once loaded */}
        {channel.logo && !imgError && (
          <img
            className={`${styles.logo} ${imgLoaded ? styles.logoVisible : ''}`}
            src={channel.logo}
            alt=""
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        <span className={styles.livePill}>
          <span className={styles.liveDot} />
          LIVE
        </span>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{channel.name}</span>
        {channel.group && (
          <span className={styles.group}>{channel.group}</span>
        )}
      </div>
    </button>
  )
}
