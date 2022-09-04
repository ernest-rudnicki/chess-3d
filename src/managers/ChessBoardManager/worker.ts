import { ChessAiManager } from "managers/ChessAiManager/ChessAiManager";
import { WebWorkerEvent } from "./types";

let chessAiManager: ChessAiManager;

addEventListener("message", (e: WebWorkerEvent) => {
  const type = e.data.type;

  switch (type) {
    case "init":
      chessAiManager = new ChessAiManager(e.data.fen);
      chessAiManager.init(e.data.color);

      if (e.data.color !== "w") {
        return;
      }

      postMessage({
        type: "aiMovePerformed",
        aiMove: chessAiManager.calcAiMove(),
      });

      break;
    case "aiMove":
      chessAiManager.updateBoardWithPlayerMove(e.data.playerMove);
      postMessage({
        type: "aiMovePerformed",
        aiMove: chessAiManager.calcAiMove(),
      });
      break;
    case "promote":
      chessAiManager.updateBoardWithPromotion(
        e.data.color,
        e.data.pieceType,
        e.data.chessNotationPos,
        e.data.move
      );
      break;
    default:
      return;
  }
});
