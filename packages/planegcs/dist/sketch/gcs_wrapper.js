"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcsWrapper = void 0;
const constraint_param_index_js_1 = require("../planegcs_dist/constraint_param_index.js");
const sketch_index_js_1 = require("./sketch_index.js");
const emsc_vectors_js_1 = require("./emsc_vectors.js");
const sketch_primitive_js_1 = require("./sketch_primitive.js");
const enums_js_1 = require("../planegcs_dist/enums.js");
const geom_params_js_1 = __importStar(require("./geom_params.js"));
class GcsWrapper {
    get debug_mode() {
        return this.gcs.get_debug_mode();
    }
    set debug_mode(mode) {
        this.gcs.set_debug_mode(mode);
    }
    get equal_optimization() {
        return this.enable_equal_optimization;
    }
    set equal_optimization(val) {
        this.enable_equal_optimization = val;
    }
    constructor(gcs) {
        this.p_param_index = new Map();
        this.sketch_index = new sketch_index_js_1.SketchIndex();
        // sketch param name -> index in gcs params
        this.sketch_param_index = new Map();
        // nondriving constraint id -> list of its properties pushed as p-params (in order)
        this.nondriving_constraint_params_order = new Map();
        this.enable_equal_optimization = false;
        this.gcs = gcs;
    }
    destroy_gcs_module() {
        // only call before the deleting of this object
        this.gcs.clear_data();
        this.gcs.delete();
    }
    clear_data() {
        this.nondriving_constraint_params_order.clear();
        this.gcs.clear_data();
        this.p_param_index.clear();
        this.sketch_param_index.clear();
        this.sketch_index.clear();
    }
    // ------ Sketch -> GCS ------- (when building up a sketch)
    push_primitive(o) {
        switch (o.type) {
            case 'point':
                this.push_point(o);
                break;
            case 'line':
                this.push_line(o);
                break;
            case 'circle':
                this.push_circle(o);
                break;
            case 'arc':
                this.push_arc(o);
                break;
            case 'ellipse':
                this.push_ellipse(o);
                break;
            case 'arc_of_ellipse':
                this.push_arc_of_ellipse(o);
                break;
            case 'hyperbola':
                this.push_hyperbola(o);
                break;
            case 'arc_of_hyperbola':
                this.push_arc_of_hyperbola(o);
                break;
            case 'parabola':
                this.push_parabola(o);
                break;
            case 'arc_of_parabola':
                this.push_arc_of_parabola(o);
                break;
            default:
                this.push_constraint(o);
        }
        if (this.sketch_index.has(o.id)) {
            throw new Error(`object with id ${o.id} already exists`);
        }
        this.sketch_index.set_primitive(o);
    }
    push_primitives_and_params(objects) {
        for (const o of objects) {
            if (o.type === 'param') {
                this.push_sketch_param(o.name, o.value);
            }
            else {
                this.push_primitive(o);
            }
        }
    }
    solve(algorithm = enums_js_1.Algorithm.DogLeg) {
        return this.gcs.solve_system(algorithm);
    }
    apply_solution() {
        this.gcs.apply_solution();
        for (const obj of this.sketch_index.get_primitives()) {
            this.pull_primitive(obj);
        }
    }
    set_convergence_threshold(threshold) {
        this.gcs.set_covergence_threshold(threshold);
    }
    get_convergence_threshold() {
        return this.gcs.get_convergence_threshold();
    }
    set_max_iterations(n) {
        this.gcs.set_max_iterations(n);
    }
    get_max_iterations() {
        return this.gcs.get_max_iterations();
    }
    get_gcs_params() {
        return (0, emsc_vectors_js_1.emsc_vec_to_arr)(this.gcs.get_p_params());
    }
    get_gcs_conflicting_constraints() {
        return (0, emsc_vectors_js_1.emsc_vec_to_arr)(this.gcs.get_conflicting()).map((i) => this.sketch_index.get_id_by_index(i));
    }
    get_gcs_redundant_constraints() {
        return (0, emsc_vectors_js_1.emsc_vec_to_arr)(this.gcs.get_redundant()).map((i) => this.sketch_index.get_id_by_index(i));
    }
    get_gcs_partially_redundant_constraints() {
        return (0, emsc_vectors_js_1.emsc_vec_to_arr)(this.gcs.get_partially_redundant()).map((i) => this.sketch_index.get_id_by_index(i));
    }
    has_gcs_conflicting_constraints() {
        return this.gcs.has_conflicting();
    }
    has_gcs_redundant_constraints() {
        return this.gcs.has_redundant();
    }
    has_gcs_partially_redundant_constraints() {
        return this.gcs.has_partially_redundant();
    }
    push_sketch_param(name, value, fixed = true) {
        const pos = this.gcs.params_size();
        this.gcs.push_p_param(value, fixed);
        this.sketch_param_index.set(name, pos);
        return pos;
    }
    set_sketch_param(name, value) {
        const pos = this.sketch_param_index.get(name);
        if (pos === undefined) {
            throw new Error(`sketch param ${name} not found`);
        }
        this.gcs.set_p_param(pos, value, true);
    }
    get_sketch_param_value(name) {
        const pos = this.sketch_param_index.get(name);
        return pos === undefined ? undefined : this.gcs.get_p_param(pos);
    }
    get_sketch_param_values() {
        const result = new Map();
        for (const [name, pos] of this.sketch_param_index) {
            result.set(name, this.gcs.get_p_param(pos));
        }
        return result;
    }
    push_p_params(id, values, fixed = false) {
        const pos = this.gcs.params_size();
        for (const value of values) {
            this.gcs.push_p_param(value, fixed);
        }
        if (!this.p_param_index.has(id)) {
            this.p_param_index.set(id, pos);
        }
        return pos;
    }
    push_point(p) {
        if (this.p_param_index.has(p.id)) {
            return;
        }
        this.push_p_params(p.id, [p.x, p.y], p.fixed);
    }
    push_line(l) {
        const p1 = this.sketch_index.get_sketch_point(l.p1_id);
        const p2 = this.sketch_index.get_sketch_point(l.p2_id);
        this.push_point(p1);
        this.push_point(p2);
    }
    push_circle(c) {
        const p = this.sketch_index.get_sketch_point(c.c_id);
        this.push_point(p);
        this.push_p_params(c.id, [c.radius], false);
    }
    push_arc(a) {
        const center = this.sketch_index.get_sketch_point(a.c_id);
        this.push_point(center);
        const start = this.sketch_index.get_sketch_point(a.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(a.end_id);
        this.push_point(end);
        this.push_p_params(a.id, [a.start_angle, a.end_angle, a.radius], false);
    }
    push_ellipse(e) {
        const center = this.sketch_index.get_sketch_point(e.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(e.focus1_id);
        this.push_point(focus1);
        this.push_p_params(e.id, [e.radmin], false);
    }
    push_hyperbola(h) {
        const center = this.sketch_index.get_sketch_point(h.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(h.focus1_id);
        this.push_point(focus1);
        this.push_p_params(h.id, [h.radmin], false);
    }
    push_arc_of_hyperbola(ah) {
        const center = this.sketch_index.get_sketch_point(ah.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(ah.focus1_id);
        this.push_point(focus1);
        const start = this.sketch_index.get_sketch_point(ah.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(ah.end_id);
        this.push_point(end);
        this.push_p_params(ah.id, [ah.start_angle, ah.end_angle, ah.radmin], false);
    }
    push_parabola(p) {
        const vertex = this.sketch_index.get_sketch_point(p.vertex_id);
        this.push_point(vertex);
        const focus1 = this.sketch_index.get_sketch_point(p.focus1_id);
        this.push_point(focus1);
    }
    push_arc_of_parabola(ap) {
        const vertex = this.sketch_index.get_sketch_point(ap.vertex_id);
        this.push_point(vertex);
        const focus1 = this.sketch_index.get_sketch_point(ap.focus1_id);
        this.push_point(focus1);
        const start = this.sketch_index.get_sketch_point(ap.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(ap.end_id);
        this.push_point(end);
        this.push_p_params(ap.id, [ap.start_angle, ap.end_angle], false);
    }
    push_arc_of_ellipse(ae) {
        const center = this.sketch_index.get_sketch_point(ae.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(ae.focus1_id);
        this.push_point(focus1);
        const start = this.sketch_index.get_sketch_point(ae.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(ae.end_id);
        this.push_point(end);
        this.push_p_params(ae.id, [ae.start_angle, ae.end_angle, ae.radmin], false);
    }
    sketch_primitive_to_gcs(o) {
        switch (o.type) {
            case 'point': {
                const p_i = this.get_primitive_addr(o.id);
                return this.gcs.make_point(p_i + geom_params_js_1.property_offsets.point.x, p_i + geom_params_js_1.property_offsets.point.y);
            }
            case 'line': {
                const p1_i = this.get_primitive_addr(o.p1_id);
                const p2_i = this.get_primitive_addr(o.p2_id);
                return this.gcs.make_line(p1_i + geom_params_js_1.property_offsets.point.x, p1_i + geom_params_js_1.property_offsets.point.y, p2_i + geom_params_js_1.property_offsets.point.x, p2_i + geom_params_js_1.property_offsets.point.y);
            }
            case 'circle': {
                const cp_i = this.get_primitive_addr(o.c_id);
                const circle_i = this.get_primitive_addr(o.id);
                return this.gcs.make_circle(cp_i + geom_params_js_1.property_offsets.point.x, cp_i + geom_params_js_1.property_offsets.point.y, circle_i + geom_params_js_1.property_offsets.circle.radius);
            }
            case 'arc': {
                const c_i = this.get_primitive_addr(o.c_id);
                const start_i = this.get_primitive_addr(o.start_id);
                const end_i = this.get_primitive_addr(o.end_id);
                const a_i = this.get_primitive_addr(o.id);
                return this.gcs.make_arc(c_i + geom_params_js_1.property_offsets.point.x, c_i + geom_params_js_1.property_offsets.point.y, start_i + geom_params_js_1.property_offsets.point.x, start_i + geom_params_js_1.property_offsets.point.y, end_i + geom_params_js_1.property_offsets.point.x, end_i + geom_params_js_1.property_offsets.point.y, a_i + geom_params_js_1.property_offsets.arc.start_angle, a_i + geom_params_js_1.property_offsets.arc.end_angle, a_i + geom_params_js_1.property_offsets.arc.radius);
            }
            case 'ellipse': {
                const c_i = this.get_primitive_addr(o.c_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const radmin_i = this.get_primitive_addr(o.id);
                return this.gcs.make_ellipse(c_i + geom_params_js_1.property_offsets.point.x, c_i + geom_params_js_1.property_offsets.point.y, focus1_i + geom_params_js_1.property_offsets.point.x, focus1_i + geom_params_js_1.property_offsets.point.y, radmin_i + geom_params_js_1.property_offsets.ellipse.radmin);
            }
            case 'arc_of_ellipse': {
                const c_i = this.get_primitive_addr(o.c_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const start_i = this.get_primitive_addr(o.start_id);
                const end_i = this.get_primitive_addr(o.end_id);
                const a_i = this.get_primitive_addr(o.id);
                return this.gcs.make_arc_of_ellipse(c_i + geom_params_js_1.property_offsets.point.x, c_i + geom_params_js_1.property_offsets.point.y, focus1_i + geom_params_js_1.property_offsets.point.x, focus1_i + geom_params_js_1.property_offsets.point.y, start_i + geom_params_js_1.property_offsets.point.x, start_i + geom_params_js_1.property_offsets.point.y, end_i + geom_params_js_1.property_offsets.point.x, end_i + geom_params_js_1.property_offsets.point.y, a_i + geom_params_js_1.property_offsets.arc_of_ellipse.start_angle, a_i + geom_params_js_1.property_offsets.arc_of_ellipse.end_angle, a_i + geom_params_js_1.property_offsets.arc_of_ellipse.radmin);
            }
            case 'hyperbola': {
                const c_i = this.get_primitive_addr(o.c_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const radmin_i = this.get_primitive_addr(o.id + geom_params_js_1.property_offsets.hyperbola.radmin);
                return this.gcs.make_hyperbola(c_i + geom_params_js_1.property_offsets.point.x, c_i + geom_params_js_1.property_offsets.point.y, focus1_i + geom_params_js_1.property_offsets.point.x, focus1_i + geom_params_js_1.property_offsets.point.y, radmin_i + geom_params_js_1.property_offsets.hyperbola.radmin);
            }
            case 'arc_of_hyperbola': {
                const c_i = this.get_primitive_addr(o.c_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const start_i = this.get_primitive_addr(o.start_id);
                const end_i = this.get_primitive_addr(o.end_id);
                const a_i = this.get_primitive_addr(o.id);
                return this.gcs.make_arc_of_hyperbola(c_i + geom_params_js_1.property_offsets.point.x, c_i + geom_params_js_1.property_offsets.point.y, focus1_i + geom_params_js_1.property_offsets.point.x, focus1_i + geom_params_js_1.property_offsets.point.y, start_i + geom_params_js_1.property_offsets.point.x, start_i + geom_params_js_1.property_offsets.point.y, end_i + geom_params_js_1.property_offsets.point.x, end_i + geom_params_js_1.property_offsets.point.y, a_i + geom_params_js_1.property_offsets.arc_of_hyperbola.start_angle, a_i + geom_params_js_1.property_offsets.arc_of_hyperbola.end_angle, a_i + geom_params_js_1.property_offsets.arc_of_hyperbola.radmin);
            }
            case 'parabola': {
                const vertex_i = this.get_primitive_addr(o.vertex_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                return this.gcs.make_parabola(vertex_i + geom_params_js_1.property_offsets.point.x, vertex_i + geom_params_js_1.property_offsets.point.y, focus1_i + geom_params_js_1.property_offsets.point.x, focus1_i + geom_params_js_1.property_offsets.point.y);
            }
            case 'arc_of_parabola': {
                const vertex_i = this.get_primitive_addr(o.vertex_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const start_i = this.get_primitive_addr(o.start_id);
                const end_i = this.get_primitive_addr(o.end_id);
                const a_i = this.get_primitive_addr(o.id);
                return this.gcs.make_arc_of_parabola(vertex_i + geom_params_js_1.property_offsets.point.x, vertex_i + geom_params_js_1.property_offsets.point.y, focus1_i + geom_params_js_1.property_offsets.point.x, focus1_i + geom_params_js_1.property_offsets.point.y, start_i + geom_params_js_1.property_offsets.point.x, start_i + geom_params_js_1.property_offsets.point.y, end_i + geom_params_js_1.property_offsets.point.x, end_i + geom_params_js_1.property_offsets.point.y, a_i + geom_params_js_1.property_offsets.arc_of_parabola.start_angle, a_i + geom_params_js_1.property_offsets.arc_of_parabola.end_angle);
            }
            default:
                throw new Error(`not-implemented object type: ${o.type}`);
        }
    }
    push_constraint(c) {
        const add_constraint_args = [];
        const deletable = [];
        const constraint_params = constraint_param_index_js_1.constraint_param_index[c.type];
        if (constraint_params === undefined) {
            throw new Error(`unknown constraint type: ${c.type}`);
        }
        let numeric_tag_id = -1;
        if (!c.temporary) {
            numeric_tag_id = this.sketch_index.counter() + 1;
        }
        for (const parameter of Object.keys(constraint_params)) {
            const type = constraint_params[parameter];
            if (type === undefined) {
                throw new Error(`unknown parameter type: ${type} in constraint ${c.type}`);
            }
            // parameters with default values
            if (parameter === 'tagId') {
                add_constraint_args.push(numeric_tag_id);
                continue;
            }
            if (parameter === 'driving') {
                // add the driving? value (true by default)
                add_constraint_args.push(c.driving ?? true);
                continue;
            }
            if (parameter === 'internalalignment' && c.type === 'equal') {
                add_constraint_args.push(c.internalalignment ?? enums_js_1.Constraint_Alignment.NoInternalAlignment);
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const val = c[parameter];
            const is_fixed = (c.driving ?? true);
            if (type === 'object_param_or_number') { // or string
                // properties of constraints that can be either: 
                // 1. number => push a new p-param
                // 2. string => reference a sketch parameter
                // 3. { o_id: '1', prop: 'x' } => reference a property of a sketch primitive
                if (typeof val === 'number') {
                    if (!c.driving) {
                        // register a parameter of a non-driving constraint, that can be later updated 
                        // by the pull_constraint function
                        const list = this.nondriving_constraint_params_order.get(c.id);
                        if (list === undefined) {
                            this.nondriving_constraint_params_order.set(c.id, [parameter]);
                        }
                        else {
                            list.push(parameter);
                        }
                    }
                    const pos = this.push_p_params(c.id, [val], is_fixed);
                    add_constraint_args.push(pos);
                }
                else if (typeof val === 'string') {
                    // this is a sketch param
                    const param_addr = this.sketch_param_index.get(val);
                    if (param_addr === undefined) {
                        throw new Error(`couldn't parse object param: ${parameter} in constraint ${c.type}: unknown param ${val}`);
                    }
                    add_constraint_args.push(param_addr);
                }
                else if (typeof val === 'boolean') {
                    add_constraint_args.push(val);
                }
                else if (val !== undefined) {
                    const ref_primitive = this.sketch_index.get_primitive_or_fail(val.o_id);
                    if (!(0, sketch_primitive_js_1.is_sketch_geometry)(ref_primitive)) {
                        throw new Error(`Primitive #${val.o_id} (${ref_primitive.type}) is not supported to be referenced from a constraint.`);
                    }
                    const param_addr = this.get_primitive_addr(val.o_id) + (0, geom_params_js_1.default)(ref_primitive.type, val.prop);
                    add_constraint_args.push(param_addr);
                }
            }
            else if (type === 'object_id' && typeof val === 'string') {
                const obj = this.sketch_index.get_primitive_or_fail(val);
                const gcs_obj = this.sketch_primitive_to_gcs(obj);
                add_constraint_args.push(gcs_obj);
                deletable.push(gcs_obj);
            }
            else if (type === 'primitive_type' && (typeof val === 'number' || typeof val === 'boolean')) {
                add_constraint_args.push(val);
            }
            else {
                throw new Error(`unhandled parameter ${parameter} type: ${type}`);
            }
        }
        const c_name = c.type;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.gcs[`add_constraint_${c_name}`](...add_constraint_args, c.scale ?? 1);
        // if something is set to be equal, then optimize this process by setting the parameter to the value directly
        if (this.enable_equal_optimization && c_name === 'equal') {
            const [param_1_addr, param_2_addr] = [add_constraint_args[0], add_constraint_args[1]];
            if (typeof param_1_addr === 'number' && typeof param_2_addr === 'number') {
                if (this.gcs.get_is_fixed(param_1_addr) && !this.gcs.get_is_fixed(param_2_addr)) {
                    this.gcs.set_p_param(param_2_addr, this.gcs.get_p_param(param_1_addr), false);
                }
                else if (this.gcs.get_is_fixed(param_2_addr) && !this.gcs.get_is_fixed(param_1_addr)) {
                    this.gcs.set_p_param(param_1_addr, this.gcs.get_p_param(param_2_addr), false);
                }
            }
        }
        // wasm-allocated objects must be manually deleted 
        for (const geom_shape of deletable) {
            geom_shape.delete();
        }
    }
    // delete_constraint_by_id(id: oid): boolean {
    //     if (id !== '-1') {
    //         const item = this.sketch_index.get_primitive(id);
    //         if (item !== undefined && !is_sketch_geometry(item)) {
    //             throw new Error(`object #${id} (${item.type}) is not a constraint (delete_constraint_by_id)`);
    //         }
    //     }
    //     this.gcs.clear_by_id(id);
    //     return this.sketch_index.delete_primitive(id);
    // }
    get_primitive_addr(id) {
        const addr = this.p_param_index.get(id);
        if (addr === undefined) {
            throw new Error(`sketch object ${id} not found in p-params index`);
        }
        return addr;
    }
    // ------- GCS -> Sketch ------- (when retrieving a solution)
    pull_primitive(p) {
        if (this.p_param_index.has(p.id)) {
            if (p.type === 'point') {
                this.pull_point(p);
            }
            else if (p.type === 'line') {
                this.pull_line(p);
            }
            else if (p.type === 'arc') {
                this.pull_arc(p);
            }
            else if (p.type === 'circle') {
                this.pull_circle(p);
            }
            else if (p.type === 'ellipse') {
                this.pull_ellipse(p);
            }
            else if (p.type === 'arc_of_ellipse') {
                this.pull_arc_of_ellipse(p);
            }
            else if (p.type === 'hyperbola') {
                this.pull_hyperbola(p);
            }
            else if (p.type === 'arc_of_hyperbola') {
                this.pull_arc_of_hyperbola(p);
            }
            else if (p.type === 'parabola') {
                this.pull_parabola(p);
            }
            else if (p.type === 'arc_of_parabola') {
                this.pull_arc_of_parabola(p);
            }
            else if ((0, sketch_primitive_js_1.is_sketch_constraint)(p)) {
                this.pull_constraint(p);
            }
            else {
                // console.log(`${p.type}`);
                // todo: is this else branch necessary?
                this.sketch_index.set_primitive(p);
            }
        }
        else {
            // console.log(`object ${o.type} #${o.id} not found in params when retrieving solution`);
            this.sketch_index.set_primitive(p);
        }
    }
    pull_point(p) {
        const point_addr = this.get_primitive_addr(p.id);
        const point = {
            ...p,
            x: this.gcs.get_p_param(point_addr + geom_params_js_1.property_offsets.point.x),
            y: this.gcs.get_p_param(point_addr + geom_params_js_1.property_offsets.point.y),
        };
        this.sketch_index.set_primitive(point);
    }
    pull_line(l) {
        this.sketch_index.set_primitive(l);
    }
    pull_arc(a) {
        const addr = this.get_primitive_addr(a.id);
        this.sketch_index.set_primitive({
            ...a,
            start_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc.start_angle),
            end_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc.end_angle),
            radius: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc.radius)
        });
    }
    pull_circle(c) {
        const addr = this.get_primitive_addr(c.id);
        this.sketch_index.set_primitive({
            ...c,
            radius: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.circle.radius)
        });
    }
    pull_ellipse(e) {
        const addr = this.get_primitive_addr(e.id);
        this.sketch_index.set_primitive({
            ...e,
            radmin: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.ellipse.radmin),
        });
    }
    pull_arc_of_ellipse(ae) {
        const addr = this.get_primitive_addr(ae.id);
        this.sketch_index.set_primitive({
            ...ae,
            start_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_ellipse.start_angle),
            end_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_ellipse.end_angle),
            radmin: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_ellipse.radmin),
        });
    }
    pull_hyperbola(h) {
        const addr = this.get_primitive_addr(h.id);
        this.sketch_index.set_primitive({
            ...h,
            radmin: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.hyperbola.radmin),
        });
    }
    pull_arc_of_hyperbola(ah) {
        const addr = this.get_primitive_addr(ah.id);
        this.sketch_index.set_primitive({
            ...ah,
            start_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_hyperbola.start_angle),
            end_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_hyperbola.end_angle),
            radmin: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_hyperbola.radmin),
        });
    }
    pull_parabola(p) {
        this.sketch_index.set_primitive(p);
    }
    pull_arc_of_parabola(ap) {
        const addr = this.get_primitive_addr(ap.id);
        this.sketch_index.set_primitive({
            ...ap,
            start_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_parabola.start_angle),
            end_angle: this.gcs.get_p_param(addr + geom_params_js_1.property_offsets.arc_of_parabola.end_angle),
        });
    }
    pull_constraint(c) {
        // We don't need to pull driving constraints
        if (c.driving)
            return;
        const constraint_addr = this.get_primitive_addr(c.id);
        // Helper function to update a property of any constraint type (Equal, L2L, etc.)
        // preventing Typescript to complain about the type of the property (unable to assign a number to never)
        function updateProperty(obj, key, value) {
            obj[key] = value;
        }
        const offsets = this.nondriving_constraint_params_order.get(c.id);
        if (!offsets) {
            console.warn(`No offsets for constraint type ${c.type}`);
            return;
        }
        for (const [offset, constraint_property_name] of offsets.entries()) {
            const param = this.gcs.get_p_param(constraint_addr + offset);
            updateProperty(c, constraint_property_name, param);
        }
        this.sketch_index.set_primitive(c);
    }
}
exports.GcsWrapper = GcsWrapper;
//# sourceMappingURL=gcs_wrapper.js.map