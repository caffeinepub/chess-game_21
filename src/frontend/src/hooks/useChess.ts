import { useCallback, useEffect, useRef, useState } from "react";
import { getBestMove } from "../engine/chessAI";
import type { DifficultyLevel } from "../engine/chessAI";
import {
  applyMove,
  computeGameStatus,
  createInitialBoard,
  getLegalMovesForPiece,
} from "../engine/chessLogic";
import type {
  Board,
  CastlingRights,
  Piece,
  PieceColor,
  PieceType,
  Square,
} from "../engine/chessLogic";

// Re-export types for backward compatibility
export type { Board, CastlingRights, Piece, PieceColor, PieceType, Square };
export type { DifficultyLevel };
export type GameStatus = "playing" | "check" | "checkmate" | "stalemate";
export type GameMode = "pvp" | "pvc";

export interface PromotionPending {
  row: number;
  col: number;
  color: PieceColor;
  fromRow: number;
  fromCol: number;
}

export interface LastMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

const INITIAL_CASTLING: CastlingRights = {
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true,
};

const AI_MOVE_DELAY = 3000;

export function useChess() {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("white");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [promotionPending, setPromotionPending] =
    useState<PromotionPending | null>(null);
  const [enPassantTarget, setEnPassantTarget] = useState<
    [number, number] | null
  >(null);
  const [castlingRights, setCastlingRights] =
    useState<CastlingRights>(INITIAL_CASTLING);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("pvp");
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);

  // Refs for use inside setTimeout (always current)
  const boardRef = useRef(board);
  const enPassantRef = useRef(enPassantTarget);
  const castlingRef = useRef(castlingRights);
  const currentTurnRef = useRef(currentTurn);
  const gameModeRef = useRef(gameMode);
  const playerColorRef = useRef(playerColor);
  const gameStatusRef = useRef(gameStatus);
  const difficultyRef = useRef(difficulty);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  useEffect(() => {
    enPassantRef.current = enPassantTarget;
  }, [enPassantTarget]);
  useEffect(() => {
    castlingRef.current = castlingRights;
  }, [castlingRights]);
  useEffect(() => {
    currentTurnRef.current = currentTurn;
  }, [currentTurn]);
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);
  useEffect(() => {
    playerColorRef.current = playerColor;
  }, [playerColor]);
  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  const scheduleAIMove = useCallback(() => {
    setIsAIThinking(true);
    setTimeout(() => {
      const b = boardRef.current;
      const ep = enPassantRef.current;
      const cr = castlingRef.current;
      const turn = currentTurnRef.current;
      const status = gameStatusRef.current;
      const diff = difficultyRef.current;

      if (status === "checkmate" || status === "stalemate") {
        setIsAIThinking(false);
        return;
      }

      const move = getBestMove(b, turn, ep, cr, diff);
      if (!move) {
        setIsAIThinking(false);
        return;
      }

      const result = applyMove(
        b,
        move.fromRow,
        move.fromCol,
        move.toRow,
        move.toCol,
        ep,
        cr,
        "queen",
      );

      const nextTurn: PieceColor = turn === "white" ? "black" : "white";
      const newStatus = computeGameStatus(
        result.newBoard,
        nextTurn,
        result.newEnPassantTarget,
        result.newCastlingRights,
      );

      setBoard(result.newBoard);
      setLastMove({
        fromRow: move.fromRow,
        fromCol: move.fromCol,
        toRow: move.toRow,
        toCol: move.toCol,
      });
      setCurrentTurn(nextTurn);
      setGameStatus(newStatus);
      setEnPassantTarget(result.newEnPassantTarget);
      setCastlingRights(result.newCastlingRights);
      setSelectedSquare(null);
      setValidMoves([]);
      setIsAIThinking(false);
    }, AI_MOVE_DELAY);
  }, []);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus === "checkmate" || gameStatus === "stalemate") return;
      if (promotionPending) return;
      if (isAIThinking) return;
      if (gameMode === "pvc" && currentTurn !== playerColor) return;

      const piece = board[row][col];

      if (selectedSquare) {
        const [selRow, selCol] = selectedSquare;

        if (selRow === row && selCol === col) {
          setSelectedSquare(null);
          setValidMoves([]);
          return;
        }

        const isValid = validMoves.some(([mr, mc]) => mr === row && mc === col);
        if (isValid) {
          const result = applyMove(
            board,
            selRow,
            selCol,
            row,
            col,
            enPassantTarget,
            castlingRights,
          );

          if (result.promotion) {
            setBoard(result.newBoard);
            setLastMove({
              fromRow: selRow,
              fromCol: selCol,
              toRow: row,
              toCol: col,
            });
            setSelectedSquare(null);
            setValidMoves([]);
            setCastlingRights(result.newCastlingRights);
            setEnPassantTarget(result.newEnPassantTarget);
            setPromotionPending({
              row,
              col,
              color: board[selRow][selCol]!.color,
              fromRow: selRow,
              fromCol: selCol,
            });
            return;
          }

          const nextTurn: PieceColor =
            currentTurn === "white" ? "black" : "white";
          const status = computeGameStatus(
            result.newBoard,
            nextTurn,
            result.newEnPassantTarget,
            result.newCastlingRights,
          );

          setBoard(result.newBoard);
          setLastMove({
            fromRow: selRow,
            fromCol: selCol,
            toRow: row,
            toCol: col,
          });
          setCurrentTurn(nextTurn);
          setGameStatus(status);
          setSelectedSquare(null);
          setValidMoves([]);
          setCastlingRights(result.newCastlingRights);
          setEnPassantTarget(result.newEnPassantTarget);

          if (
            gameMode === "pvc" &&
            nextTurn !== playerColor &&
            (status === "playing" || status === "check")
          ) {
            setTimeout(() => scheduleAIMove(), 0);
          }
          return;
        }

        if (piece && piece.color === currentTurn) {
          const moves = getLegalMovesForPiece(
            board,
            row,
            col,
            enPassantTarget,
            castlingRights,
          );
          setSelectedSquare([row, col]);
          setValidMoves(moves);
          return;
        }

        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      if (piece && piece.color === currentTurn) {
        const moves = getLegalMovesForPiece(
          board,
          row,
          col,
          enPassantTarget,
          castlingRights,
        );
        setSelectedSquare([row, col]);
        setValidMoves(moves);
      }
    },
    [
      board,
      selectedSquare,
      validMoves,
      currentTurn,
      gameStatus,
      promotionPending,
      enPassantTarget,
      castlingRights,
      gameMode,
      playerColor,
      isAIThinking,
      scheduleAIMove,
    ],
  );

  const promotePawn = useCallback(
    (pieceType: PieceType) => {
      if (!promotionPending) return;
      const { row, col, color } = promotionPending;
      const { newBoard, newEnPassantTarget, newCastlingRights } = applyMove(
        board,
        promotionPending.fromRow,
        promotionPending.fromCol,
        row,
        col,
        enPassantTarget,
        castlingRights,
        pieceType,
      );
      newBoard[row][col] = { type: pieceType, color };

      const nextTurn: PieceColor = color === "white" ? "black" : "white";
      const status = computeGameStatus(
        newBoard,
        nextTurn,
        newEnPassantTarget,
        newCastlingRights,
      );

      setBoard(newBoard);
      setCurrentTurn(nextTurn);
      setGameStatus(status);
      setPromotionPending(null);
      setEnPassantTarget(newEnPassantTarget);
      setCastlingRights(newCastlingRights);

      if (gameMode === "pvc" && nextTurn !== playerColor) {
        setTimeout(() => scheduleAIMove(), 0);
      }
    },
    [
      board,
      promotionPending,
      enPassantTarget,
      castlingRights,
      gameMode,
      playerColor,
      scheduleAIMove,
    ],
  );

  const newGame = useCallback(
    (mode?: GameMode, pColor?: PieceColor, diff?: DifficultyLevel) => {
      const activeMode = mode ?? gameMode;
      const activePlayerColor = pColor ?? playerColor;

      setBoard(createInitialBoard());
      setCurrentTurn("white");
      setSelectedSquare(null);
      setValidMoves([]);
      setGameStatus("playing");
      setPromotionPending(null);
      setEnPassantTarget(null);
      setCastlingRights({ ...INITIAL_CASTLING });
      setLastMove(null);
      setIsAIThinking(false);

      if (mode) setGameMode(mode);
      if (pColor) setPlayerColor(pColor);
      if (diff) setDifficulty(diff);

      if (activeMode === "pvc" && activePlayerColor === "black") {
        setTimeout(() => scheduleAIMove(), 100);
      }
    },
    [gameMode, playerColor, scheduleAIMove],
  );

  return {
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
    setGameMode,
    setPlayerColor,
  };
}
