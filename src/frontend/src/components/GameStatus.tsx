import { AnimatePresence, motion } from "motion/react";
import type { GameMode, PieceColor } from "../hooks/useChess";
import type { GameStatus as GameStatusType } from "../hooks/useChess";

interface GameStatusProps {
  currentTurn: PieceColor;
  gameStatus: GameStatusType;
  gameMode: GameMode;
  playerColor: PieceColor;
  isAIThinking: boolean;
  onNewGame: () => void;
  onChangeMode: () => void;
}

function getStatusMessage(
  currentTurn: PieceColor,
  gameStatus: GameStatusType,
  gameMode: GameMode,
  playerColor: PieceColor,
  isAIThinking: boolean,
): { primary: string; secondary: string; accent: string } {
  const isPlayerTurn = gameMode === "pvp" || currentTurn === playerColor;
  const turnName = currentTurn === "white" ? "White" : "Black";
  const winnerColor: PieceColor = currentTurn === "white" ? "black" : "white";
  const winnerName = winnerColor === "white" ? "White" : "Black";
  const playerWon = gameMode === "pvc" && winnerColor === playerColor;
  const computerWon = gameMode === "pvc" && winnerColor !== playerColor;

  switch (gameStatus) {
    case "checkmate":
      return {
        primary: "Checkmate!",
        secondary:
          gameMode === "pvc"
            ? playerWon
              ? "You win! 🎉"
              : "Computer wins"
            : `${winnerName} wins the match`,
        accent: computerWon ? "#e05c3a" : "#f9f0dc",
      };
    case "stalemate":
      return {
        primary: "Stalemate",
        secondary: "The game is a draw",
        accent: "#c9a97a",
      };
    case "check":
      return {
        primary:
          gameMode === "pvc"
            ? isPlayerTurn
              ? "You are in Check!"
              : "Computer is in Check!"
            : `${turnName} is in Check!`,
        secondary: "Escape the threat",
        accent: "#e05c3a",
      };
    default:
      if (isAIThinking) {
        return {
          primary: "Computer is thinking...",
          secondary: "Please wait",
          accent: "#b58863",
        };
      }
      return {
        primary:
          gameMode === "pvc"
            ? isPlayerTurn
              ? "Your Turn"
              : "Computer's Turn"
            : `${turnName}'s Turn`,
        secondary: "Make your move",
        accent: currentTurn === "white" ? "#f0d9b5" : "#b58863",
      };
  }
}

export function GameStatus({
  currentTurn,
  gameStatus,
  gameMode,
  playerColor,
  isAIThinking,
  onNewGame,
  onChangeMode,
}: GameStatusProps) {
  const { primary, secondary, accent } = getStatusMessage(
    currentTurn,
    gameStatus,
    gameMode,
    playerColor,
    isAIThinking,
  );
  const isGameOver = gameStatus === "checkmate" || gameStatus === "stalemate";

  return (
    <div
      data-ocid="chess.status.panel"
      className="flex items-center justify-between w-full gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Indicator dot or spinner */}
        {isAIThinking ? (
          <div
            data-ocid="chess.thinking.loading_state"
            className="w-4 h-4 rounded-full flex-shrink-0 animate-pulse"
            style={{
              background: "#b58863",
              border: "2px solid #8b5e2e",
              boxShadow: "0 0 8px #b5886360",
            }}
          />
        ) : (
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{
              background: currentTurn === "white" ? "#f0d9b5" : "#2a1400",
              border:
                currentTurn === "white"
                  ? "2px solid #c9a97a"
                  : "2px solid #8b5e2e",
              boxShadow: `0 0 8px ${accent}60`,
            }}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${primary}-${secondary}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="min-w-0"
          >
            <div
              className="font-display font-bold text-base leading-tight truncate"
              style={{ color: accent }}
            >
              {primary}
            </div>
            <div className="text-xs font-body" style={{ color: "#7a5c3a" }}>
              {secondary}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onChangeMode}
          className="px-3 py-2 rounded-lg font-body font-semibold text-xs transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(139, 94, 46, 0.15)",
            border: "1px solid rgba(139, 94, 46, 0.4)",
            color: "#7a5c3a",
            cursor: "pointer",
          }}
        >
          Mode
        </button>
        <button
          type="button"
          data-ocid="chess.new_game.button"
          onClick={onNewGame}
          className="px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: isGameOver
              ? "linear-gradient(135deg, #8b5e2e, #c97c3a)"
              : "rgba(139, 94, 46, 0.3)",
            border: "1px solid rgba(139, 94, 46, 0.6)",
            color: isGameOver ? "#f9f0dc" : "#c9a97a",
            boxShadow: isGameOver ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
            cursor: "pointer",
          }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
