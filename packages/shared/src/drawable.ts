export interface DrawablePoint {
  type: "POINT";
  x: number;
  y: number;
}

export interface DrawableLine {
  type: "LINE";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DrawableCircle {
  type: "CIRCLE";
  x: number;
  y: number;
  radius: number;
}

export interface DrawableArc {
  type: "ARC";
  xs: number;
  ys: number;
  xc: number;
  yc: number;
  xe: number;
  ye: number;
  radius: number;
}

export type Drawable =
  | DrawablePoint
  | DrawableLine
  | DrawableCircle
  | DrawableArc;

export interface ISolverResult {
  status: string;
  dof: number;
  sketch: Drawable[];
}
