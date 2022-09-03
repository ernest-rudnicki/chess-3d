import { PieceColor } from "chess.js";
import { BLACK_ICONS, WHITE_ICONS } from "constants/piece-icons";
import { PieceSet } from "managers/PiecesManager/types";

export class UserInterfaceManager {
  private whiteScoreElementId = "white-score";
  private blackScoreElementId = "black-score";
  private opponentTurnInfoElementId = "opponent-turn-info";

  private createScoreElement(id: string, isPlayerScore: boolean): void {
    const div = document.createElement("DIV");
    div.setAttribute("id", id);
    div.classList.add("score");
    div.classList.add(isPlayerScore ? "player-score" : "opponent-score");

    document.body.appendChild(div);
  }

  private createOpponentTurnInfoElement(id: string) {
    const div = document.createElement("DIV");
    div.setAttribute("id", id);
    div.style.display = "none";
    div.innerHTML = "Opponent is thinking";

    document.body.appendChild(div);
  }

  addToWhiteScore(pieceType: keyof PieceSet): void {
    const scoreElement = document.getElementById(this.whiteScoreElementId);
    scoreElement.innerHTML += BLACK_ICONS[pieceType];
  }

  addToBlackScore(pieceType: keyof PieceSet): void {
    const scoreElement = document.getElementById(this.blackScoreElementId);
    scoreElement.innerHTML += WHITE_ICONS[pieceType];
  }

  enableTurnInfo() {
    const el = document.getElementById(this.opponentTurnInfoElementId);

    if (!el) {
      return;
    }

    el.style.display = "block";
  }

  disableTurnInfo() {
    const el = document.getElementById(this.opponentTurnInfoElementId);

    if (!el) {
      return;
    }
    console.log(el);
    el.style.display = "none";
  }

  init(playerColor: PieceColor) {
    const isPlayerWhiteColor = playerColor === "w";

    this.createScoreElement(this.whiteScoreElementId, isPlayerWhiteColor);
    this.createScoreElement(this.blackScoreElementId, !isPlayerWhiteColor);
    this.createOpponentTurnInfoElement(this.opponentTurnInfoElementId);
  }
}
