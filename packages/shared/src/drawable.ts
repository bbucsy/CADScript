export interface DrawablePoint {
  type: "POINT";
  helper: boolean;
  x: number;
  y: number;
}

export interface DrawableLine {
  type: "LINE";
  helper: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DrawableCircle {
  type: "CIRCLE";
  helper: boolean;
  x: number;
  y: number;
  radius: number;
}

export interface DrawableArc {
  type: "ARC";
  helper: boolean;
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
