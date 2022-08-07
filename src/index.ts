import { Game } from "game/Game";

const game = new Game({ debug: true, addGridHelper: true });
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
