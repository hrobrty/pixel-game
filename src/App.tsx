import { useGame } from './hooks/useGame'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'
import { ResultPage } from './pages/ResultPage'
import { LoadingScreen } from './components/LoadingScreen'

/**
 * 应用根组件
 * 用 phase 状态机驱动页面切换，无需 react-router（单页无多路由需求）
 */
export default function App() {
  const {
    phase,
    playerId,
    currentQuestion,
    currentIndex,
    questions,
    currentAnswer,
    result,
    error,
    startGame,
    selectAnswer,
    nextOrSubmit,
    reset,
  } = useGame()

  if (phase === 'loading') {
    return <LoadingScreen message="FETCHING QUESTIONS..." />
  }

  if (phase === 'idle') {
    return <HomePage onStart={startGame} error={error} />
  }

  if (phase === 'playing' || phase === 'submitting') {
    return (
      <GamePage
        playerId={playerId}
        currentQuestion={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        currentAnswer={currentAnswer}
        isSubmitting={phase === 'submitting'}
        onSelect={selectAnswer}
        onNext={nextOrSubmit}
      />
    )
  }

  if (phase === 'result' && result) {
    return <ResultPage result={result} playerId={playerId} onReplay={reset} />
  }

  // fallback — 不应该到达
  return <LoadingScreen />
}
