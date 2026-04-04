import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  current: number
  total: number
}

/**
 * 像素风关卡进度条
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <span>STAGE</span>
        <span className={styles.count}>
          {String(current).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
        />
        {/* 像素分割块 */}
        <div className={styles.segments}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={[styles.seg, i < current ? styles.segDone : ''].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
