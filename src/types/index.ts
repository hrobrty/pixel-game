// 全局业务类型定义

export type OptionKey = 'A' | 'B' | 'C' | 'D'

export interface Question {
  /** 题号（来自 Google Sheets 第一列） */
  id: number
  /** 题目正文 */
  text: string
  /** 四个选项 */
  options: Record<OptionKey, string>
}

export interface GameResult {
  /** 玩家输入的 ID */
  playerId: string
  /** key: 题号, value: 所选选项 */
  answers: Record<number, OptionKey>
  /** 本局总题数 */
  totalQuestions: number
}

export interface ScoreResponse {
  /** 答对题数 */
  correctCount: number
  /** 总题数 */
  totalQuestions: number
  /** 是否通关（正确率 >= PASS_THRESHOLD） */
  passed: boolean
  /** 本次正确率 0~100 */
  accuracy: number
}

/** 游戏状态机 */
export type GamePhase = 'idle' | 'loading' | 'playing' | 'submitting' | 'result'
