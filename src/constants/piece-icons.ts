import { PieceSet } from "managers/PiecesContainer/types";

export const WHITE_ICONS: { [key in keyof PieceSet]: string } = {
  k: "&#9812;",
  q: "&#9813;",
  r: "&#9814;",
  b: "&#9815;",
  n: "&#9816;",
  p: "&#9817;",
};

export const BLACK_ICONS: { [key in keyof PieceSet]: string } = {
  k: "&#9818;",
  q: "&#9819;",
  r: "&#9820;",
  b: "&#9821;",
  n: "&#9822;",
  p: "&#9823;",
};
