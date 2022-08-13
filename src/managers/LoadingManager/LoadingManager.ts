import { LoadingManager } from "three";

export class CustomLoadingManager extends LoadingManager {
  loaded: boolean;
  error: boolean;
  itemsLoaded: number;
  itemsTotal: number;

  onStart = (url: string, itemsLoaded: number, itemsTotal: number) => {
    this.loaded = false;
    this.itemsLoaded = itemsLoaded;
    this.itemsTotal = itemsTotal;
  };

  onProgress = (url: string, itemsLoaded: number, itemsTotal: number) => {
    this.itemsLoaded = itemsLoaded;
    this.itemsTotal = itemsTotal;
  };

  onError = () => {
    this.error = true;
  };

  onLoad = () => {
    this.loaded = true;
  };
}
