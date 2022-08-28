import { World } from "cannon-es";
import { PieceColor } from "chess.js";
import { Bishop } from "objects/Bishop/Bishop";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { King } from "objects/Pieces/King/King";
import { Knight } from "objects/Pieces/Knight/Knight";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceChessPosition } from "objects/Pieces/Piece/types";
import { Queen } from "objects/Pieces/Queen/Queen";
import { Rook } from "objects/Pieces/Rook/Rook";
import { Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PiecesContainer, PieceSet } from "./types";

export const CHESS_BOARD_NAME = "ChessBoard";
export const PAWN_NAME = "Pawn";
export const ROOK_NAME = "Rook";
export const KNIGHT_NAME = "Knight";
export const BISHOP_NAME = "Bishop";
export const QUEEN_NAME = "Queen";
export const KING_NAME = "King";

export class PiecesManager {
  private pieces: PiecesContainer;

  constructor(
    private chessBoard: ChessBoard,
    private loader: GLTFLoader,
    private world: World
  ) {}

  private concatPieceName(
    name: string,
    color: PieceColor,
    column: number
  ): string {
    return `${name}${column}${color === "w" ? "White" : "Black"}`;
  }

  private getMajorPieceInitialRow(color: PieceColor): number {
    return color === "w" ? 0 : 7;
  }

  private getFieldPosition(chessPosition: PieceChessPosition): Vector3 {
    const { row, column } = chessPosition;
    const field = this.chessBoard.getField(row, column);
    const position = new Vector3();

    field.getWorldPosition(position);

    return position;
  }

  private setupPiecePosition(
    piece: Piece,
    chessPosition: PieceChessPosition
  ): void {
    const initialPosition = this.getFieldPosition(chessPosition);
    const rookBody = piece.init(initialPosition, this.loader);

    this.world.addBody(rookBody);
  }

  private initPawns(color: PieceColor): Pawn[] {
    const pawns: Pawn[] = [];
    const row = color === "w" ? 1 : 6;

    for (let i = 0; i < 8; i++) {
      const name = this.concatPieceName(PAWN_NAME, color, i);
      const pawn = new Pawn(name, {
        initialChessPosition: { row, column: i },
        color,
      });

      this.setupPiecePosition(pawn, { row, column: i });
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

    this.setupPiecePosition(rook, { row, column });
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

    this.setupPiecePosition(knight, { row, column });

    if (color === "b") {
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

    this.setupPiecePosition(bishop, { row, column });

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
    const column = 3;
    const name = this.concatPieceName(QUEEN_NAME, color, column);
    const row = this.getMajorPieceInitialRow(color);

    const queen = new Queen(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(queen, { row, column });

    return [queen];
  }

  private initKing(color: PieceColor): King[] {
    const column = 4;
    const name = this.concatPieceName(KING_NAME, color, column);
    const row = this.getMajorPieceInitialRow(color);

    const king = new King(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(king, { row, column });

    return [king];
  }

  private reducePieces(color: PieceColor): Piece[] {
    const pieceSet = this.pieces[color];
    let pieces: Piece[] = [];

    for (const value of Object.values(pieceSet)) {
      pieces = [...pieces, ...value];
    }

    return pieces;
  }

  removePiece(
    color: PieceColor,
    type: keyof PieceSet,
    chessPosition: PieceChessPosition
  ): number | undefined {
    const pieceSet: Piece[] = this.pieces[color][type];
    const { row: rowToRemove, column: columnToRemove } = chessPosition;

    const capturedPieceIndex = pieceSet.findIndex((piece) => {
      const { row, column } = piece.chessPosition;

      return row === rowToRemove && column === columnToRemove;
    });

    if (capturedPieceIndex === -1) {
      return;
    }
    const capturedPiece = pieceSet[capturedPieceIndex];

    this.world.removeBody(capturedPiece.body);
    pieceSet.splice(capturedPieceIndex, 1);

    return capturedPiece.id;
  }

  initPieces(): void {
    this.pieces = {
      b: {
        p: this.initPawns("b"),
        r: this.initRooks("b"),
        n: this.initKnights("b"),
        b: this.initBishops("b"),
        q: this.initQueen("b"),
        k: this.initKing("b"),
      },
      w: {
        p: this.initPawns("w"),
        r: this.initRooks("w"),
        n: this.initKnights("w"),
        b: this.initBishops("w"),
        q: this.initQueen("w"),
        k: this.initKing("w"),
      },
    };
  }

  getPiece(
    color: PieceColor,
    type: keyof PieceSet,
    chessPosition: PieceChessPosition
  ): Piece | undefined {
    const pieceSet: Piece[] = this.pieces[color][type];
    const { row: rowToFind, column: columnToFind } = chessPosition;

    return pieceSet.find((el) => {
      const { row, column } = el.chessPosition;

      return row === rowToFind && column === columnToFind;
    });
  }

  getAllPieces(): Piece[] {
    return [...this.reducePieces("w"), ...this.reducePieces("b")];
  }

  updatePieces(color: PieceColor): void {
    for (const pieceSet of Object.values(this.pieces[color])) {
      pieceSet.forEach((el: Piece) => el.update());
    }
  }
}
