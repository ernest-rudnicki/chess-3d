import { PieceColor } from "chess.js";
import { BLACK_ICONS, WHITE_ICONS } from "constants/piece-icons";
import { PieceSet } from "managers/PiecesManager/types";

export class UserInterfaceManager {
  private whiteScoreElementId = "white-score";
  private blackScoreElementId = "black-score";

  addToWhiteScore(pieceType: keyof PieceSet): void {
    const scoreElement = document.getElementById(this.whiteScoreElementId);
    scoreElement.innerHTML += BLACK_ICONS[pieceType];
  }

  addToBlackScore(pieceType: keyof PieceSet): void {
    const scoreElement = document.getElementById(this.blackScoreElementId);
    scoreElement.innerHTML += WHITE_ICONS[pieceType];
  }

  createScoreElement(id: string, isPlayerScore: boolean): void {
    const div = document.createElement("DIV");
    div.setAttribute("id", id);
    div.classList.add("score");
    div.classList.add(isPlayerScore ? "player-score" : "opponent-score");

    document.body.appendChild(div);
  }

  init(playerColor: PieceColor) {
    const isPlayerWhiteColor = playerColor === "w";

    this.createScoreElement(this.whiteScoreElementId, isPlayerWhiteColor);
    this.createScoreElement(this.blackScoreElementId, !isPlayerWhiteColor);
  }
}
