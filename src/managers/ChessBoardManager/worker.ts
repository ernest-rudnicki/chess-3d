import { ChessAiManager } from "managers/ChessAiManager/ChessAiManager";
import { WebWorkerEvent } from "./types";

const chessAiManager = new ChessAiManager();

addEventListener("message", (e: WebWorkerEvent) => {
  const type = e.data.type;

  switch (type) {
    case "init":
      chessAiManager.init(e.data.color, e.data.fen);

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
      chessAiManager.updateChessEngineWithPromotion(
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
