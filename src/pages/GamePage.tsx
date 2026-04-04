import type { OptionKey, Question, ScoreResponse } from '../types'
import { BossAvatar } from '../components/BossAvatar'
import { OptionButton } from '../components/OptionButton'
import { ProgressBar } from '../components/ProgressBar'
import { PixelButton } from '../components/PixelButton'
import { LoadingScreen } from '../components/LoadingScreen'
import styles from './GamePage.module.css'

interface GamePageProps {
  playerId: string
  currentQuestion: Question | null
  currentIndex: number
  totalQuestions: number
  currentAnswer: OptionKey | undefined
  isSubmitting: boolean
  onSelect: (questionId: number, option: OptionKey) => void
  onNext: () => void
}

const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D']

/**
 * 游戏答题页面
 * 左侧关主头像 + 右侧题目选项
 * 关主 seed = (currentIndex % 100) + 1，保证每题不同关主
 */
export function GamePage({
  playerId,
  currentQuestion,
  currentIndex,
  totalQuestions,
  currentAnswer,
  isSubmitting,
  onSelect,
  onNext,
}: GamePageProps) {
  if (isSubmitting) {
    return <LoadingScreen message="CALCULATING SCORE..." />
  }

  if (!currentQuestion) {
    return <LoadingScreen message="LOADING..." />
  }

  const bossSeeed = (currentIndex % 100) + 1
  const isLast = currentIndex >= totalQuestions - 1
  const canProceed = currentAnswer !== undefined

  return (
    <div className={`${styles.page} crt-scanlines crt-vignette`}>
      <div className={styles.bgGrid} aria-hidden />

      <header className={styles.header}>
        <div className={styles.playerTag}>
          <span className={styles.playerLabel}>PLAYER</span>
          <span className={styles.playerName}>{playerId}</span>
        </div>
        <ProgressBar current={currentIndex} total={totalQuestions} />
        <div className={styles.stageTag}>
          Q.{String(currentIndex + 1).padStart(2, '0')}
        </div>
      </header>

      <main className={styles.main}>
        {/* 关主头像 */}
        <aside className={styles.bossPanel}>
          <BossAvatar seed={bossSeeed} bossName={`BOSS ${bossSeeed}`} />
          <div className={styles.bossHp}>
            <span className={styles.hpLabel}>BOSS HP</span>
            <div className={styles.hpBar}>
              <div
                className={styles.hpFill}
                style={{ width: `${100 - (currentIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* 题目与选项 */}
        <section className={styles.questionPanel}>
          <div className={styles.questionBox}>
            <span className={styles.qNum}>Q{currentIndex + 1}</span>
            <p className={styles.questionText}>{currentQuestion.text}</p>
          </div>

          <div className={styles.options}>
            {OPTION_KEYS.map(key => (
              <OptionButton
                key={key}
                optionKey={key}
                text={currentQuestion.options[key]}
                selected={currentAnswer === key}
                onSelect={option => onSelect(currentQuestion.id, option)}
              />
            ))}
          </div>

          <div className={styles.actionRow}>
            <PixelButton
              id="next-btn"
              disabled={!canProceed}
              onClick={onNext}
            >
              {isLast ? 'SUBMIT ▶▶' : 'NEXT STAGE ▶'}
            </PixelButton>
          </div>
        </section>
      </main>
    </div>
  )
}
