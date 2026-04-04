import { useEffect, useState } from 'react'
import type { ScoreResponse } from '../types'
import { PixelButton } from '../components/PixelButton'
import { PASS_THRESHOLD } from '../constants'
import styles from './ResultPage.module.css'

interface ResultPageProps {
  result: ScoreResponse
  playerId: string
  onReplay: () => void
}

/**
 * 结果页
 * 通关 → 胜利像素爆炸動画 + 绿色
 * 失败 → 红色 GAME OVER 像素效果
 * NOTE: PASS_THRESHOLD 从环境变量读取，前端仅做展示，实际通关判定由 GAS 返回
 */
export function ResultPage({ result, playerId, onReplay }: ResultPageProps) {
  const { passed, correctCount, totalQuestions, accuracy } = result
  const [animate, setAnimate] = useState(false)

  // NOTE: 延迟一帧触发动画，确保组件已挂载
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const accuracyDisplay = Math.round(accuracy)
  const scoreStars = passed
    ? accuracy >= 90 ? '★★★' : accuracy >= 80 ? '★★☆' : '★☆☆'
    : '☆☆☆'

  return (
    <div
      className={[
        styles.page,
        passed ? styles.pagePassed : styles.pageFailed,
        animate && passed ? 'victory-flash' : '',
        'crt-scanlines crt-vignette',
      ].join(' ')}
    >
      <div className={styles.bgGrid} aria-hidden />

      <main className={styles.main}>
        {/* 通关/失败大标题 */}
        <div className={[styles.resultTitle, animate ? styles.titleAnimate : ''].join(' ')}>
          {passed ? (
            <>
              <div className={`${styles.titleBig} text-glow-green`}>CLEAR!</div>
              <div className={styles.titleSub}>STAGE COMPLETE</div>
            </>
          ) : (
            <>
              <div className={`${styles.titleBig} ${styles.titleGameOver} text-glow-red`}>
                GAME
                <br />
                OVER
              </div>
              <div className={styles.titleSub}>TRY AGAIN...</div>
            </>
          )}
        </div>

        {/* 分数面板 */}
        <div className={[styles.scorePanel, animate ? styles.panelAnimate : ''].join(' ')}>
          <div className={styles.playerRow}>
            <span className={styles.scoreLabel}>PLAYER</span>
            <span className={styles.scoreValue}>{playerId}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.statRow}>
            <span className={styles.scoreLabel}>CORRECT</span>
            <span className={`${styles.scoreValue} text-glow-yellow`}>
              {correctCount} / {totalQuestions}
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.scoreLabel}>ACCURACY</span>
            <span
              className={`${styles.scoreValue} ${passed ? 'text-glow-green' : 'text-glow-red'}`}
            >
              {accuracyDisplay}%
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.scoreLabel}>THRESHOLD</span>
            <span className={styles.scoreValue}>{PASS_THRESHOLD}%</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.starsRow}>
            <span className={`${styles.stars} ${passed ? 'text-glow-yellow' : ''}`}>
              {scoreStars}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={[styles.actions, animate ? styles.actionsAnimate : ''].join(' ')}>
          <PixelButton id="replay-btn" onClick={onReplay}>
            ↺ PLAY AGAIN
          </PixelButton>
        </div>

        {/* 鼓励语 */}
        <p className={`${styles.encouragement} blink`}>
          {passed ? '★ CONGRATULATIONS! ★' : '--- INSERT COIN TO CONTINUE ---'}
        </p>
      </main>
    </div>
  )
}
