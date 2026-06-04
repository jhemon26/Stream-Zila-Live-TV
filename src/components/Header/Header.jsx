import styles from './Header.module.css'

export default function Header({ channelCount, searchQuery, onSearch, onToggleSidebar, sidebarOpen }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="material-symbols-outlined">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
        <div className={styles.brand}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--accent)' }}>
            live_tv
          </span>
          <span className={styles.brandText}>
            Stream <span className={styles.brandAccent}>Zila</span>
          </span>
        </div>
      </div>

      <div className={styles.center}>
        <div className={styles.searchWrapper}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search channels, categories..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            spellCheck={false}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => onSearch('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span className={styles.liveLabel}>LIVE</span>
          {channelCount > 0 && (
            <span className={styles.channelCount}>
              {channelCount.toLocaleString()} channels
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
