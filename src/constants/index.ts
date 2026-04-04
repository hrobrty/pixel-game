// 全局常量配置
// NOTE: 从环境变量读取，保证敏感配置不硬编码

export const GAS_URL = import.meta.env.VITE_GAS_URL ?? ''

/**
 * 通关正确率门槛（0~100 整数）
 * 例：70 代表答对 70% 以上才算通关
 */
export const PASS_THRESHOLD = Number(import.meta.env.VITE_PASS_THRESHOLD ?? 70)

/** 每局随机题目数量 */
export const QUESTION_COUNT = Number(import.meta.env.VITE_QUESTION_COUNT ?? 10)

/** DiceBear pixel-art SVG base URL，seed 1~100 */
export const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/pixel-art/svg'

/** 预载关主头像的种子范围 */
export const AVATAR_SEED_COUNT = 100
