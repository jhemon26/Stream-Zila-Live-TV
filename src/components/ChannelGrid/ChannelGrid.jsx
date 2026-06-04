import ChannelCard from '../ChannelCard/ChannelCard'
import styles from './ChannelGrid.module.css'

export default function ChannelGrid({
  channels,
  loading,
  error,
  selectedChannel,
  onSelectChannel,
  activeCategory,
}) {
  if (loading) {
    return (
      <div className={styles.state}>
        <div className={styles.spinner} />
        <span className={styles.stateText}>Loading channels...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.state}>
        <span className={`material-symbols-outlined ${styles.stateIcon}`}>wifi_off</span>
        <span className={styles.stateText}>Unable to load channels</span>
        <span className={styles.stateSubtext}>{error}</span>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className={styles.state}>
        <span className={`material-symbols-outlined ${styles.stateIcon}`}>search_off</span>
        <span className={styles.stateText}>No channels found</span>
        <span className={styles.stateSubtext}>Try a different search term or category</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle' }}>
            tv
          </span>
          {' '}{channels.length.toLocaleString()} channel{channels.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && (
            <span className={styles.categoryBadge}>{activeCategory}</span>
          )}
        </span>
      </div>
      <div className={styles.grid}>
        {channels.map((channel, idx) => (
          <ChannelCard
            key={`${channel.name}-${idx}`}
            channel={channel}
            isActive={selectedChannel?.name === channel.name && selectedChannel?.url === channel.url}
            onSelect={onSelectChannel}
          />
        ))}
      </div>
    </div>
  )
}
