import type React from 'react'
import type { OptionKey } from '../../types'
import styles from './OptionButton.module.css'

interface OptionButtonProps {
  optionKey: OptionKey
  text: string
  selected: boolean
  onSelect: (key: OptionKey) => void
}

const KEY_COLORS: Record<OptionKey, string> = {
  A: '#ff6b35',
  B: '#4488ff',
  C: '#ffd700',
  D: '#cc44ff',
}

/**
 * ABCD 选项按钮
 * 选中后边框发光，再次点击可取消选择
 */
export function OptionButton({ optionKey, text, selected, onSelect }: OptionButtonProps) {
  const color = KEY_COLORS[optionKey]

  return (
    <button
      className={[styles.btn, selected ? styles.selected : ''].join(' ')}
      style={{
        '--key-color': color,
        '--key-color-dim': `${color}66`,
      } as React.CSSProperties}
      onClick={() => onSelect(optionKey)}
      id={`option-${optionKey}`}
    >
      <span className={styles.key}>{optionKey}</span>
      <span className={styles.text}>{text}</span>
    </button>
  )
}
