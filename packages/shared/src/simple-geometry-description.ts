export interface SimpleGeometryDescription {
  modelName: string;
  data: SimpleGeometryData[];
}

export type SimpleGeometryData = SGEntity | SGConstraint;

export type SGEntity = SGPoint | SGLine | SGCircle | SGArc;

type SGEntityType = "POINT" | "LINE" | "CIRCLE" | "ARC" | "CONSTRAINT";

export interface SGRefBase {
  id: string;
  index: number;
  type: SGEntityType;
}

export interface SGPointRef extends SGRefBase {
  type: "POINT";
}

export interface SGLineRef extends SGRefBase {
  type: "LINE";
}

export interface SGCircleRef extends SGRefBase {
  type: "CIRCLE";
}

export interface SGArcRef extends SGRefBase {
  type: "ARC";
}

interface SGBase {
  id: string;
  type: SGEntityType;
  helper: boolean;
}

export interface SGPoint extends SGBase {
  type: "POINT";
  posX?: number;
  posY?: number;
  isLocked: boolean;
}

export interface SGLine extends SGBase {
  type: "LINE";
  p1: SGPointRef;
  p2: SGPointRef;
}

export interface SGCircle extends SGBase {
  type: "CIRCLE";
  center: SGPointRef;
}

export interface SGArc extends SGBase {
  type: "ARC";
  start: SGPointRef;
  center: SGPointRef;
  end: SGPointRef;
}

export type SGConstraint =
  | SGSameLengthConstraint
  | SGPerpendicularConstraint
  | SGParallelConstraint
  | SGDistanceConstraint
  | SGLineDistanceConstraint
  | SGAngleConstraint
  | SGPointOnLineCosntraint
  | SGPointOnArcCosntraint
  | SGPointOnCircleCosntraint
  | SGCoincidentConstraint
  | SGTangentConstraint
  | SGDirectionConstraint
  | SGCircleRadiusConstraint
  | SGArcRadiusConstraint;

interface SGSameLengthConstraint {
  type: "SAMELENGTH";
  l1: SGLineRef;
  l2: SGLineRef;
}

interface SGPerpendicularConstraint {
  type: "PERPENDICULAR";
  l1: SGLineRef;
  l2: SGLineRef;
}

interface SGParallelConstraint {
  type: "PARALLEL";
  l1: SGLineRef;
  l2: SGLineRef;
}

interface SGDistanceConstraint {
  type: "P2P_DISTANCE";
  p1: SGPointRef;
  p2: SGPointRef;
  d: number;
}

interface SGLineDistanceConstraint {
  type: "P2L_Distance";
  p: SGPointRef;
  l: SGLineRef;
  d: number;
}

interface SGAngleConstraint {
  type: "ANGLE";
  l1: SGLineRef;
  l2: SGLineRef;
  a: number;
}

interface SGPointOnCircleCosntraint {
  type: "P_ON_C";
  p: SGPointRef;
  c: SGCircleRef;
}

interface SGPointOnArcCosntraint {
  type: "P_ON_A";
  p: SGPointRef;
  a: SGArcRef;
}

interface SGPointOnLineCosntraint {
  type: "P_ON_L";
  p: SGPointRef;
  l: SGLineRef;
  midpoint: boolean;
}

interface SGCoincidentConstraint {
  type: "COINCIDENT";
  p1: SGPointRef;
  p2: SGPointRef;
}

interface SGTangentConstraint {
  type: "TANGENT";
  l: SGLineRef;
  a: SGArcRef;
}
interface SGDirectionConstraint {
  type: "DIRECTION";
  l: SGLineRef;
  d: "HORIZONTAL" | "VERTICAL";
}

interface SGCircleRadiusConstraint {
  type: "CIRCLE_RADIUS";
  c: SGCircleRef;
  r: number;
}

interface SGArcRadiusConstraint {
  type: "ARC_RADIUS";
  c: SGArcRef;
  r: number;
}
