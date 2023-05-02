import { ChessAi } from "logic/ChessAi/ChessAi";
import { WebWorkerEvent } from "./types";

const chessAiManager = new ChessAi();

addEventListener("message", (e: WebWorkerEvent) => {
  const type = e.data.type;

  switch (type) {
    case "init":
      chessAiManager.init(e.data.color, e.data.fen);

      if (chessAiManager.isBlack()) {
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
      chessAiManager.updateChessEngineWithPromotion(e.data);
      break;
    default:
      return;
  }
});
