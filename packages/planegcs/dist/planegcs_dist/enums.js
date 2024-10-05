"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Algorithm = exports.SolveStatus = exports.Constraint_Alignment = exports.DebugMode = exports.InternalAlignmentType = void 0;
exports.InternalAlignmentType = {
    EllipsePositiveMajorX: 0,
    EllipsePositiveMajorY: 1,
    EllipseNegativeMajorX: 2,
    EllipseNegativeMajorY: 3,
    EllipsePositiveMinorX: 4,
    EllipsePositiveMinorY: 5,
    EllipseNegativeMinorX: 6,
    EllipseNegativeMinorY: 7,
    EllipseFocus2X: 8,
    EllipseFocus2Y: 9,
    HyperbolaPositiveMajorX: 10,
    HyperbolaPositiveMajorY: 11,
    HyperbolaNegativeMajorX: 12,
    HyperbolaNegativeMajorY: 13,
    HyperbolaPositiveMinorX: 14,
    HyperbolaPositiveMinorY: 15,
    HyperbolaNegativeMinorX: 16,
    HyperbolaNegativeMinorY: 17,
};
exports.DebugMode = {
    NoDebug: 0,
    Minimal: 1,
    IterationLevel: 2,
};
exports.Constraint_Alignment = {
    NoInternalAlignment: 0,
    InternalAlignment: 1,
};
exports.SolveStatus = {
    Success: 0,
    Converged: 1,
    Failed: 2,
    SuccessfulSolutionInvalid: 3,
};
exports.Algorithm = {
    BFGS: 0,
    LevenbergMarquardt: 1,
    DogLeg: 2,
};
//# sourceMappingURL=enums.js.map