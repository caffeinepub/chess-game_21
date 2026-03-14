import type { PieceColor, PieceType } from "../hooks/useChess";
import { ChessPiece } from "./ChessPiece";

interface PromotionModalProps {
  color: PieceColor;
  onPromote: (type: PieceType) => void;
}

const PROMOTION_PIECES: { type: PieceType; label: string; ocid: string }[] = [
  { type: "queen", label: "Queen", ocid: "chess.promotion.queen_button" },
  { type: "rook", label: "Rook", ocid: "chess.promotion.rook_button" },
  { type: "bishop", label: "Bishop", ocid: "chess.promotion.bishop_button" },
  { type: "knight", label: "Knight", ocid: "chess.promotion.knight_button" },
];

export function PromotionModal({ color, onPromote }: PromotionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-xl"
        style={{
          background: "linear-gradient(145deg, #3d1f00, #5c2e00)",
          border: "2px solid #8b5e2e",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}
      >
        <h2 className="font-display text-xl font-bold text-amber-200">
          Promote Pawn
        </h2>
        <p className="text-sm font-body" style={{ color: "#c9a97a" }}>
          Choose a piece for {color === "white" ? "White" : "Black"}
        </p>
        <div className="flex gap-3">
          {PROMOTION_PIECES.map(({ type, label, ocid }) => (
            <button
              key={type}
              type="button"
              data-ocid={ocid}
              onClick={() => onPromote(type)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-150 hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,215,100,0.3)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,215,100,0.2)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,215,100,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,215,100,0.3)";
              }}
            >
              <ChessPiece piece={{ type, color }} size="md" />
              <span
                className="text-xs font-body font-medium"
                style={{ color: "#c9a97a" }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
