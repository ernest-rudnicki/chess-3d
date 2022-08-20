import { World } from "cannon-es";
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
import { PiecesContainer } from "./types";

export class ChessBoardManager {
  chessBoard: ChessBoard;
  pieces: PiecesContainer;

  world: World;
  loader: GLTFLoader;

  constructor(world: World, loader: GLTFLoader) {
    this.world = world;
    this.loader = loader;
  }

  init(): void {
    this.initChessBoard();
    this.initPieces();
  }

  initChessBoard() {
    this.chessBoard = new ChessBoard("ChessBoard");
    const chessBoardBody = this.chessBoard.init();
    this.world.addBody(chessBoardBody);
  }

  concatPieceName(name: string, color: PieceColor, column: number): string {
    return `${name}${column}${color === PieceColor.BLACK ? "Black" : "White"}`;
  }

  getMajorPieceInitialRow(color: PieceColor): number {
    return color === PieceColor.BLACK ? 0 : 7;
  }

  getFieldPosition(row: number, column: number): Vector3 {
    const fieldId = this.chessBoard.boardMatrix[row][column];
    const field = this.chessBoard.getObjectById(fieldId);
    const position = new Vector3();

    field.getWorldPosition(position);

    return position;
  }

  setupPiecePosition(piece: Piece, row: number, column: number): void {
    const initialPosition = this.getFieldPosition(row, column);
    const rookBody = piece.init(initialPosition, this.loader);

    this.world.addBody(rookBody);
  }

  initPawns(color: PieceColor): Pawn[] {
    const pawns: Pawn[] = [];
    const row = color === PieceColor.BLACK ? 1 : 6;

    for (let i = 0; i < 8; i++) {
      const name = this.concatPieceName("Pawn", color, i);
      const pawn = new Pawn(name, {
        initialChessPosition: { row, column: i },
        color,
      });

      this.setupPiecePosition(pawn, row, i);
      pawns.push(pawn);
    }
    return pawns;
  }

  createRook(color: PieceColor, column: number): Rook {
    const name = this.concatPieceName("Rook", color, column);
    const row = this.getMajorPieceInitialRow(color);

    const rook = new Rook(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(rook, row, column);
    return rook;
  }

  initRooks(color: PieceColor): Rook[] {
    const rooks: Rook[] = [];

    rooks.push(this.createRook(color, 0));
    rooks.push(this.createRook(color, 7));

    return rooks;
  }

  createKnight(color: PieceColor, column: number): Knight {
    const name = this.concatPieceName("Knight", color, column);
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

  initKnights(color: PieceColor): Knight[] {
    const knights = [];

    knights.push(this.createKnight(color, 1));
    knights.push(this.createKnight(color, 6));

    return knights;
  }

  createBishop(color: PieceColor, column: number): Bishop {
    const name = this.concatPieceName("Bishop", color, column);
    const row = this.getMajorPieceInitialRow(color);

    const bishop = new Bishop(name, {
      initialChessPosition: { row, column },
      color,
    });

    this.setupPiecePosition(bishop, row, column);

    bishop.body.quaternion.y = Math.PI / 3;

    return bishop;
  }

  initBishops(color: PieceColor): Bishop[] {
    const bishops = [];

    bishops.push(this.createBishop(color, 2));
    bishops.push(this.createBishop(color, 5));

    return bishops;
  }

  initQueen(color: PieceColor): Queen[] {
    const name = this.concatPieceName("Queen", color, 3);
    const row = this.getMajorPieceInitialRow(color);

    const queen = new Queen(name, {
      initialChessPosition: { row, column: 3 },
      color,
    });

    this.setupPiecePosition(queen, row, 3);

    return [queen];
  }

  initKing(color: PieceColor): King[] {
    const name = this.concatPieceName("King", color, 4);
    const row = this.getMajorPieceInitialRow(color);

    const king = new King(name, {
      initialChessPosition: { row, column: 4 },
      color,
    });

    this.setupPiecePosition(king, row, 4);

    return [king];
  }

  initPieces(): void {
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

  updatePieces(set: keyof PiecesContainer): void {
    for (const pieceSet of Object.values(this.pieces[set])) {
      pieceSet.forEach((el: Piece) => el.update());
    }
  }

  update(): void {
    this.chessBoard.update();
    this.updatePieces("black");
    this.updatePieces("white");
  }
}
