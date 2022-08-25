import { Vec3, World } from "cannon-es";
import { Bishop } from "objects/Bishop/Bishop";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { King } from "objects/Pieces/King/King";
import { Knight } from "objects/Pieces/Knight/Knight";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceColor } from "objects/Pieces/Piece/types";
import { Queen } from "objects/Pieces/Queen/Queen";
import { Rook } from "objects/Pieces/Rook/Rook";
import { Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { IChessEngine, PiecesContainer } from "./types";
import { Game as ChessEngine } from "js-chess-engine";

export const CHESS_BOARD_NAME = "ChessBoard";
export const PAWN_NAME = "Pawn";
export const ROOK_NAME = "Rook";
export const KNIGHT_NAME = "Knight";
export const BISHOP_NAME = "Bishop";
export const QUEEN_NAME = "Queen";
export const KING_NAME = "King";

export class ChessBoardManager {
  chessBoard: ChessBoard;
  pieces: PiecesContainer;
  chessEngine: IChessEngine;

  world: World;
  loader: GLTFLoader;

  selected: Piece | null;
  selectedInitialPosition: Vec3;

  constructor(world: World, loader: GLTFLoader) {
    this.world = world;
    this.loader = loader;
    this.chessEngine = new ChessEngine();
  }

  private deselect(): void {
    this.selected.body.position.copy(this.selectedInitialPosition);
    this.selectedInitialPosition = null;

    this.selected.resetMass();
    this.selected = null;
  }

  private select(piece: Piece): void {
    piece.removeMass();
    this.selectedInitialPosition = piece.body.position.clone();
    this.selected = piece;
  }

  private initChessBoard() {
    this.chessBoard = new ChessBoard("ChessBoard");
    const chessBoardBody = this.chessBoard.init();
    this.world.addBody(chessBoardBody);
  }

  private concatPieceName(
    name: string,
    color: PieceColor,
    column: number
  ): string {
    return `${name}${column}${color === PieceColor.BLACK ? "Black" : "White"}`;
  }

  private getMajorPieceInitialRow(color: PieceColor): number {
    return color === PieceColor.BLACK ? 0 : 7;
  }

  private getFieldPosition(row: number, column: number): Vector3 {
    const fieldId = this.chessBoard.boardMatrix[row][column];
    const field = this.chessBoard.getObjectById(fieldId);
    const position = new Vector3();

    field.getWorldPosition(position);

    return position;
  }

  private setupPiecePosition(piece: Piece, row: number, column: number): void {
    const initialPosition = this.getFieldPosition(row, column);
    const rookBody = piece.init(initialPosition, this.loader);

    this.world.addBody(rookBody);
  }

  private initPawns(color: PieceColor): Pawn[] {
    const pawns: Pawn[] = [];
    const row = color === PieceColor.BLACK ? 1 : 6;

    for (let i = 0; i < 8; i++) {
      const name = this.concatPieceName(PAWN_NAME, color, i);
      const pawn = new Pawn(name, {
        initialChessPosition: { row, column: i },
        color,
      });

      this.setupPiecePosition(pawn, row, i);
      pawns.push(pawn);
    }
    return pawns;
  }

  private createRook(color: PieceColor, column: number): Rook {
    const name = this.concatPieceName(ROOK_NAME, color, column);
    const row = this.getMajorPieceInitialRow(color);

    const rook = new Rook(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(rook, row, column);
    return rook;
  }

  private initRooks(color: PieceColor): Rook[] {
    const rooks: Rook[] = [];

    rooks.push(this.createRook(color, 0));
    rooks.push(this.createRook(color, 7));

    return rooks;
  }

  private createKnight(color: PieceColor, column: number): Knight {
    const name = this.concatPieceName(KNIGHT_NAME, color, column);
    const row = this.getMajorPieceInitialRow(color);

    const knight = new Knight(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(knight, row, column);

    if (color === PieceColor.WHITE) {
      knight.body.quaternion.set(0, Math.PI, 0, 0);
    }

    return knight;
  }

  private initKnights(color: PieceColor): Knight[] {
    const knights = [];

    knights.push(this.createKnight(color, 1));
    knights.push(this.createKnight(color, 6));

    return knights;
  }

  private createBishop(color: PieceColor, column: number): Bishop {
    const name = this.concatPieceName(BISHOP_NAME, color, column);
    const row = this.getMajorPieceInitialRow(color);

    const bishop = new Bishop(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(bishop, row, column);

    bishop.body.quaternion.y = Math.PI / 3;

    return bishop;
  }

  private initBishops(color: PieceColor): Bishop[] {
    const bishops = [];

    bishops.push(this.createBishop(color, 2));
    bishops.push(this.createBishop(color, 5));

    return bishops;
  }

  private initQueen(color: PieceColor): Queen[] {
    const name = this.concatPieceName(QUEEN_NAME, color, 3);
    const row = this.getMajorPieceInitialRow(color);

    const queen = new Queen(name, {
      initialChessPosition: { row, column: 3 },
      color,
    });

    this.setupPiecePosition(queen, row, 3);

    return [queen];
  }

  private initKing(color: PieceColor): King[] {
    const name = this.concatPieceName(KING_NAME, color, 4);
    const row = this.getMajorPieceInitialRow(color);

    const king = new King(name, {
      initialChessPosition: { row, column: 4 },
      color,
    });

    this.setupPiecePosition(king, row, 4);

    return [king];
  }

  private initPieces(): void {
    this.pieces = {
      black: {
        pawns: this.initPawns(PieceColor.BLACK),
        rooks: this.initRooks(PieceColor.BLACK),
        knights: this.initKnights(PieceColor.BLACK),
        bishops: this.initBishops(PieceColor.BLACK),
        queen: this.initQueen(PieceColor.BLACK),
        king: this.initKing(PieceColor.BLACK),
      },
      white: {
        pawns: this.initPawns(PieceColor.WHITE),
        rooks: this.initRooks(PieceColor.WHITE),
        knights: this.initKnights(PieceColor.WHITE),
        bishops: this.initBishops(PieceColor.WHITE),
        queen: this.initQueen(PieceColor.WHITE),
        king: this.initKing(PieceColor.WHITE),
      },
    };
  }

  private updatePieces(set: keyof PiecesContainer): void {
    for (const pieceSet of Object.values(this.pieces[set])) {
      pieceSet.forEach((el: Piece) => el.update());
    }
  }

  init(): void {
    this.initChessBoard();
    this.initPieces();
  }

  setSelected(piece: Piece | null): void {
    if (!piece) {
      this.deselect();
      return;
    }

    this.select(piece);
  }

  moveSelectedPiece(x: number, z: number): void {
    if (!this.selected) {
      return;
    }

    this.selected.body.position.x = x;
    this.selected.body.position.y = 0.8;
    this.selected.body.position.z = z;
  }

  update(): void {
    this.chessBoard.update();
    this.updatePieces("black");
    this.updatePieces("white");
  }
}
