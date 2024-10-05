"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
const vitest_1 = require("vitest");
const planegcs_js_1 = __importDefault(require("../planegcs_dist/planegcs.js"));
const enums_js_1 = require("../planegcs_dist/enums.js");
const emsc_vectors_js_1 = require("../sketch/emsc_vectors.js");
const gcs_wrapper_js_1 = require("../sketch/gcs_wrapper.js");
const test_data_js_1 = require("./test_data.js");
let gcs_factory;
let gcs;
(0, vitest_1.describe)("planegcs", () => {
    (0, vitest_1.beforeAll)(async () => {
        gcs_factory = await (0, planegcs_js_1.default)();
    });
    (0, vitest_1.beforeEach)(() => {
        gcs = new gcs_factory.GcsSystem();
    });
    (0, vitest_1.afterEach)(() => {
        gcs.clear_data();
        gcs.delete();
    });
    (0, vitest_1.it)("by default it has 0 params", () => {
        (0, vitest_1.expect)(gcs.params_size()).toBe(0);
    });
    (0, vitest_1.it)("parameter can be updated", () => {
        const addr = gcs.push_p_param(1, true);
        gcs.set_p_param(addr, 2, true);
        (0, vitest_1.expect)(gcs.get_p_param(addr)).toBe(2);
    });
    (0, vitest_1.it)("constraint with a line can be called with a line object", async () => {
        const p1x_i = gcs.push_p_param(1, true);
        const p1y_i = gcs.push_p_param(2, true);
        const p2x_i = gcs.push_p_param(3, true);
        const p2y_i = gcs.push_p_param(4, true);
        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true, 1);
    });
    (0, vitest_1.it)("constraint with a curve can be called with a line object", () => {
        const p1x_i = gcs.push_p_param(1, true);
        const p1y_i = gcs.push_p_param(2, true);
        const p2x_i = gcs.push_p_param(3, true);
        const p2y_i = gcs.push_p_param(4, true);
        const angle_i = gcs.push_p_param(Math.PI / 2, false);
        const line1 = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        const line2 = gcs.make_line(p2x_i, p2y_i, p1x_i, p1y_i);
        const point = gcs.make_point(p1x_i, p1y_i);
        gcs.add_constraint_angle_via_point(line1, line2, point, angle_i, 2, true, 1);
    });
    (0, vitest_1.it)("constraint with a line cannot be called with a point object", () => {
        const p1x_i = gcs.push_p_param(1, true);
        const p1y_i = gcs.push_p_param(2, true);
        const point = gcs.make_point(p1x_i, p1y_i);
        (0, vitest_1.expect)(() => {
            gcs.add_constraint_vertical_l(point, 1, true, 1);
        }).toThrow();
    });
    (0, vitest_1.it)("dof decreases with added constraint", () => {
        const p1x_i = gcs.push_p_param(1, true);
        const p1y_i = gcs.push_p_param(2, true);
        const p2x_i = gcs.push_p_param(1, false);
        const p2y_i = gcs.push_p_param(3, false);
        gcs.solve_system(enums_js_1.Algorithm.DogLeg);
        (0, vitest_1.expect)(gcs.dof()).toBe(2);
        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true, 1);
        gcs.solve_system(enums_js_1.Algorithm.DogLeg);
        (0, vitest_1.expect)(gcs.dof()).toBe(1);
    });
    (0, vitest_1.it)("detects redundant constraints", () => {
        const p1x_i = gcs.push_p_param(1, true);
        const p1y_i = gcs.push_p_param(2, true);
        const p2x_i = gcs.push_p_param(1, false);
        const p2y_i = gcs.push_p_param(3, false);
        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true, 1);
        const diff = gcs.push_p_param(0, true);
        // a constraint with the same effect as the previous vertical => redundant
        gcs.add_constraint_difference(p1x_i, p2x_i, diff, 2, true, 1);
        gcs.solve_system(enums_js_1.Algorithm.DogLeg);
        (0, vitest_1.expect)(gcs.has_redundant()).toBeTruthy();
        const redundant = (0, emsc_vectors_js_1.emsc_vec_to_arr)(gcs.get_redundant());
        (0, vitest_1.expect)(redundant).toEqual([2]);
    });
    // it("detects partially redundant constraints", () => {
    // todo: endpoints of a vetical line symmetric over a horizontal line
    // https://www.reddit.com/r/FreeCAD/comments/z250kg/is_there_a_better_set_of_constraints_i_can_use_to/
    // });
    (0, vitest_1.it)("can add B-spline", () => {
        // for visualisation, see https://nurbscalculator.in/
        const weight_is = [1, 1, 1, 1].map(w => gcs.push_p_param(w, true));
        // knot values
        const knot_is = [
            0, 0, 0, 0, 1, 1, 1, 1
        ].map(knot_val => gcs.push_p_param(knot_val, true));
        const control_point_is = [
            -4, -4,
            -2, 4,
            2, -4,
            4, 4
        ].map(val => gcs.push_p_param(val, true));
        const degree = 3;
        const periodic = false;
        const multiplicities = [4, 1, 1, 4];
        const b_spline = gcs.make_bspline(0, 1, 6, 7, (0, emsc_vectors_js_1.arr_to_intvec)(gcs_factory, control_point_is), (0, emsc_vectors_js_1.arr_to_intvec)(gcs_factory, weight_is), (0, emsc_vectors_js_1.arr_to_intvec)(gcs_factory, knot_is), (0, emsc_vectors_js_1.arr_to_intvec)(gcs_factory, multiplicities), degree, periodic);
        // todo: test if b-spline is properly defined
    });
    (0, vitest_1.it)("returns correct enum status", () => {
        gcs.push_p_param(1, true);
        gcs.push_p_param(2, true);
        const status = gcs.solve_system(enums_js_1.Algorithm.DogLeg);
        (0, vitest_1.expect)(status).toEqual(enums_js_1.SolveStatus.Success);
    });
    (0, vitest_1.it)("can change debugmode", () => {
        gcs.set_debug_mode(enums_js_1.DebugMode.NoDebug);
        (0, vitest_1.expect)(gcs.get_debug_mode()).toBe(enums_js_1.DebugMode.NoDebug);
        gcs.set_debug_mode(enums_js_1.DebugMode.IterationLevel);
        (0, vitest_1.expect)(gcs.get_debug_mode()).toBe(enums_js_1.DebugMode.IterationLevel);
        gcs.set_debug_mode(enums_js_1.DebugMode.Minimal);
        (0, vitest_1.expect)(gcs.get_debug_mode()).toBe(enums_js_1.DebugMode.Minimal);
    });
    (0, vitest_1.it)("can clear params", () => {
        gcs.push_p_param(1, true);
        gcs.clear_data();
        (0, vitest_1.expect)(gcs.params_size()).toBe(0);
    });
    (0, vitest_1.it)('can handle big sketch with temp constraints', () => {
        const gcs_wrapper = new gcs_wrapper_js_1.GcsWrapper(gcs);
        for (const [param, value] of test_data_js_1.test_params.entries()) {
            gcs_wrapper.push_sketch_param(param, value);
        }
        for (const primitive of test_data_js_1.test_sketch) {
            gcs_wrapper.push_primitive(primitive);
        }
        (0, vitest_1.expect)(gcs_wrapper.solve()).toBe(enums_js_1.SolveStatus.Success);
    });
    (0, vitest_1.it)('can set and get max iterations', () => {
        gcs.set_max_iterations(200);
        (0, vitest_1.expect)(gcs.get_max_iterations()).toBe(200);
    });
    (0, vitest_1.it)('can set and get convergence threshold', () => {
        gcs.set_covergence_threshold(0.001);
        (0, vitest_1.expect)(gcs.get_convergence_threshold()).toBe(0.001);
    });
});
//# sourceMappingURL=planegcs.test.js.map