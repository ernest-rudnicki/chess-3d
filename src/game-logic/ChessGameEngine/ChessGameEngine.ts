import { Vec3, World } from "cannon-es";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceChessPosition } from "objects/Pieces/Piece/types";
import { Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { convertThreeVector } from "utils/general";
import { Chess, ChessInstance, Move, PieceColor, Square } from "chess.js";
import { PieceSet, PromotablePieces } from "game-logic/PiecesContainer/types";
import { PiecesContainer } from "game-logic/PiecesContainer/PiecesContainer";
import Worker from "web-worker";
import {
  ActionResult,
  AiMoveCallback,
  MoveResult,
  OnEndGame,
  OnPromotion,
  PromotionPayload,
  PromotionResult,
  WebWorkerEvent,
} from "./types";
import { GameInterface } from "game-logic/GameInterface/GameInterface";
import {
  getChessNotation,
  getMatrixPosition,
  isPromotionResult,
} from "utils/chess";

export class ChessGameEngine {
  private _chessBoard: ChessBoard;
  private piecesContainer: PiecesContainer;
  private chessEngine: ChessInstance;
  private startingPlayerSide: PieceColor;
  private worker: Worker;
  private gameInterface: GameInterface;

  private loader: GLTFLoader;
  private world: World;

  private selectedInitialPosition: Vec3;
  private selected: Piece | null;

  private onEndGameCallback: OnEndGame;
  private onPromotionCallback: OnPromotion;

  constructor(world: World, loader: GLTFLoader) {
    this.world = world;
    this.loader = loader;

    this._chessBoard = new ChessBoard("ChessBoard", this.loader);
    this.chessEngine = new Chess();
    this.piecesContainer = new PiecesContainer(
      this._chessBoard,
      this.loader,
      this.world
    );
    this.gameInterface = new GameInterface();

    this.worker = new Worker(new URL("./worker.ts", import.meta.url));
  }

  private drawSide() {
    const coinFlip = Math.round(Math.random());
    this.startingPlayerSide = coinFlip === 0 ? "w" : "b";
  }

  private markPossibleMoveFields(chessPosition: PieceChessPosition): void {
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
      this.gameInterface.addToWhiteScore(captured);
      return;
    }

    this.gameInterface.addToBlackScore(captured);
  }

  private capturePiece(move: Move): number | undefined {
    const { to, color, captured } = move;
    const capturedChessPosition = getMatrixPosition(to);
    const capturedColor = this.getOppositeColor(color);

    this.updateScoreBoard(color, captured);

    return this.piecesContainer.removePiece(
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
    const castlingRook = this.piecesContainer.getPiece(color, "r", {
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

    return this.piecesContainer.removePiece(opposite, "p", {
      row: enPassanteRow,
      column,
    });
  }

  private updateAiWithPromotion(
    color: PieceColor,
    pieceType: PromotablePieces,
    chessNotationPos: Square,
    move: Move
  ): void {
    this.worker.postMessage({
      type: "promote",
      color,
      pieceType,
      chessNotationPos,
      move,
    });
  }

  private updateChessEngineWithPromotion(
    color: PieceColor,
    type: PromotablePieces,
    chessNotationPos: Square
  ): void {
    this.chessEngine.remove(chessNotationPos);
    this.chessEngine.put({ type, color }, chessNotationPos);

    // related to bug https://github.com/jhlywa/chess.js/issues/250
    this.chessEngine.load(this.chessEngine.fen());
  }

  private promotePiece(promotionPayload: PromotionPayload): PromotionResult {
    const { piece, droppedField, color, promotedPieceKey, move } =
      promotionPayload;
    const { chessPosition: piecePosition } = piece;
    const { chessPosition: droppedFieldPosition } = droppedField.userData;
    const chessNotationPos = getChessNotation(droppedFieldPosition);

    const removedPieceId = this.piecesContainer.removePiece(
      color,
      "p",
      piecePosition
    );

    const promotedPiece = this.piecesContainer.addPromotedPiece(
      color,
      promotedPieceKey,
      droppedFieldPosition
    );

    this.updateChessEngineWithPromotion(
      color,
      promotedPieceKey,
      chessNotationPos
    );

    this.updateAiWithPromotion(color, promotedPieceKey, chessNotationPos, move);

    return { removedPieceId, promotedPiece };
  }

  private promotePlayerPiece(
    promotionPayload: PromotionPayload
  ): PromotionResult {
    return this.promotePiece(promotionPayload);
  }

  private promoteAiPiece(promotionPayload: PromotionPayload): PromotionResult {
    return this.promotePiece(promotionPayload);
  }

  private handlePromotion(
    color: PieceColor,
    droppedField: Object3D,
    piece: Piece,
    move: Move
  ): PromotionResult | boolean {
    if (this.startingPlayerSide === color) {
      this.gameInterface.enablePromotionButtons(
        color,
        (promotedTo: PromotablePieces) => {
          const result = this.promotePlayerPiece({
            color,
            droppedField,
            piece,
            promotedPieceKey: promotedTo,
            move,
          });

          this.onPromotionCallback(result);
          this.notifyAiToMove(move);
        }
      );
      return true;
    }
    // for simplicity ai will always promote to queen
    return this.promoteAiPiece({
      color,
      droppedField,
      piece,
      promotedPieceKey: "q",
    });
  }

  private handleFlags(
    move: Move,
    droppedField: Object3D,
    piece: Piece
  ): number | boolean | PromotionResult {
    const { flags, color } = move;
    switch (flags) {
      case "q":
      case "k":
        this.handleCastling(color, flags);
        break;
      case "e":
        return this.handleEnPassante(color, droppedField);
      case "np":
      case "cp":
      case "p":
        return this.handlePromotion(color, droppedField, piece, move);
    }
  }

  private moveAiPiece(toField: Object3D, movedPiece: Piece): ActionResult {
    movedPiece.removeMass();

    const actionResult = this.handlePieceMove(toField, movedPiece);

    movedPiece.resetMass();

    return actionResult;
  }

  private performAiMove(move: Move): ActionResult {
    const { from, to, color, piece } = move;
    const fromPos = getMatrixPosition(from);
    const toPos = getMatrixPosition(to);

    const toField = this.chessBoard.getField(toPos.row, toPos.column);
    const movedPiece = this.piecesContainer.getPiece(color, piece, fromPos);

    return this.moveAiPiece(toField, movedPiece);
  }

  private isObjectId(id?: unknown): id is number {
    return id && typeof id === "number";
  }

  private handlePieceMove(field: Object3D, piece: Piece): MoveResult {
    const { chessPosition: toPosition } = field.userData;
    const { chessPosition: fromPosition } = piece;
    const removedPiecesIds: number[] = [];
    let promoted: Piece;

    const from = getChessNotation(fromPosition);
    const to = getChessNotation(toPosition);

    const move = this.chessEngine.move(`${from}${to}`, {
      sloppy: true,
    });

    if (move.captured) {
      const capturedPieceId = this.capturePiece(move);
      removedPiecesIds.push(capturedPieceId);
    }

    const result = this.handleFlags(move, field, piece);

    if (this.isObjectId(result)) {
      removedPiecesIds.push(result);
    } else if (isPromotionResult(result)) {
      const { removedPieceId, promotedPiece } = result;
      promoted = promotedPiece;

      removedPiecesIds.push(removedPieceId);
    }

    this.movePieceToField(field, piece);

    return {
      removedPiecesIds,
      move,
      promotedPiece: promoted,
      stopAi: typeof result === "boolean" && result,
    };
  }

  private notifyAiToMove(playerMove: Move) {
    this.gameInterface.enableOpponentTurnNotification();
    this.worker.postMessage({ type: "aiMove", playerMove });
  }

  private performPlayerMove(droppedField: Object3D): MoveResult {
    return this.handlePieceMove(droppedField, this.selected);
  }

  private dropPiece(droppedField: Object3D): ActionResult {
    const {
      removedPiecesIds,
      move: playerMove,
      promotedPiece,
      stopAi,
    } = this.performPlayerMove(droppedField);
    const isGameOver = this.chessEngine.game_over();

    if (isGameOver) {
      this.onEndGameCallback(this.chessEngine, this.startingPlayerSide);
    }

    if (!stopAi && !isGameOver) {
      this.notifyAiToMove(playerMove);
    }

    return { removedPiecesIds, promotedPiece };
  }

  private addWebWorkerListener(cb: AiMoveCallback): void {
    this.worker.addEventListener("message", (e: WebWorkerEvent) => {
      if (e.data.type !== "aiMovePerformed") {
        return;
      }

      const actionResult = this.performAiMove(e.data.aiMove);
      const isGameOver = this.chessEngine.game_over();

      cb(actionResult);

      this.gameInterface.disableOpponentTurnNotification();

      if (!isGameOver) {
        return;
      }

      this.onEndGameCallback(this.chessEngine, this.startingPlayerSide);
    });
  }

  private initChessAi() {
    if (this.startingPlayerSide !== "w") {
      this.gameInterface.enableOpponentTurnNotification();
    }

    this.worker.postMessage({
      type: "init",
      fen: this.chessEngine.fen(),
      color: this.getOppositeColor(this.startingPlayerSide),
    });
  }

  private resetSelectedPiecePosition(): void {
    const { x, y, z } = this.selectedInitialPosition;

    this.selected.changeWorldPosition(x, y, z);
    this.setPieceInitialPosition(null);
  }

  private isPlayerPiece(piece: Piece): boolean {
    return piece.color === this.startingPlayerSide;
  }

  private removePieceFromWorld(piece: Piece): void {
    piece.removeMass();
    this.world.removeBody(piece.body);
  }

  private addPieceToWorld(piece: Piece): void {
    piece.resetMass();
    this.world.addBody(piece.body);
  }

  private setPieceInitialPosition(piece: Piece | null): void {
    this.selectedInitialPosition = piece ? piece.body.position.clone() : null;
  }

  private setSelectedPiece(piece: Piece | null): void {
    this.selected = piece;
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

    this.removePieceFromWorld(piece);
    this.markPossibleMoveFields(piece.chessPosition);

    this.setPieceInitialPosition(piece);
    this.setSelectedPiece(piece);
  }

  deselect(intersectedField: Object3D): ActionResult | undefined {
    const { droppable } = intersectedField.userData;
    let actionResult: ActionResult;

    if (!droppable) {
      this.resetSelectedPiecePosition();
    } else {
      actionResult = this.dropPiece(intersectedField);
    }

    this._chessBoard.clearMarkedPlanes();

    this.addPieceToWorld(this.selected);
    this.setSelectedPiece(null);

    return actionResult;
  }

  getAllPieces(): Piece[] {
    return this.piecesContainer.getAllPieces();
  }

  init(): void {
    this.initChessBoard();
    this.piecesContainer.initPieces();
  }

  start(
    aiMoveCallback: AiMoveCallback,
    onEndGame: OnEndGame,
    onPromotion: OnPromotion
  ): PieceColor {
    this.drawSide();
    this.gameInterface.init(this.startingPlayerSide);
    this.addWebWorkerListener(aiMoveCallback);
    this.initChessAi();
    this.onEndGameCallback = onEndGame;
    this.onPromotionCallback = onPromotion;

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
    this.piecesContainer.update();
  }

  cleanup(): void {
    this.gameInterface.cleanup();
  }
}
