import styles from './PixelButton.module.css'

interface PixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  fullWidth?: boolean
  id?: string
}

/**
 * 通用像素风按钮
 * 使用多层 box-shadow 模拟街机按钮按下效果
 */
export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  id,
}: PixelButtonProps) {
  return (
    <button
      id={id}
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
