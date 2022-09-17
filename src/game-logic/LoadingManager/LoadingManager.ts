import { LoadingManager } from "three";

export class CustomLoadingManager extends LoadingManager {
  loaded: boolean;
  error: boolean;
  itemsLoaded: number;
  itemsTotal: number;

  onStart = (url: string, itemsLoaded: number, itemsTotal: number): void => {
    this.loaded = false;
    this.itemsLoaded = itemsLoaded;
    this.itemsTotal = itemsTotal;
  };

  onProgress = (url: string, itemsLoaded: number, itemsTotal: number): void => {
    this.itemsLoaded = itemsLoaded;
    this.itemsTotal = itemsTotal;
  };

  onError = (): void => {
    this.error = true;
  };

  onLoad = (): void => {
    this.loaded = true;
  };
}
