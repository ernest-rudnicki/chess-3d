declare module "*.glb";

declare module "cannon-es-debugger" {
  class CannonDebugger {
    update: () => void;
    constructor(scene: Scene, world: World);
  }
  export = CannonDebugger;
}
