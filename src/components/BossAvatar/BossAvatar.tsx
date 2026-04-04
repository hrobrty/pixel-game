import styles from './BossAvatar.module.css'
import { DICEBEAR_BASE } from '../../constants'

interface BossAvatarProps {
  /** 种子编号 1~100，对应不同关主 */
  seed: number
  /** 关卡名称 */
  bossName?: string
}

/**
 * 关主头像组件
 * 使用 DiceBear pixel-art 生成 SVG，每关一个独立关主造型
 */
export function BossAvatar({ seed, bossName }: BossAvatarProps) {
  const avatarUrl = `${DICEBEAR_BASE}?seed=${seed}&backgroundColor=1a1a2e&pixelated=true`

  return (
    <div className={styles.wrapper}>
      <div className={styles.frame}>
        <div className={styles.scanline} />
        <img
          src={avatarUrl}
          alt={`关主 ${bossName ?? seed}`}
          className={styles.avatar}
          width={120}
          height={120}
        />
      </div>
      {bossName && (
        <p className={styles.name}>
          <span className={styles.nameBracket}>{'['}</span>
          {bossName}
          <span className={styles.nameBracket}>{']'}</span>
        </p>
      )}
    </div>
  )
}
