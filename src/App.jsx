import { useState, useMemo } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import ChannelGrid from './components/ChannelGrid/ChannelGrid'
import Player from './components/Player/Player'
import useChannels from './hooks/useChannels'
import styles from './App.module.css'

const CATEGORY_ICON_MAP = {
  news:                'newspaper',
  sports:              'sports_soccer',
  bangla:              'translate',
  'indian bangla':     'translate',
  movies:              'movie',
  movie:               'movie',
  'vod italy':         'movie',
  entertainment:       'theater_comedy',
  infotainment:        'info',
  music:               'music_note',
  kids:                'child_care',
  documentary:         'description',
  documentaries:       'description',
  'documentaries (en)':'description',
  religious:           'mosque',
  religion:            'mosque',
  islamic:             'mosque',
  international:       'public',
  hindi:               'translate',
  english:             'language',
  arabic:              'translate',
  urdu:                'translate',
  tamil:               'translate',
  telugu:              'translate',
  live:                'sensors',
  general:             'tv',
  channels:            'tv',
  other:               'more_horiz',
  others:              'more_horiz',
  weather:             'wb_sunny',
  drama:               'local_movies',
  business:            'business_center',
  'news (ar)':         'newspaper',
  'news (es)':         'newspaper',
  latest:              'new_releases',
  imported:            'download',
  'ipl-2026':          'sports_cricket',
  'psl-2026':          'sports_cricket',
}

function getIcon(group) {
  if (!group) return 'tv'
  const key = group.toLowerCase()
  if (CATEGORY_ICON_MAP[key]) return CATEGORY_ICON_MAP[key]
  return 'flag'
}

function fuzzyScore(name, group, query) {
  const haystack = `${name} ${group}`.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return 100

  // Exact substring — highest priority
  if (haystack.includes(q)) return 100

  // Name starts with query
  if (name.toLowerCase().startsWith(q)) return 90

  // All space-separated words appear somewhere
  const words = q.split(/\s+/)
  if (words.length > 1 && words.every(w => haystack.includes(w))) return 80

  // Subsequence: query characters appear in order
  let qi = 0
  for (let i = 0; i < haystack.length && qi < q.length; i++) {
    if (haystack[i] === q[qi]) qi++
  }
  if (qi === q.length) return 60

  // High character match ratio (handles minor typos)
  const uniq = [...new Set(q.split(''))].filter(c => c !== ' ')
  const matched = uniq.filter(c => haystack.includes(c)).length
  if (matched / uniq.length >= 0.75) return 30

  return 0
}

export default function App() {
  const { channels, loading, error } = useChannels()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery]       = useState('')
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [sidebarOpen, setSidebarOpen]       = useState(true)

  const groupCounts = useMemo(() => {
    const counts = {}
    for (const ch of channels) {
      if (ch.group) counts[ch.group] = (counts[ch.group] || 0) + 1
    }
    return counts
  }, [channels])

  const categories = useMemo(() => {
    const groups = Object.keys(groupCounts).sort((a, b) => groupCounts[b] - groupCounts[a])
    return [
      { id: 'all', label: 'All Channels', icon: 'tv', count: channels.length },
      ...groups.map(g => ({
        id: g,
        label: g,
        icon: getIcon(g),
        count: groupCounts[g],
      })),
    ]
  }, [groupCounts, channels.length])

  const filteredChannels = useMemo(() => {
    let result = channels
    if (activeCategory !== 'all') {
      result = result.filter(ch => ch.group === activeCategory)
    }

    if (searchQuery.trim()) {
      const scored = result
        .map(ch => ({
          ch,
          score: fuzzyScore(ch.name || '', ch.group || '', searchQuery),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || (a.ch.name || '').localeCompare(b.ch.name || ''))
      return scored.map(({ ch }) => ch)
    }

    // Default: A-Z alphabetical
    return [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [channels, activeCategory, searchQuery])

  const handleSelectCategory = (id) => {
    setActiveCategory(id)
    setSelectedChannel(null)
  }

  return (
    <div className={styles.app}>
      <Header
        channelCount={channels.length}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onToggleSidebar={() => setSidebarOpen(p => !p)}
        sidebarOpen={sidebarOpen}
      />
      <div className={styles.body}>
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          isOpen={sidebarOpen}
        />
        <div className={styles.content}>
          {selectedChannel && (
            <Player
              channel={selectedChannel}
              onClose={() => setSelectedChannel(null)}
            />
          )}
          <ChannelGrid
            channels={filteredChannels}
            loading={loading}
            error={error}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            activeCategory={activeCategory}
          />
        </div>
      </div>
    </div>
  )
}
