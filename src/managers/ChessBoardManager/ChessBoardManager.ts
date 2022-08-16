import { World } from "cannon-es";
import { ChessBoard } from "objects/ChessBoard/ChessBoard";
import { Pawn } from "objects/Pieces/Pawn/Pawn";
import { Piece } from "objects/Pieces/Piece/Piece";
import { PieceColor } from "objects/Pieces/Piece/types";
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

  concatPieceName(name: string, color: PieceColor): string {
    return `${name}${color === PieceColor.BLACK ? "Black" : "White"}`;
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
    const name = this.concatPieceName("Pawn", color);
    const row = color === PieceColor.BLACK ? 1 : 6;

    for (let i = 0; i < 8; i++) {
      const pawn = new Pawn(name + i, {
        initialChessPosition: { row, column: i },
        color,
      });

      this.setupPiecePosition(pawn, row, i);
      pawns.push(pawn);
    }
    return pawns;
  }

  createRook(color: PieceColor, column: number): Rook {
    const name = this.concatPieceName("Rook", color);
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

  initPieces(): void {
    this.pieces = {
      black: {
        pawns: this.initPawns(PieceColor.BLACK),
        rooks: this.initRooks(PieceColor.BLACK),
      },
      white: {
        pawns: this.initPawns(PieceColor.WHITE),
        rooks: this.initRooks(PieceColor.WHITE),
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
