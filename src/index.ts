import { Game } from "game/Game";

const game = new Game();
game.init();

function gameLoop(): void {
  try {
    game.update();
    requestAnimationFrame(gameLoop);
  } catch (e) {
    console.error(e);
  }
}

gameLoop();
