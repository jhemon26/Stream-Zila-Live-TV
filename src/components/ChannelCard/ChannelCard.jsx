import { useState } from 'react'
import styles from './ChannelCard.module.css'

function getInitialColor(name) {
  const colors = [
    '#c62828','#ad1457','#6a1b9a','#283593',
    '#1565c0','#00695c','#2e7d32','#e65100',
    '#4527a0','#00838f',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ChannelCard({ channel, isActive, onSelect }) {
  const [imgError, setImgError] = useState(false)
  const initial = channel.name?.charAt(0)?.toUpperCase() || '?'
  const accentColor = getInitialColor(channel.name || '')

  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(channel)}
      title={channel.name}
    >
      <div className={styles.logoWrapper}>
        {channel.logo && !imgError ? (
          <img
            className={styles.logo}
            src={channel.logo}
            alt={channel.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.logoFallback} style={{ background: accentColor }}>
            <span className={styles.logoInitial}>{initial}</span>
          </div>
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
