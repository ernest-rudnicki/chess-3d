import { PieceColor } from "chess.js";
import { BLACK_ICONS, WHITE_ICONS } from "constants/piece-icons";
import { PieceSet, PromotablePieces } from "managers/PiecesManager/types";
import { OnPromoteBtnClick } from "./types";

export class UserInterfaceManager {
  private whiteScoreElementId = "white-score";
  private blackScoreElementId = "black-score";
  private opponentTurnNotificationElementId = "opponent-turn-notification";
  private promotionElementId = "promotion-element-id";
  private promotable: PromotablePieces[] = ["q", "r", "b", "n"];

  private createScoreElement(id: string, isPlayerScore: boolean): void {
    const div = document.createElement("DIV");
    div.setAttribute("id", id);
    div.classList.add("score");
    div.classList.add(isPlayerScore ? "player-score" : "opponent-score");

    document.body.appendChild(div);
  }

  private createOpponentTurnNotificationElement(id: string): void {
    const div = document.createElement("DIV");
    div.setAttribute("id", id);
    div.style.display = "none";
    div.innerHTML = "Opponent is thinking";

    document.body.appendChild(div);
  }

  private createPromotionButtons(playerColor: PieceColor): HTMLElement {
    const btnContainer = document.createElement("DIV");

    this.promotable.forEach((pieceType: PromotablePieces) => {
      const btn = document.createElement("BUTTON");
      btn.setAttribute("data-piece-type", pieceType);

      btn.classList.add("btn");
      btn.classList.add("promotion");

      btn.innerHTML =
        playerColor === "w" ? WHITE_ICONS[pieceType] : BLACK_ICONS[pieceType];
      btnContainer.appendChild(btn);
    });

    return btnContainer;
  }

  private createPromotionElement(
    id: string,
    playerColor: PieceColor,
    cb: OnPromoteBtnClick
  ): void {
    const div = document.createElement("DIV");
    div.setAttribute("id", id);
    div.classList.add("center-mid");

    const btnContainer = this.createPromotionButtons(playerColor);

    div.appendChild(btnContainer);
    document.body.appendChild(div);

    div.onclick = (event: MouseEvent): void => {
      if (event.target instanceof Element) {
        const pieceType = event.target.getAttribute(
          "data-piece-type"
        ) as PromotablePieces;

        cb(pieceType);
        div.remove();
      }
    };
  }

  addToWhiteScore(pieceType: keyof PieceSet): void {
    const scoreElement = document.getElementById(this.whiteScoreElementId);
    scoreElement.innerHTML += BLACK_ICONS[pieceType];
  }

  addToBlackScore(pieceType: keyof PieceSet): void {
    const scoreElement = document.getElementById(this.blackScoreElementId);
    scoreElement.innerHTML += WHITE_ICONS[pieceType];
  }

  enablePromotionButtons(playerColor: PieceColor, cb: OnPromoteBtnClick): void {
    this.createPromotionElement(this.promotionElementId, playerColor, cb);
  }

  enableOpponentTurnNotification(): void {
    const el = document.getElementById(this.opponentTurnNotificationElementId);

    if (!el) {
      return;
    }

    el.style.display = "block";
  }

  disableOpponentTurnNotification(): void {
    const el = document.getElementById(this.opponentTurnNotificationElementId);

    if (!el) {
      return;
    }
    el.style.display = "none";
  }

  init(playerColor: PieceColor): void {
    const isPlayerWhiteColor = playerColor === "w";

    this.createScoreElement(this.whiteScoreElementId, isPlayerWhiteColor);
    this.createScoreElement(this.blackScoreElementId, !isPlayerWhiteColor);
    this.createOpponentTurnNotificationElement(
      this.opponentTurnNotificationElementId
    );
  }

  cleanup(): void {
    document.getElementById(this.blackScoreElementId)?.remove();
    document.getElementById(this.whiteScoreElementId)?.remove();
    document.getElementById(this.opponentTurnNotificationElementId)?.remove();
  }
}
