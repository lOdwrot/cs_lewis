import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useProgressStore } from '@/store/progressStore'
import styles from './PodcastStep.module.scss'

interface Props {
  src: string
  stepId: string
  onComplete: () => void
}

function formatTime(sec: number): string {
  if (!isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, stepId, onComplete }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastSaveRef = useRef(0)

  const { savePodcastProgress, getPodcastProgress } = useProgressStore()
  const savedTime = getPodcastProgress(stepId)

  // Restore saved position on mount
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onLoaded = () => {
      if (savedTime > 0 && savedTime < audio.duration - 2) {
        audio.currentTime = savedTime
        setCurrentTime(savedTime)
      }
    }
    audio.addEventListener('loadedmetadata', onLoaded)
    return () => audio.removeEventListener('loadedmetadata', onLoaded)
  }, [savedTime])

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    if (audio.currentTime - lastSaveRef.current > 5) {
      savePodcastProgress(stepId, audio.currentTime)
      lastSaveRef.current = audio.currentTime
    }
  }, [stepId, savePodcastProgress])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    savePodcastProgress(stepId, 0)
    onComplete()
  }, [stepId, savePodcastProgress, onComplete])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play(); setIsPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration))
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className={styles.player}>
        <div className={styles.progressRow}>
          <div className={styles.timeRow}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className={styles.progressTrack} onClick={seek}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        </div>

        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={() => skip(-10)} title="Rewind 10s">
            <span className="material-symbols-outlined">replay_10</span>
          </button>

          <motion.button
            className={styles.playBtn}
            onClick={togglePlay}
            whileTap={{ scale: 0.92 }}
          >
            <span className="material-symbols-outlined">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </motion.button>

          <button className={styles.ctrlBtn} onClick={() => skip(30)} title="Forward 30s">
            <span className="material-symbols-outlined">forward_30</span>
          </button>

          <div className={styles.dividerSmall} />

          <button className={styles.ctrlBtn} title="Volume">
            <span className="material-symbols-outlined">volume_up</span>
          </button>
        </div>
      </div>
    </>
  )
}
