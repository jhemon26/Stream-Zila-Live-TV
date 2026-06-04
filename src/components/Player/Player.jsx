import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import styles from './Player.module.css'

export default function Player({ channel, onClose }) {
  const videoRef    = useRef(null)
  const hlsRef      = useRef(null)
  const retryRef    = useRef(0)

  const [status, setStatus]   = useState('loading') // 'loading' | 'playing' | 'error'
  const [volume, setVolume]   = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [logoError, setLogoError]     = useState(false)

  const initPlayer = useCallback(() => {
    const video = videoRef.current
    if (!video || !channel?.url) return

    setStatus('loading')
    setIsBuffering(false)

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    video.volume = volume
    video.muted  = isMuted

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker:     true,
        lowLatencyMode:   true,
        backBufferLength: 15,
        maxBufferLength:  20,
      })
      hlsRef.current = hls
      hls.loadSource(channel.url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing')
        video.play().catch(() => {})
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus('error')
        }
      })

      video.addEventListener('waiting',  () => setIsBuffering(true),  { signal: hls._abortController?.signal })
      video.addEventListener('canplay',  () => setIsBuffering(false))
      video.addEventListener('playing',  () => setIsBuffering(false))
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing')
        video.play().catch(() => {})
      }, { once: true })
      video.addEventListener('error', () => setStatus('error'), { once: true })
    } else {
      setStatus('error')
    }
  }, [channel]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    retryRef.current = 0
    setLogoError(false)
    initPlayer()
    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
      if (videoRef.current) videoRef.current.src = ''
    }
  }, [channel])

  const handleRetry = () => {
    retryRef.current += 1
    initPlayer()
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    setIsMuted(val === 0)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted  = val === 0
    }
  }

  const handleMuteToggle = () => {
    const next = !isMuted
    setIsMuted(next)
    if (videoRef.current) videoRef.current.muted = next
  }

  const handleFullscreen = () => {
    const el = videoRef.current?.parentElement
    el?.requestFullscreen?.()
  }

  const volumeIcon = isMuted || volume === 0 ? 'volume_off'
                   : volume < 0.4            ? 'volume_down'
                                             : 'volume_up'

  return (
    <div className={styles.container}>
      {/* ── Video area ──────────────────────────────── */}
      <div className={styles.videoArea}>
        <video ref={videoRef} className={styles.video} playsInline />

        {/* Buffering spinner (overlay, doesn't block controls) */}
        {isBuffering && status === 'playing' && (
          <div className={styles.bufferOverlay}>
            <div className={styles.bufferSpinner} />
          </div>
        )}

        {/* Loading state */}
        {status === 'loading' && (
          <div className={styles.stateOverlay}>
            <div className={styles.stateSpinner} />
            <span className={styles.stateText}>Connecting to stream...</span>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className={styles.stateOverlay}>
            <span className={`material-symbols-outlined ${styles.stateIcon}`}>
              signal_disconnected
            </span>
            <span className={styles.stateText}>Stream unavailable</span>
            <span className={styles.stateSubtext}>
              This channel may be offline or geo-restricted
            </span>
            <button className={styles.retryBtn} onClick={handleRetry}>
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
          </div>
        )}

        {/* Live indicator bar (top edge when playing) */}
        {status === 'playing' && <div className={styles.liveBar} />}

        {/* Control bar (always visible) */}
        <div className={styles.controlBar}>
          <div className={styles.controlLeft}>
            <button
              className={styles.ctrlBtn}
              onClick={handleMuteToggle}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <span className="material-symbols-outlined">{volumeIcon}</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              title="Volume"
            />
          </div>

          <div className={styles.controlCenter}>
            {status === 'playing' && (
              <span className={styles.livePill}>
                <span className={styles.liveDot} />
                LIVE
              </span>
            )}
          </div>

          <div className={styles.controlRight}>
            <button
              className={styles.ctrlBtn}
              onClick={handleFullscreen}
              title="Fullscreen"
            >
              <span className="material-symbols-outlined">fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Channel info bar ────────────────────────── */}
      <div className={styles.infoBar}>
        <div className={styles.channelLogoBox}>
          {channel.logo && !logoError ? (
            <img
              src={channel.logo}
              alt=""
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>
              live_tv
            </span>
          )}
        </div>

        <div className={styles.channelMeta}>
          <div className={styles.metaTop}>
            {status === 'playing' && (
              <span className={styles.liveBadge}>
                <span className={styles.liveDot2} />
                LIVE
              </span>
            )}
            <span className={styles.channelName}>{channel.name}</span>
          </div>
          {channel.group && (
            <span className={styles.channelGroup}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>folder</span>
              {' '}{channel.group}
            </span>
          )}
        </div>

        <button className={styles.closeBtn} onClick={onClose} title="Close player">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  )
}
