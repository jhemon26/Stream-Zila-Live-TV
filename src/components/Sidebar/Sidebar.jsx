import styles from './Sidebar.module.css'

export default function Sidebar({ categories, activeCategory, onSelectCategory, isOpen }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <nav className={styles.nav}>
        <div className={styles.section}>
          {categories.slice(0, 1).map(cat => (
            <button
              key={cat.id}
              className={`${styles.navItem} ${activeCategory === cat.id ? styles.active : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>{cat.icon}</span>
              <span className={styles.navLabel}>{cat.label}</span>
              {cat.count > 0 && (
                <span className={styles.navCount}>{cat.count}</span>
              )}
            </button>
          ))}
        </div>

        {categories.length > 1 && (
          <>
            <div className={styles.divider}>
              <span className={styles.dividerLabel}>Categories</span>
            </div>
            <div className={styles.section}>
              {categories.slice(1).map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.navItem} ${activeCategory === cat.id ? styles.active : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span className={`material-symbols-outlined ${styles.navIcon}`}>{cat.icon}</span>
                  <span className={styles.navLabel}>{cat.label}</span>
                  {cat.count > 0 && (
                    <span className={styles.navCount}>{cat.count}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
