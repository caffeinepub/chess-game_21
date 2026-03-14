import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { DifficultyLevel } from "../engine/chessAI";
import { DIFFICULTY_LABELS } from "../engine/chessAI";
import type { GameMode, PieceColor } from "../hooks/useChess";

interface ModeSelectorProps {
  onConfirm: (
    mode: GameMode,
    playerColor: PieceColor,
    difficulty: DifficultyLevel,
  ) => void;
  currentMode: GameMode;
  currentPlayerColor: PieceColor;
  currentDifficulty: DifficultyLevel;
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3, 4, 5, 6];

export function ModeSelector({
  onConfirm,
  currentMode,
  currentPlayerColor,
  currentDifficulty,
}: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
  const [selectedColor, setSelectedColor] =
    useState<PieceColor>(currentPlayerColor);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel>(currentDifficulty);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center gap-5 p-8 rounded-2xl"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.20 0.035 55), oklch(0.26 0.04 55))",
          border: "1px solid oklch(0.35 0.05 55)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
          minWidth: 340,
          maxWidth: 420,
          width: "90vw",
        }}
      >
        <div className="text-center">
          <h2
            className="font-display text-2xl font-bold"
            style={{ color: "#c9a97a" }}
          >
            Game Mode
          </h2>
          <p className="text-xs font-body mt-1" style={{ color: "#7a5c3a" }}>
            Choose how you want to play
          </p>
        </div>

        {/* Mode selection */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            data-ocid="chess.mode.pvp_button"
            onClick={() => setSelectedMode("pvp")}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
            style={{
              background:
                selectedMode === "pvp"
                  ? "linear-gradient(135deg, rgba(139,94,46,0.5), rgba(201,124,58,0.4))"
                  : "rgba(255,255,255,0.04)",
              border:
                selectedMode === "pvp"
                  ? "1px solid rgba(201,169,122,0.7)"
                  : "1px solid rgba(139,94,46,0.3)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 28 }}>👥</span>
            <span
              className="font-display font-bold text-sm"
              style={{ color: selectedMode === "pvp" ? "#f0d9b5" : "#c9a97a" }}
            >
              vs Player
            </span>
            <span className="text-xs font-body" style={{ color: "#7a5c3a" }}>
              Local 2-player
            </span>
          </button>

          <button
            type="button"
            data-ocid="chess.mode.pvc_button"
            onClick={() => setSelectedMode("pvc")}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
            style={{
              background:
                selectedMode === "pvc"
                  ? "linear-gradient(135deg, rgba(139,94,46,0.5), rgba(201,124,58,0.4))"
                  : "rgba(255,255,255,0.04)",
              border:
                selectedMode === "pvc"
                  ? "1px solid rgba(201,169,122,0.7)"
                  : "1px solid rgba(139,94,46,0.3)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 28 }}>🤖</span>
            <span
              className="font-display font-bold text-sm"
              style={{ color: selectedMode === "pvc" ? "#f0d9b5" : "#c9a97a" }}
            >
              vs Computer
            </span>
            <span className="text-xs font-body" style={{ color: "#7a5c3a" }}>
              AI opponent
            </span>
          </button>
        </div>

        {/* PvC options */}
        <AnimatePresence>
          {selectedMode === "pvc" && (
            <motion.div
              key="pvc-options"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden flex flex-col gap-3"
            >
              {/* Color picker */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(139,94,46,0.2)",
                }}
              >
                <p
                  className="text-xs font-body font-semibold mb-3 text-center uppercase tracking-wider"
                  style={{ color: "#7a5c3a" }}
                >
                  Jugar como
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    data-ocid="chess.mode.white_button"
                    onClick={() => setSelectedColor("white")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200"
                    style={{
                      background:
                        selectedColor === "white"
                          ? "rgba(240,217,181,0.25)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        selectedColor === "white"
                          ? "1px solid rgba(240,217,181,0.7)"
                          : "1px solid rgba(139,94,46,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="text-2xl"
                      style={{
                        color: "#f9f0dc",
                        textShadow: "0 0 4px #4a2800, 1px 1px 0 #4a2800",
                      }}
                    >
                      ♔
                    </span>
                    <span
                      className="font-body font-semibold text-sm"
                      style={{
                        color:
                          selectedColor === "white" ? "#f0d9b5" : "#c9a97a",
                      }}
                    >
                      Blancas
                    </span>
                  </button>

                  <button
                    type="button"
                    data-ocid="chess.mode.black_button"
                    onClick={() => setSelectedColor("black")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200"
                    style={{
                      background:
                        selectedColor === "black"
                          ? "rgba(42,20,0,0.6)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        selectedColor === "black"
                          ? "1px solid rgba(181,136,99,0.7)"
                          : "1px solid rgba(139,94,46,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <span className="text-2xl" style={{ color: "#1a0a00" }}>
                      ♚
                    </span>
                    <span
                      className="font-body font-semibold text-sm"
                      style={{
                        color:
                          selectedColor === "black" ? "#f0d9b5" : "#c9a97a",
                      }}
                    >
                      Negras
                    </span>
                  </button>
                </div>
              </div>

              {/* Difficulty selector */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(139,94,46,0.2)",
                }}
              >
                <p
                  className="text-xs font-body font-semibold mb-3 text-center uppercase tracking-wider"
                  style={{ color: "#7a5c3a" }}
                >
                  Nivel de dificultad
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      data-ocid={`chess.difficulty.level.${level}`}
                      onClick={() => setSelectedDifficulty(level)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200"
                      style={{
                        background:
                          selectedDifficulty === level
                            ? "linear-gradient(135deg, rgba(139,94,46,0.5), rgba(201,124,58,0.4))"
                            : "rgba(255,255,255,0.04)",
                        border:
                          selectedDifficulty === level
                            ? "1px solid rgba(201,169,122,0.7)"
                            : "1px solid rgba(139,94,46,0.3)",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        className="font-display font-bold text-base"
                        style={{
                          color:
                            selectedDifficulty === level
                              ? "#f0d9b5"
                              : "#c9a97a",
                        }}
                      >
                        {level}
                      </span>
                      <span
                        className="font-body text-[10px] text-center leading-tight"
                        style={{
                          color:
                            selectedDifficulty === level
                              ? "#c9a97a"
                              : "#5a3a1a",
                        }}
                      >
                        {DIFFICULTY_LABELS[level]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm button */}
        <button
          type="button"
          data-ocid="chess.mode.confirm_button"
          onClick={() =>
            onConfirm(selectedMode, selectedColor, selectedDifficulty)
          }
          className="w-full py-3 rounded-xl font-display font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #8b5e2e, #c97c3a)",
            color: "#f9f0dc",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          Iniciar Juego
        </button>
      </motion.div>
    </div>
  );
}
