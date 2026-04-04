import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
  message?: string
}

/**
 * 全屏加载遮罩
 * 像素风旋转 loading + 文字
 */
export function LoadingScreen({ message = 'LOADING...' }: LoadingScreenProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}>
        <div className={styles.pixel} />
        <div className={styles.pixel} />
        <div className={styles.pixel} />
        <div className={styles.pixel} />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
