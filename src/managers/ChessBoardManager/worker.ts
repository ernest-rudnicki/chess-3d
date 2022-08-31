import { ChessAiManager } from "managers/ChessAiManager/ChessAiManager";

let chessAiManager: ChessAiManager;

addEventListener("message", (e: any) => {
  const type = e.data.type;

  switch (type) {
    case "init":
      chessAiManager = new ChessAiManager(e.data.fen);
      chessAiManager.init(e.data.color);
      break;
    case "playerMove":
      chessAiManager.calcPlayerMove(e.data.move);
      break;
    case "aiMove":
      postMessage(chessAiManager.calcAiMove());
      break;
    default:
      return;
  }
});
