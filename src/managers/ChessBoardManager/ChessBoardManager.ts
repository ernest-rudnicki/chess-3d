import { Vec3, World } from "cannon-es";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceChessPosition } from "objects/Pieces/Piece/types";
import { Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { getChessNotation, getMatrixPosition } from "../../utils/chess";
import { convertThreeVector } from "utils/general";
import { Chess, ChessInstance, Move, PieceColor } from "chess.js";
import { PieceSet } from "managers/PiecesManager/types";
import { PiecesManager } from "managers/PiecesManager/PiecesManager";
import Worker from "web-worker";
import { AiMoveCallback, MoveResult, WebWorkerEvent } from "./types";
import { UserInterfaceManager } from "managers/UserInterfaceManager/UserInterfaceManager";

export class ChessBoardManager {
  private _chessBoard: ChessBoard;
  private piecesManager: PiecesManager;
  private chessEngine: ChessInstance;
  private startingPlayerSide: PieceColor;
  private worker: Worker;
  private uiManager: UserInterfaceManager;

  private selectedInitialPosition: Vec3;
  private selected: Piece | null;

  constructor(private world: World, private loader: GLTFLoader) {
    this._chessBoard = new ChessBoard("ChessBoard");
    this.chessEngine = new Chess();
    this.piecesManager = new PiecesManager(
      this._chessBoard,
      this.loader,
      this.world
    );
    this.worker = new Worker(new URL("./worker.ts", import.meta.url));
    this.uiManager = new UserInterfaceManager();
  }

  private drawSide() {
    const coinFlip = Math.round(Math.random());
    this.startingPlayerSide = coinFlip === 0 ? "w" : "b";
  }

  private markPossibleFields(chessPosition: PieceChessPosition): void {
    const chessNotation = getChessNotation(chessPosition);
    const possibleMoves = this.chessEngine.moves({
      square: chessNotation,
      verbose: true,
    });
    possibleMoves.forEach((move) => {
      const { row, column } = getMatrixPosition(move.to);

      this._chessBoard.markPlaneAsDroppable(row, column);
    });
  }

  private initChessBoard() {
    const chessBoardBody = this._chessBoard.init();
    this.world.addBody(chessBoardBody);
  }

  private getOppositeColor(color: PieceColor): PieceColor {
    let newColor: PieceColor = "b";

    if (color === "b") {
      newColor = "w";
    }

    return newColor;
  }

  private updateScoreBoard(
    colorToUpdate: PieceColor,
    captured: keyof PieceSet
  ): void {
    if (colorToUpdate === "w") {
      this.uiManager.addToWhiteScore(captured);
    } else {
      this.uiManager.addToBlackScore(captured);
    }
  }

  private capturePiece(
    color: PieceColor,
    captured: keyof PieceSet,
    to: string
  ): number | undefined {
    const capturedChessPosition = getMatrixPosition(to);
    const capturedColor = this.getOppositeColor(color);

    this.updateScoreBoard(color, captured);

    return this.piecesManager.removePiece(
      capturedColor,
      captured,
      capturedChessPosition
    );
  }

  private movePieceToField(field: Object3D, piece: Piece): void {
    const { chessPosition } = field.userData;
    const worldPosition = new Vector3();

    field.getWorldPosition(worldPosition);
    worldPosition.y += 0.1;

    piece.changePosition(
      chessPosition,
      convertThreeVector(worldPosition),
      true
    );
  }

  private handleCastling(color: PieceColor, castlingType: "k" | "q"): void {
    const rookRow = color === "w" ? 0 : 7;
    const rookColumn = castlingType === "q" ? 7 : 0;
    const castlingRook = this.piecesManager.getPiece(color, "r", {
      row: rookRow,
      column: rookColumn,
    });

    const rookCastlingColumn = castlingType === "q" ? 4 : 2;
    const castlingField = this.chessBoard.getField(rookRow, rookCastlingColumn);

    this.movePieceToField(castlingField, castlingRook);
  }

  private handleEnPassante(color: PieceColor, droppedField: Object3D): number {
    const { chessPosition } = droppedField.userData;
    const { row, column }: PieceChessPosition = chessPosition;
    const opposite = this.getOppositeColor(color);
    const enPassanteRow = color === "w" ? row - 1 : row + 1;

    return this.piecesManager.removePiece(opposite, "p", {
      row: enPassanteRow,
      column,
    });
  }

  private handleFlags(move: Move, droppedField: Object3D): number[] {
    const { flags, color } = move;
    const removedPiecesIds: number[] = [];

    switch (flags) {
      case "q":
      case "k":
        this.handleCastling(color, flags);
        break;
      case "e":
        removedPiecesIds.push(this.handleEnPassante(color, droppedField));
        break;
    }

    return removedPiecesIds;
  }

  private performAiMove(move: Move): number[] {
    const { from, to, color, piece } = move;
    const fromPos = getMatrixPosition(from);
    const toPos = getMatrixPosition(to);

    const toField = this.chessBoard.getField(toPos.row, toPos.column);
    const movedPiece = this.piecesManager.getPiece(color, piece, fromPos);

    movedPiece.removeMass();

    const { removedPiecesIds } = this.handlePieceMove(toField, movedPiece);

    movedPiece.resetMass();

    return removedPiecesIds;
  }

  private handlePieceMove(field: Object3D, piece: Piece): MoveResult {
    const { chessPosition: toPosition } = field.userData;
    const { chessPosition: fromPosition } = piece;
    const removedPiecesIds: number[] = [];

    const from = getChessNotation(fromPosition);
    const to = getChessNotation(toPosition);

    const move = this.chessEngine.move(`${from}${to}`, {
      sloppy: true,
    });

    if (move.captured) {
      const { color, captured, to: movedTo } = move;

      const capturedPieceId = this.capturePiece(color, captured, movedTo);

      removedPiecesIds.push(capturedPieceId);
    }

    const specialRemoved = this.handleFlags(move, field);

    this.movePieceToField(field, piece);

    return { removedPiecesIds: [...removedPiecesIds, ...specialRemoved], move };
  }

  private notifyAiToMove(playerMove: Move) {
    this.worker.postMessage({ type: "aiMove", playerMove });
  }

  private performPlayerMove(droppedField: Object3D): MoveResult {
    return this.handlePieceMove(droppedField, this.selected);
  }

  private dropPiece(droppedField: Object3D): number[] {
    const { removedPiecesIds, move: playerMove } =
      this.performPlayerMove(droppedField);

    this.notifyAiToMove(playerMove);

    return removedPiecesIds;
  }

  private addWebWorkerListener(cb: AiMoveCallback): void {
    this.worker.addEventListener("message", (e: WebWorkerEvent) => {
      if (e.data.type !== "aiMovePerformed") {
        return;
      }
      const idsToRemove = this.performAiMove(e.data.aiMove);
      cb(idsToRemove);
    });
  }

  private initChessAi() {
    this.worker.postMessage({
      type: "init",
      fen: this.chessEngine.fen(),
      color: this.getOppositeColor(this.startingPlayerSide),
    });
  }

  private resetSelectedPiecePos(): void {
    const { x, y, z } = this.selectedInitialPosition;
    this.selected.changeWorldPosition(x, y, z);
    this.selectedInitialPosition = null;
  }

  private isPlayerPiece(piece: Piece): boolean {
    return piece.color === this.startingPlayerSide;
  }

  get chessBoard(): ChessBoard {
    return this._chessBoard;
  }

  isAnySelected(): boolean {
    return !!this.selected;
  }

  select(piece: Piece): void {
    if (!this.isPlayerPiece(piece)) {
      return;
    }

    piece.removeMass();
    this.markPossibleFields(piece.chessPosition);

    this.selectedInitialPosition = piece.body.position.clone();
    this.world.removeBody(piece.body);

    this.selected = piece;
  }

  deselect(intersectedField: Object3D): number[] {
    const { droppable } = intersectedField.userData;
    let removedPiecesIds: number[] = [];

    if (!droppable) {
      this.resetSelectedPiecePos();
    } else {
      removedPiecesIds = this.dropPiece(intersectedField);
    }

    this._chessBoard.clearMarkedPlanes();
    this.selected.resetMass();
    this.world.addBody(this.selected.body);

    this.selected = null;

    return removedPiecesIds;
  }

  getAllPieces(): Piece[] {
    return this.piecesManager.getAllPieces();
  }

  init(aiMoveCallback: AiMoveCallback): PieceColor {
    this.initChessBoard();
    this.piecesManager.initPieces();
    this.drawSide();
    this.uiManager.init(this.startingPlayerSide);
    this.addWebWorkerListener(aiMoveCallback);
    this.initChessAi();

    return this.startingPlayerSide;
  }

  moveSelectedPiece(x: number, z: number): void {
    if (!this.selected) {
      return;
    }

    this.selected.changeWorldPosition(x, 0.8, z);
  }

  update(): void {
    this._chessBoard.update();
    this.piecesManager.updatePieces("b");
    this.piecesManager.updatePieces("w");
  }
}
