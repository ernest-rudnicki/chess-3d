import { Id } from "global/types";

export enum ChessFieldType {
  BLACK,
  WHITE,
}
export interface DroppableField {
  planeId: Id;
  circleId: Id;
}
