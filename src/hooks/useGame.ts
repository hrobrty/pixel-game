import { useCallback, useReducer } from 'react'
import type { GamePhase, GameResult, OptionKey, Question, ScoreResponse } from '../types'
import { fetchQuestions, submitAnswers } from '../services/api'

interface GameState {
  phase: GamePhase
  playerId: string
  questions: Question[]
  currentIndex: number
  /** key: 题号(question.id), value: 选项 */
  answers: Record<number, OptionKey>
  result: ScoreResponse | null
  error: string | null
}

type GameAction =
  | { type: 'START_LOADING'; playerId: string }
  | { type: 'QUESTIONS_LOADED'; questions: Question[] }
  | { type: 'SELECT_ANSWER'; questionId: number; option: OptionKey }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SUBMIT' }
  | { type: 'RESULT_RECEIVED'; result: ScoreResponse }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

const initialState: GameState = {
  phase: 'idle',
  playerId: '',
  questions: [],
  currentIndex: 0,
  answers: {},
  result: null,
  error: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_LOADING':
      return { ...initialState, phase: 'loading', playerId: action.playerId }

    case 'QUESTIONS_LOADED':
      return { ...state, phase: 'playing', questions: action.questions }

    case 'SELECT_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.option },
      }

    case 'NEXT_QUESTION':
      return { ...state, currentIndex: state.currentIndex + 1 }

    case 'SUBMIT':
      return { ...state, phase: 'submitting' }

    case 'RESULT_RECEIVED':
      return { ...state, phase: 'result', result: action.result }

    case 'ERROR':
      return { ...state, phase: 'idle', error: action.message }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

/**
 * 核心游戏状态 Hook
 * 封装状态机、题目拉取、答案提交完整生命周期
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  /** 输入 ID 后开始游戏，拉取题目 */
  const startGame = useCallback(async (playerId: string) => {
    dispatch({ type: 'START_LOADING', playerId })
    try {
      const questions = await fetchQuestions()
      dispatch({ type: 'QUESTIONS_LOADED', questions })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : '載入題目失敗' })
    }
  }, [])

  /** 选择当前题的答案 */
  const selectAnswer = useCallback((questionId: number, option: OptionKey) => {
    dispatch({ type: 'SELECT_ANSWER', questionId, option })
  }, [])

  /** 前往下一题或提交 */
  const nextOrSubmit = useCallback(async () => {
    const { currentIndex, questions, answers, playerId } = state
    const isLast = currentIndex >= questions.length - 1

    if (!isLast) {
      dispatch({ type: 'NEXT_QUESTION' })
      return
    }

    // 最后一题 → 提交
    dispatch({ type: 'SUBMIT' })
    const gameResult: GameResult = {
      playerId,
      answers,
      totalQuestions: questions.length,
    }
    try {
      const result = await submitAnswers(gameResult)
      dispatch({ type: 'RESULT_RECEIVED', result })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : '提交失敗' })
    }
  }, [state])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const currentQuestion = state.questions[state.currentIndex] ?? null
  const currentAnswer = currentQuestion ? state.answers[currentQuestion.id] : undefined

  return {
    ...state,
    currentQuestion,
    currentAnswer,
    startGame,
    selectAnswer,
    nextOrSubmit,
    reset,
  }
}
