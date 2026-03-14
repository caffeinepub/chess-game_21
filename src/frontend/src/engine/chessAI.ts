import type {
  Board,
  CastlingRights,
  PieceColor,
  PieceType,
} from "./chessLogic";
import {
  applyMove,
  cloneBoard,
  getLegalMovesForPiece,
  isInCheck,
} from "./chessLogic";

export interface AIMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  promotion?: PieceType;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: "Principiante",
  2: "Fácil",
  3: "Intermedio",
  4: "Avanzado",
  5: "Experto",
  6: "Maestro",
};

// randomness factor: higher = more random (lower skill)
const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { depth: number; randomFactor: number }
> = {
  1: { depth: 1, randomFactor: 600 },
  2: { depth: 1, randomFactor: 200 },
  3: { depth: 2, randomFactor: 80 },
  4: { depth: 3, randomFactor: 20 },
  5: { depth: 4, randomFactor: 0 },
  6: { depth: 5, randomFactor: 0 },
};

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

function getPieceTable(type: PieceType): number[][] {
  switch (type) {
    case "pawn":
      return PAWN_TABLE;
    case "knight":
      return KNIGHT_TABLE;
    case "bishop":
      return BISHOP_TABLE;
    case "rook":
      return ROOK_TABLE;
    case "queen":
      return QUEEN_TABLE;
    case "king":
      return KING_TABLE;
  }
}

function evaluateBoard(board: Board, aiColor: PieceColor): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const table = getPieceTable(piece.type);
      const tableRow = piece.color === "white" ? r : 7 - r;
      const value = PIECE_VALUES[piece.type] + table[tableRow][c];
      score += piece.color === aiColor ? value : -value;
    }
  }
  return score;
}

function getAllMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
): AIMove[] {
  const moves: AIMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color !== color) continue;
      const piece = board[r][c]!;
      const legalMoves = getLegalMovesForPiece(
        board,
        r,
        c,
        enPassantTarget,
        castlingRights,
      );
      for (const [mr, mc] of legalMoves) {
        if (piece.type === "pawn" && (mr === 0 || mr === 7)) {
          moves.push({
            fromRow: r,
            fromCol: c,
            toRow: mr,
            toCol: mc,
            promotion: "queen",
          });
        } else {
          moves.push({ fromRow: r, fromCol: c, toRow: mr, toCol: mc });
        }
      }
    }
  }
  return moves;
}

function minimax(
  board: Board,
  depth: number,
  alphaIn: number,
  betaIn: number,
  isMaximizing: boolean,
  aiColor: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
): number {
  if (depth === 0) return evaluateBoard(board, aiColor);

  const currentColor: PieceColor = isMaximizing
    ? aiColor
    : aiColor === "white"
      ? "black"
      : "white";
  const moves = getAllMoves(
    board,
    currentColor,
    enPassantTarget,
    castlingRights,
  );

  if (moves.length === 0) {
    if (isInCheck(board, currentColor)) {
      return isMaximizing ? -100000 + depth : 100000 - depth;
    }
    return 0;
  }

  if (isMaximizing) {
    let maxEval = Number.NEGATIVE_INFINITY;
    let a = alphaIn;
    for (const move of moves) {
      const result = applyMove(
        board,
        move.fromRow,
        move.fromCol,
        move.toRow,
        move.toCol,
        enPassantTarget,
        castlingRights,
        move.promotion ?? "queen",
      );
      const evalScore = minimax(
        result.newBoard,
        depth - 1,
        a,
        betaIn,
        false,
        aiColor,
        result.newEnPassantTarget,
        result.newCastlingRights,
      );
      if (evalScore > maxEval) maxEval = evalScore;
      if (maxEval > a) a = maxEval;
      if (betaIn <= a) break;
    }
    return maxEval;
  }

  let minEval = Number.POSITIVE_INFINITY;
  let b = betaIn;
  for (const move of moves) {
    const result = applyMove(
      board,
      move.fromRow,
      move.fromCol,
      move.toRow,
      move.toCol,
      enPassantTarget,
      castlingRights,
      move.promotion ?? "queen",
    );
    const evalScore = minimax(
      result.newBoard,
      depth - 1,
      alphaIn,
      b,
      true,
      aiColor,
      result.newEnPassantTarget,
      result.newCastlingRights,
    );
    if (evalScore < minEval) minEval = evalScore;
    if (minEval < b) b = minEval;
    if (b <= alphaIn) break;
  }
  return minEval;
}

export function getBestMove(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
  difficulty: DifficultyLevel = 3,
): AIMove | null {
  const moves = getAllMoves(board, color, enPassantTarget, castlingRights);
  if (moves.length === 0) return null;

  const { depth, randomFactor } = DIFFICULTY_CONFIG[difficulty];

  let bestMove: AIMove | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const move of moves) {
    const result = applyMove(
      board,
      move.fromRow,
      move.fromCol,
      move.toRow,
      move.toCol,
      enPassantTarget,
      castlingRights,
      move.promotion ?? "queen",
    );
    const score =
      minimax(
        result.newBoard,
        depth - 1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        false,
        color,
        result.newEnPassantTarget,
        result.newCastlingRights,
      ) + (randomFactor > 0 ? (Math.random() - 0.5) * randomFactor : 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export { cloneBoard };
