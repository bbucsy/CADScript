"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_gcs_wrapper = exports.GcsWrapper = exports.init_planegcs_module = exports.SketchIndex = exports.get_constrained_primitive_ids = exports.get_referenced_sketch_params = exports.is_sketch_geometry = exports.is_sketch_constraint = exports.InternalAlignmentType = exports.Constraint_Alignment = exports.DebugMode = exports.SolveStatus = exports.Algorithm = void 0;
var enums_js_1 = require("./planegcs_dist/enums.js");
Object.defineProperty(exports, "Algorithm", { enumerable: true, get: function () { return enums_js_1.Algorithm; } });
Object.defineProperty(exports, "SolveStatus", { enumerable: true, get: function () { return enums_js_1.SolveStatus; } });
Object.defineProperty(exports, "DebugMode", { enumerable: true, get: function () { return enums_js_1.DebugMode; } });
Object.defineProperty(exports, "Constraint_Alignment", { enumerable: true, get: function () { return enums_js_1.Constraint_Alignment; } });
Object.defineProperty(exports, "InternalAlignmentType", { enumerable: true, get: function () { return enums_js_1.InternalAlignmentType; } });
var sketch_primitive_js_1 = require("./sketch/sketch_primitive.js");
Object.defineProperty(exports, "is_sketch_constraint", { enumerable: true, get: function () { return sketch_primitive_js_1.is_sketch_constraint; } });
Object.defineProperty(exports, "is_sketch_geometry", { enumerable: true, get: function () { return sketch_primitive_js_1.is_sketch_geometry; } });
Object.defineProperty(exports, "get_referenced_sketch_params", { enumerable: true, get: function () { return sketch_primitive_js_1.get_referenced_sketch_params; } });
Object.defineProperty(exports, "get_constrained_primitive_ids", { enumerable: true, get: function () { return sketch_primitive_js_1.get_constrained_primitive_ids; } });
var sketch_index_js_1 = require("./sketch/sketch_index.js");
Object.defineProperty(exports, "SketchIndex", { enumerable: true, get: function () { return sketch_index_js_1.SketchIndex; } });
__exportStar(require("./planegcs_dist/constraints.js"), exports);
const planegcs_js_1 = __importDefault(require("./planegcs_dist/planegcs.js"));
exports.init_planegcs_module = planegcs_js_1.default;
const gcs_wrapper_js_1 = require("./sketch/gcs_wrapper.js");
Object.defineProperty(exports, "GcsWrapper", { enumerable: true, get: function () { return gcs_wrapper_js_1.GcsWrapper; } });
async function make_gcs_wrapper(wasm_path) {
    const module = await (0, planegcs_js_1.default)(wasm_path ? { locateFile: () => wasm_path } : undefined);
    const gcs = new module.GcsSystem();
    return new gcs_wrapper_js_1.GcsWrapper(gcs);
}
exports.make_gcs_wrapper = make_gcs_wrapper;
//# sourceMappingURL=index.js.map