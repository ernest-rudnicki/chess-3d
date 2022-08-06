import { MainScene } from "scenes/MainScene/MainScene";

const scene = new MainScene({ debug: true, addGridHelper: true });

function gameLoop() {
  scene.camera.updateProjectionMatrix();
  scene.renderer.render(scene, scene.camera);
  scene.orbitals.update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
