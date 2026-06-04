import { useState, useEffect } from 'react'

const LOCAL_URL = './channels.json'
const FALLBACK_URL = 'https://raw.githubusercontent.com/SHAJON-404/iptv/refs/heads/main/channels.json'

export default function useChannels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        let data = null

        try {
          const res = await fetch(LOCAL_URL)
          if (res.ok) {
            const json = await res.json()
            if (Array.isArray(json) && json.length > 0) {
              data = json
            }
          }
        } catch {
          // local file not available, try fallback
        }

        if (!data) {
          const res = await fetch(FALLBACK_URL)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          data = await res.json()
        }

        if (!cancelled) {
          setChannels(Array.isArray(data) ? data : [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load channels. Please check your connection.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { channels, loading, error }
}
