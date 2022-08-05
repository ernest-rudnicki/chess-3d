import BasicScene from "scenes/BasicScene";

const scene = new BasicScene({ debug: true, addGridHelper: true });

function gameLoop() {
  scene.camera.updateProjectionMatrix();
  scene.renderer.render(scene, scene.camera);
  scene.orbitals.update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
