import type { Board, LastMove } from "../hooks/useChess";
import { ChessPiece } from "./ChessPiece";

interface ChessBoardProps {
  board: Board;
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  lastMove: LastMove | null;
  onSquareClick: (row: number, col: number) => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const LIGHT_SQUARE = "#f0d9b5";
const DARK_SQUARE = "#b58863";
const SELECTED_OVERLAY = "rgba(20, 85, 255, 0.45)";
const LAST_MOVE_OVERLAY = "rgba(255, 215, 0, 0.35)";
const VALID_MOVE_DOT = "rgba(20, 85, 30, 0.55)";
const VALID_CAPTURE_RING = "rgba(20, 85, 30, 0.55)";

export function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick,
}: ChessBoardProps) {
  const isSelected = (r: number, c: number) =>
    selectedSquare !== null &&
    selectedSquare[0] === r &&
    selectedSquare[1] === c;

  const isValidMove = (r: number, c: number) =>
    validMoves.some(([mr, mc]) => mr === r && mc === c);

  const isLastMove = (r: number, c: number) =>
    lastMove !== null &&
    ((lastMove.fromRow === r && lastMove.fromCol === c) ||
      (lastMove.toRow === r && lastMove.toCol === c));

  return (
    <div
      data-ocid="chess.board.canvas_target"
      className="relative inline-block"
      style={{
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.5), inset 0 0 0 4px #6b3d00",
        borderRadius: "4px",
      }}
    >
      {/* File labels top */}
      <div className="flex pl-6">
        {FILES.map((f) => (
          <div
            key={f}
            className="flex items-center justify-center text-xs font-body font-semibold"
            style={{ width: 64, height: 18, color: "#c9a97a" }}
          >
            {f}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Rank labels left */}
        <div className="flex flex-col">
          {RANKS.map((r) => (
            <div
              key={r}
              className="flex items-center justify-center text-xs font-body font-semibold"
              style={{ width: 24, height: 64, color: "#c9a97a" }}
            >
              {r}
            </div>
          ))}
        </div>

        {/* Board grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 64px)",
            gridTemplateRows: "repeat(8, 64px)",
            border: "2px solid #6b3d00",
          }}
        >
          {board.map((rowArr, rowIdx) =>
            rowArr.map((piece, colIdx) => {
              const squareKey = `${rowIdx}-${colIdx}`;
              const isLight = (rowIdx + colIdx) % 2 === 0;
              const baseColor = isLight ? LIGHT_SQUARE : DARK_SQUARE;
              const selected = isSelected(rowIdx, colIdx);
              const validDest = isValidMove(rowIdx, colIdx);
              const lastMoveSq = isLastMove(rowIdx, colIdx);
              const isCapture = validDest && piece !== null;

              return (
                <button
                  key={squareKey}
                  type="button"
                  aria-label={`${FILES[colIdx]}${RANKS[rowIdx]}`}
                  onClick={() => onSquareClick(rowIdx, colIdx)}
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: baseColor,
                    position: "relative",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    padding: 0,
                    outline: "none",
                  }}
                >
                  {lastMoveSq && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: LAST_MOVE_OVERLAY,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {selected && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: SELECTED_OVERLAY,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {validDest && !isCapture && (
                    <div
                      style={{
                        position: "absolute",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: VALID_MOVE_DOT,
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {isCapture && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        border: `4px solid ${VALID_CAPTURE_RING}`,
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {piece && (
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <ChessPiece piece={piece} />
                    </div>
                  )}
                </button>
              );
            }),
          )}
        </div>

        {/* Rank labels right */}
        <div className="flex flex-col">
          {RANKS.map((r) => (
            <div
              key={r}
              className="flex items-center justify-center text-xs font-body font-semibold"
              style={{ width: 24, height: 64, color: "#c9a97a" }}
            >
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* File labels bottom */}
      <div className="flex pl-6">
        {FILES.map((f) => (
          <div
            key={f}
            className="flex items-center justify-center text-xs font-body font-semibold"
            style={{ width: 64, height: 18, color: "#c9a97a" }}
          >
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
