import type { Piece } from "../hooks/useChess";

const PIECE_UNICODE: Record<string, Record<string, string>> = {
  white: {
    king: "\u2654",
    queen: "\u2655",
    rook: "\u2656",
    bishop: "\u2657",
    knight: "\u2658",
    pawn: "\u2659",
  },
  black: {
    king: "\u265A",
    queen: "\u265B",
    rook: "\u265C",
    bishop: "\u265D",
    knight: "\u265E",
    pawn: "\u265F",
  },
};

interface ChessPieceProps {
  piece: Piece;
  size?: "sm" | "md" | "lg";
}

export function ChessPiece({ piece, size = "lg" }: ChessPieceProps) {
  const symbol = PIECE_UNICODE[piece.color][piece.type];
  const sizeClass =
    size === "lg" ? "text-5xl" : size === "md" ? "text-3xl" : "text-2xl";

  const style: React.CSSProperties =
    piece.color === "white"
      ? {
          color: "#f9f0dc",
          textShadow:
            "0 0 3px #4a2800, 0 0 6px #4a2800, 1px 1px 0 #4a2800, -1px -1px 0 #4a2800, 1px -1px 0 #4a2800, -1px 1px 0 #4a2800",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        }
      : {
          color: "#1a0a00",
          textShadow:
            "0 1px 3px rgba(255,255,255,0.15), 1px 1px 2px rgba(0,0,0,0.8)",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
        };

  return (
    <span
      className={`${sizeClass} leading-none select-none cursor-pointer`}
      style={style}
      role="img"
      aria-label={`${piece.color} ${piece.type}`}
    >
      {symbol}
    </span>
  );
}
