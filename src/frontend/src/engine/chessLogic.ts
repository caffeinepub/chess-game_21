export type PieceType =
  | "king"
  | "queen"
  | "rook"
  | "bishop"
  | "knight"
  | "pawn";
export type PieceColor = "white" | "black";

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const backRank: PieceType[] = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: "black" };
    board[1][col] = { type: "pawn", color: "black" };
    board[6][col] = { type: "pawn", color: "white" };
    board[7][col] = { type: backRank[col], color: "white" };
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((sq) => (sq ? { ...sq } : null)));
}

export function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function findKing(
  board: Board,
  color: PieceColor,
): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq && sq.type === "king" && sq.color === color) return [r, c];
    }
  }
  return null;
}

export function isSquareAttackedBy(
  board: Board,
  row: number,
  col: number,
  attackerColor: PieceColor,
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== attackerColor) continue;
      const raw = getRawMoves(board, r, c, null);
      if (raw.some(([mr, mc]) => mr === row && mc === col)) return true;
    }
  }
  return false;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const enemy: PieceColor = color === "white" ? "black" : "white";
  return isSquareAttackedBy(board, kingPos[0], kingPos[1], enemy);
}

export function getRawMoves(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null,
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const { type, color } = piece;
  const enemy: PieceColor = color === "white" ? "black" : "white";

  const addIfValid = (r: number, c: number) => {
    if (!isOnBoard(r, c)) return false;
    const target = board[r][c];
    if (target && target.color === color) return false;
    moves.push([r, c]);
    return !target;
  };

  const slide = (dr: number, dc: number) => {
    let r = row + dr;
    let c = col + dc;
    while (isOnBoard(r, c)) {
      const target = board[r][c];
      if (target) {
        if (target.color === enemy) moves.push([r, c]);
        break;
      }
      moves.push([r, c]);
      r += dr;
      c += dc;
    }
  };

  switch (type) {
    case "pawn": {
      const dir = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;
      if (isOnBoard(row + dir, col) && !board[row + dir][col]) {
        moves.push([row + dir, col]);
        if (row === startRow && !board[row + 2 * dir][col]) {
          moves.push([row + 2 * dir, col]);
        }
      }
      for (const dc of [-1, 1]) {
        const nr = row + dir;
        const nc = col + dc;
        if (isOnBoard(nr, nc)) {
          if (board[nr][nc]?.color === enemy) moves.push([nr, nc]);
          if (
            enPassantTarget &&
            enPassantTarget[0] === nr &&
            enPassantTarget[1] === nc
          ) {
            moves.push([nr, nc]);
          }
        }
      }
      break;
    }
    case "knight":
      for (const [dr, dc] of [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]) {
        addIfValid(row + dr, col + dc);
      }
      break;
    case "bishop":
      slide(1, 1);
      slide(1, -1);
      slide(-1, 1);
      slide(-1, -1);
      break;
    case "rook":
      slide(1, 0);
      slide(-1, 0);
      slide(0, 1);
      slide(0, -1);
      break;
    case "queen":
      slide(1, 0);
      slide(-1, 0);
      slide(0, 1);
      slide(0, -1);
      slide(1, 1);
      slide(1, -1);
      slide(-1, 1);
      slide(-1, -1);
      break;
    case "king":
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        addIfValid(row + dr, col + dc);
      }
      break;
  }

  return moves;
}

export function getLegalMovesForPiece(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const raw = getRawMoves(board, row, col, enPassantTarget);
  const legal: [number, number][] = [];

  for (const [mr, mc] of raw) {
    const newBoard = cloneBoard(board);
    if (
      piece.type === "pawn" &&
      enPassantTarget &&
      mr === enPassantTarget[0] &&
      mc === enPassantTarget[1] &&
      !board[mr][mc]
    ) {
      const capturedRow = piece.color === "white" ? mr + 1 : mr - 1;
      newBoard[capturedRow][mc] = null;
    }
    newBoard[mr][mc] = newBoard[row][col];
    newBoard[row][col] = null;
    if (!isInCheck(newBoard, piece.color)) {
      legal.push([mr, mc]);
    }
  }

  if (piece.type === "king") {
    const color = piece.color;
    const backRow = color === "white" ? 7 : 0;
    const enemy: PieceColor = color === "white" ? "black" : "white";

    if (row === backRow && col === 4 && !isInCheck(board, color)) {
      const ksRight =
        color === "white"
          ? castlingRights.whiteKingSide
          : castlingRights.blackKingSide;
      if (
        ksRight &&
        !board[backRow][5] &&
        !board[backRow][6] &&
        board[backRow][7]?.type === "rook" &&
        board[backRow][7]?.color === color
      ) {
        if (
          !isSquareAttackedBy(board, backRow, 5, enemy) &&
          !isSquareAttackedBy(board, backRow, 6, enemy)
        ) {
          legal.push([backRow, 6]);
        }
      }
      const qsRight =
        color === "white"
          ? castlingRights.whiteQueenSide
          : castlingRights.blackQueenSide;
      if (
        qsRight &&
        !board[backRow][3] &&
        !board[backRow][2] &&
        !board[backRow][1] &&
        board[backRow][0]?.type === "rook" &&
        board[backRow][0]?.color === color
      ) {
        if (
          !isSquareAttackedBy(board, backRow, 3, enemy) &&
          !isSquareAttackedBy(board, backRow, 2, enemy)
        ) {
          legal.push([backRow, 2]);
        }
      }
    }
  }

  return legal;
}

export function hasAnyLegalMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === color) {
        const moves = getLegalMovesForPiece(
          board,
          r,
          c,
          enPassantTarget,
          castlingRights,
        );
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function computeGameStatus(
  board: Board,
  nextTurn: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
): "playing" | "check" | "checkmate" | "stalemate" {
  const inCheck = isInCheck(board, nextTurn);
  const hasLegal = hasAnyLegalMoves(
    board,
    nextTurn,
    enPassantTarget,
    castlingRights,
  );
  if (!hasLegal) return inCheck ? "checkmate" : "stalemate";
  return inCheck ? "check" : "playing";
}

export function applyMove(
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
  promotionPiece: PieceType = "queen",
): {
  newBoard: Board;
  newEnPassantTarget: [number, number] | null;
  newCastlingRights: CastlingRights;
  promotion: boolean;
} {
  const newBoard = cloneBoard(board);
  const movingPiece = newBoard[fromRow][fromCol]!;
  const newCR = { ...castlingRights };
  let newEP: [number, number] | null = null;

  // En passant capture
  if (
    movingPiece.type === "pawn" &&
    enPassantTarget &&
    toRow === enPassantTarget[0] &&
    toCol === enPassantTarget[1] &&
    !board[toRow][toCol]
  ) {
    const capturedRow = movingPiece.color === "white" ? toRow + 1 : toRow - 1;
    newBoard[capturedRow][toCol] = null;
  }

  // En passant target
  if (movingPiece.type === "pawn" && Math.abs(toRow - fromRow) === 2) {
    newEP = [(fromRow + toRow) / 2, toCol];
  }

  // Castling
  if (movingPiece.type === "king") {
    const backRow = movingPiece.color === "white" ? 7 : 0;
    if (fromCol === 4 && toCol === 6) {
      newBoard[backRow][5] = newBoard[backRow][7];
      newBoard[backRow][7] = null;
    } else if (fromCol === 4 && toCol === 2) {
      newBoard[backRow][3] = newBoard[backRow][0];
      newBoard[backRow][0] = null;
    }
    if (movingPiece.color === "white") {
      newCR.whiteKingSide = false;
      newCR.whiteQueenSide = false;
    } else {
      newCR.blackKingSide = false;
      newCR.blackQueenSide = false;
    }
  }

  // Rook moves update castling
  if (movingPiece.type === "rook") {
    if (movingPiece.color === "white") {
      if (fromRow === 7 && fromCol === 7) newCR.whiteKingSide = false;
      if (fromRow === 7 && fromCol === 0) newCR.whiteQueenSide = false;
    } else {
      if (fromRow === 0 && fromCol === 7) newCR.blackKingSide = false;
      if (fromRow === 0 && fromCol === 0) newCR.blackQueenSide = false;
    }
  }

  newBoard[toRow][toCol] = movingPiece;
  newBoard[fromRow][fromCol] = null;

  const isPromotion =
    movingPiece.type === "pawn" && (toRow === 0 || toRow === 7);
  if (isPromotion) {
    newBoard[toRow][toCol] = { type: promotionPiece, color: movingPiece.color };
  }

  return {
    newBoard,
    newEnPassantTarget: newEP,
    newCastlingRights: newCR,
    promotion: isPromotion,
  };
}
