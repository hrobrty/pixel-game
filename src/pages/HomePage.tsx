import { useState, type FormEvent } from 'react'
import { PixelButton } from '../components/PixelButton'
import styles from './HomePage.module.css'

interface HomePageProps {
  onStart: (playerId: string) => void
  error: string | null
}

/**
 * 首页 — 输入玩家 ID 开始游戏
 * 街机风格：CRT 效果、闪烁 INSERT COIN 提示、像素标题
 */
export function HomePage({ onStart, error }: HomePageProps) {
  const [playerId, setPlayerId] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = playerId.trim()
    if (trimmed) onStart(trimmed)
  }

  return (
    <div className={`${styles.page} crt-scanlines crt-vignette`}>
      {/* 背景装饰像素格 */}
      <div className={styles.bgGrid} aria-hidden />

      <main className={styles.main}>
        {/* 主标题 */}
        <div className={styles.titleBlock}>
          <div className={styles.titleBadge}>STAGE CHALLENGE</div>
          <h1 className={`${styles.title} text-glow-green`}>
            PIXEL
            <br />
            QUIZ
          </h1>
          <p className={styles.subtitle}>知識闖關 · KNOWLEDGE GAUNTLET</p>
        </div>

        {/* 输入表单 */}
        <form className={styles.form} onSubmit={handleSubmit} id="start-form">
          <label className={styles.label} htmlFor="player-id-input">
            ENTER YOUR ID
          </label>
          <div className={styles.inputRow}>
            <span className={styles.cursor}>{'>'}</span>
            <input
              id="player-id-input"
              className={styles.input}
              type="text"
              value={playerId}
              onChange={e => setPlayerId(e.target.value)}
              placeholder="your_id"
              maxLength={30}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <p className={`${styles.error} text-glow-red`}>
              ⚠ {error}
            </p>
          )}

          <PixelButton
            id="start-btn"
            fullWidth
            disabled={!playerId.trim()}
          >
            INSERT COIN &amp; START ▶
          </PixelButton>
        </form>

        {/* 闪烁提示 */}
        <p className={`${styles.hint} blink`}>
          PRESS START
        </p>

        {/* 底部装饰分数板 */}
        <div className={styles.scoreboard}>
          <span>HI-SCORE</span>
          <span className={`${styles.scoreValue} text-glow-yellow`}>000000</span>
        </div>
      </main>

      {/* 版权 */}
      <footer className={styles.footer}>
        © 2024 PIXEL QUIZ &nbsp;·&nbsp; ARCADE EDITION
      </footer>
    </div>
  )
}
