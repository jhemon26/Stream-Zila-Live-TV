import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import styles from './Player.module.css'

export default function Player({ channel, onClose }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'playing' | 'error'
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !channel?.url) return

    setStatus('loading')

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
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
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url
      const onMeta = () => {
        setStatus('playing')
        video.play().catch(() => {})
      }
      video.addEventListener('loadedmetadata', onMeta, { once: true })
      video.addEventListener('error', () => setStatus('error'), { once: true })
    } else {
      setStatus('error')
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
      video.src = ''
    }
  }, [channel])

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  return (
    <div className={styles.playerContainer}>
      <div className={styles.videoSection}>
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            className={styles.video}
            controls={false}
            playsInline
          />
          {status === 'loading' && (
            <div className={styles.overlay}>
              <div className={styles.overlaySpinner} />
              <span className={styles.overlayText}>Connecting to stream...</span>
            </div>
          )}
          {status === 'error' && (
            <div className={styles.overlay}>
              <span className={`material-symbols-outlined ${styles.overlayIcon}`}>
                signal_disconnected
              </span>
              <span className={styles.overlayText}>Stream unavailable</span>
              <span className={styles.overlaySubtext}>
                This channel may be temporarily offline
              </span>
            </div>
          )}
          <div className={styles.videoControls}>
            <button className={styles.controlBtn} onClick={handleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              <span className="material-symbols-outlined">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <button
              className={styles.controlBtn}
              onClick={() => {
                const v = videoRef.current
                if (v) v.requestFullscreen?.()
              }}
              title="Fullscreen"
            >
              <span className="material-symbols-outlined">fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.infoBar}>
        <div className={styles.channelLogo}>
          <img
            src={channel.logo}
            alt=""
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
        <div className={styles.channelMeta}>
          <div className={styles.channelTopRow}>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              LIVE
            </span>
            <h2 className={styles.channelName}>{channel.name}</h2>
          </div>
          {channel.group && (
            <span className={styles.channelGroup}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>folder</span>
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
