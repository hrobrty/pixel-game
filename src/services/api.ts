import type { GameResult, Question, ScoreResponse } from '../types'
import { GAS_URL, QUESTION_COUNT } from '../constants'

/**
 * 从 GAS 随机拉取 N 道题目（不含解答）
 * NOTE: GAS doGet 返回 JSON，需设置为「所有人可访问」
 */
export async function fetchQuestions(): Promise<Question[]> {
  const url = new URL(GAS_URL)
  url.searchParams.set('action', 'getQuestions')
  url.searchParams.set('count', String(QUESTION_COUNT))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`拉取題目失敗: ${res.status}`)

  const data = (await res.json()) as { questions: Question[] }
  return data.questions
}

/**
 * 提交答题结果到 GAS，计算分数并写入 Google Sheets
 * NOTE: GAS POST 受 CORS 限制，用 form-encoded 绕过 preflight，
 *       实际 JSON 放在 payload 字段里
 */
export async function submitAnswers(result: GameResult): Promise<ScoreResponse> {
  const body = new URLSearchParams({
    action: 'submitAnswers',
    payload: JSON.stringify(result),
  })

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) throw new Error(`提交答案失敗: ${res.status}`)

  return (await res.json()) as ScoreResponse
}
