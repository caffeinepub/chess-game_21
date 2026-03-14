import { motion } from "motion/react";
import { useState } from "react";
import { ChessBoard } from "./components/ChessBoard";
import { GameStatus } from "./components/GameStatus";
import { ModeSelector } from "./components/ModeSelector";
import { PromotionModal } from "./components/PromotionModal";
import type { DifficultyLevel } from "./engine/chessAI";
import { DIFFICULTY_LABELS } from "./engine/chessAI";
import { useChess } from "./hooks/useChess";
import type { GameMode, PieceColor } from "./hooks/useChess";

export default function App() {
  const {
    board,
    currentTurn,
    selectedSquare,
    validMoves,
    gameStatus,
    promotionPending,
    lastMove,
    gameMode,
    playerColor,
    isAIThinking,
    difficulty,
    handleSquareClick,
    promotePawn,
    newGame,
  } = useChess();

  const [showModeSelector, setShowModeSelector] = useState(true);

  const handleModeConfirm = (
    mode: GameMode,
    pColor: PieceColor,
    diff: DifficultyLevel,
  ) => {
    setShowModeSelector(false);
    newGame(mode, pColor, diff);
  };

  const modeLabelMap: Record<GameMode, string> = {
    pvp: "Jugador vs Jugador",
    pvc: `vs Computadora · ${playerColor === "white" ? "Blancas" : "Negras"} · Nivel ${difficulty} - ${DIFFICULTY_LABELS[difficulty]}`,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, oklch(0.22 0.04 55) 0%, oklch(0.14 0.025 50) 60%, oklch(0.10 0.02 45) 100%)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-center pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h1
            className="font-display text-4xl font-bold tracking-tight"
            style={{ color: "#c9a97a", letterSpacing: "0.05em" }}
          >
            ♟ Chess
          </h1>
          <p className="font-body text-xs mt-1" style={{ color: "#7a5c3a" }}>
            {modeLabelMap[gameMode]}
          </p>
        </motion.div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
          style={{ maxWidth: 580, width: "100%" }}
        >
          {/* Status bar */}
          <div
            className="w-full px-4 py-3 rounded-xl"
            style={{
              background: "oklch(0.22 0.03 55)",
              border: "1px solid oklch(0.32 0.04 55)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <GameStatus
              currentTurn={currentTurn}
              gameStatus={gameStatus}
              gameMode={gameMode}
              playerColor={playerColor}
              isAIThinking={isAIThinking}
              onNewGame={() => newGame()}
              onChangeMode={() => setShowModeSelector(true)}
            />
          </div>

          {/* Board */}
          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            onSquareClick={handleSquareClick}
          />

          {/* Move hints */}
          <p
            className="text-xs font-body text-center"
            style={{ color: "#5a4030" }}
          >
            {gameMode === "pvc" && isAIThinking
              ? "La computadora está calculando su movimiento..."
              : "Haz clic en una pieza para ver movimientos · Clic de nuevo para mover"}
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs font-body" style={{ color: "#4a3020" }}>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: "#7a5c3a" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Promotion modal */}
      {promotionPending && (
        <PromotionModal
          color={promotionPending.color}
          onPromote={promotePawn}
        />
      )}

      {/* Mode selector */}
      {showModeSelector && (
        <ModeSelector
          onConfirm={handleModeConfirm}
          currentMode={gameMode}
          currentPlayerColor={playerColor}
          currentDifficulty={difficulty}
        />
      )}
    </div>
  );
}
