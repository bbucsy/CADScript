"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_constrained_primitive_ids = exports.for_each_referenced_id = exports.get_referenced_sketch_params = exports.is_sketch_constraint = exports.is_sketch_geometry = void 0;
const GEOMETRY_TYPES = ['point', 'line', 'circle', 'arc', 'ellipse', 'arc_of_ellipse', 'hyperbola', 'arc_of_hyperbola', 'parabola', 'arc_of_parabola'];
function is_sketch_geometry(primitive) {
    if (primitive === undefined || primitive.type === 'param') {
        return false;
    }
    return GEOMETRY_TYPES.includes(primitive.type);
}
exports.is_sketch_geometry = is_sketch_geometry;
function is_sketch_constraint(primitive) {
    if (primitive === undefined) {
        return false;
    }
    return !is_sketch_geometry(primitive);
}
exports.is_sketch_constraint = is_sketch_constraint;
function get_referenced_sketch_params(p) {
    const params = [];
    for (const [key, val] of Object.entries(p)) {
        if (key === 'type' || key === 'id' || key.endsWith('_id')) {
            continue;
        }
        if (typeof val === 'string') {
            params.push(val);
        }
    }
    return params;
}
exports.get_referenced_sketch_params = get_referenced_sketch_params;
function for_each_referenced_id(p, f) {
    if (!is_sketch_constraint(p)) {
        return;
    }
    for (const [key, val] of Object.entries(p)) {
        if (key.endsWith('_id') && typeof val === 'string') {
            const new_val = f(val);
            if (new_val !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                p[key] = f(val);
            }
        }
        else if (typeof val === 'object' && val !== null && 'o_id' in val && typeof val['o_id'] === 'string') {
            const new_o_id = f(val.o_id);
            // some constraints have the o_id inside the object
            // see e.g. difference constraint in horizontal/vertical distance tool
            if (new_o_id !== undefined) {
                val.o_id = f(val.o_id);
            }
        }
    }
}
exports.for_each_referenced_id = for_each_referenced_id;
function get_constrained_primitive_ids(p) {
    const ids = [];
    for_each_referenced_id(p, (id) => { ids.push(id); return undefined; });
    return ids;
}
exports.get_constrained_primitive_ids = get_constrained_primitive_ids;
//# sourceMappingURL=sketch_primitive.js.map