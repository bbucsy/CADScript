"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
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
const gcs_system_mock_1 = require("../planegcs_dist/gcs_system_mock");
vitest_1.vi.mock('../planegcs_dist/gcs_system_mock');
const sketch_index_1 = require("../sketch/sketch_index");
const gcs_wrapper_1 = require("../sketch/gcs_wrapper");
const enums_1 = require("../planegcs_dist/enums");
let gcs_wrapper;
let gcs;
// the prefix 'basic:' makes this test run before the wasm compilation
// in the pipeline process
(0, vitest_1.describe)("basic: gcs_wrapper", () => {
    (0, vitest_1.beforeAll)(() => {
        gcs = new gcs_system_mock_1.GcsSystemMock();
        gcs_wrapper = new gcs_wrapper_1.GcsWrapper(gcs);
    });
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.resetAllMocks();
        gcs_wrapper.p_param_index = new Map();
        gcs_wrapper.sketch_index = new sketch_index_1.SketchIndex();
        // simulate the behaviour of pushing params
        let arr_params = [];
        const arr_fixed = [];
        vitest_1.vi.spyOn(gcs, 'push_p_param').mockImplementation((val, fixed) => {
            arr_params.push(val);
            arr_fixed.push(fixed);
            return arr_params.length;
        });
        vitest_1.vi.spyOn(gcs, 'params_size').mockImplementation(() => {
            return arr_params.length;
        });
        vitest_1.vi.spyOn(gcs, 'get_p_param').mockImplementation((i) => {
            return arr_params[i];
        });
        vitest_1.vi.spyOn(gcs, 'apply_solution').mockImplementation(() => {
            arr_params = arr_params.map(p => p + 1);
        });
    });
    (0, vitest_1.it)("calls gcs when pushing a param", () => {
        gcs_wrapper.push_sketch_param('my_param', 10);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledWith(10, true);
        gcs_wrapper.push_sketch_param('my_other_param', 0);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledWith(0, true);
        (0, vitest_1.expect)(gcs_wrapper.get_sketch_param_value('my_param')).to.equal(10);
        (0, vitest_1.expect)(gcs_wrapper.get_sketch_param_value('my_other_param')).to.equal(0);
    });
    (0, vitest_1.it)("calls gcs when pushing a point", () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 3, y: 4, fixed: true });
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenNthCalledWith(1, 3, true);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenNthCalledWith(2, 4, true);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledTimes(2);
    });
    (0, vitest_1.it)("calls gcs when pushing a line", () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: true });
        gcs_wrapper.push_primitive({ type: 'point', id: '2', x: 0, y: 0, fixed: true });
        gcs_wrapper.push_primitive({ type: 'line', id: '3', p1_id: '1', p2_id: '2' });
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledTimes(4);
    });
    (0, vitest_1.it)("calls gcs when pushing a circle", () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: true });
        gcs_wrapper.push_primitive({ type: 'circle', id: '2', c_id: '1', radius: 3 });
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenNthCalledWith(1, 0, true);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenNthCalledWith(2, 0, true);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenNthCalledWith(3, 3, false);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledTimes(3);
    });
    (0, vitest_1.it)("calls gcs when pushing an arc", () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: true });
        gcs_wrapper.push_primitive({ type: 'point', id: '2', x: 1, y: 2, fixed: true });
        gcs_wrapper.push_primitive({ type: 'point', id: '3', x: 10, y: 10, fixed: true });
        const arc = { delete: vitest_1.vi.fn() };
        vitest_1.vi.spyOn(gcs, 'make_arc').mockReturnValueOnce(arc);
        gcs_wrapper.push_primitive({ type: 'arc', id: '4', c_id: '1', start_id: '2', end_id: '3', start_angle: 0, end_angle: 0, radius: 1 });
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledTimes(3 * 2 + 3);
    });
    (0, vitest_1.it)("calls add_constraint_equal method when adding an equal constraint", () => {
        const o1_p1_addr = gcs.params_size();
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledTimes(2);
        const value_addr = gcs.params_size();
        gcs_wrapper.push_primitive({ type: 'equal', id: '2', param1: { o_id: '1', prop: 'x' }, param2: 5 });
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenCalledTimes(3);
        (0, vitest_1.expect)(gcs.push_p_param).toHaveBeenLastCalledWith(5, true);
        const tag = 2;
        (0, vitest_1.expect)(gcs.add_constraint_equal).toHaveBeenCalledWith(o1_p1_addr, value_addr, tag, true, 0, 1);
    });
    (0, vitest_1.it)("calls add_constraint_equal with driving parameter and internal constraint when provided", () => {
        const o1_p1_addr = gcs.params_size();
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        const value_addr = gcs.params_size();
        gcs_wrapper.push_primitive({ type: 'equal', id: '2', param1: { o_id: '1', prop: 'x' }, param2: 5, driving: false, internalalignment: enums_1.Constraint_Alignment.InternalAlignment });
        const tag = 2;
        (0, vitest_1.expect)(gcs.add_constraint_equal).toHaveBeenCalledWith(o1_p1_addr, value_addr, tag, false, 1, 1);
    });
    (0, vitest_1.it)("calls add_constraint_equal with temporary tag -1 and different scale", () => {
        const o1_p1_addr = gcs.params_size();
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        const value_addr = gcs.params_size();
        const scale = 0.01;
        gcs_wrapper.push_primitive({ type: 'equal', id: '2', param1: { o_id: '1', prop: 'x' }, param2: 5, temporary: true, scale });
        const TEMPORARY_TAG = -1;
        (0, vitest_1.expect)(gcs.add_constraint_equal).toHaveBeenCalledWith(o1_p1_addr, value_addr, TEMPORARY_TAG, true, 0, scale);
    });
    (0, vitest_1.it)("calls add_constraint_angle_via_point when adding a constraint (with shuffled arguments)", () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        gcs_wrapper.push_primitive({ type: 'point', id: '2', x: 1, y: 2, fixed: false });
        gcs_wrapper.push_primitive({ type: 'line', id: '3', p1_id: '1', p2_id: '2' });
        gcs_wrapper.push_primitive({ type: 'point', id: '4', x: 10, y: 10, fixed: false });
        gcs_wrapper.push_primitive({ type: 'arc', id: '5', c_id: '1', start_id: '2', end_id: '4', start_angle: 0, end_angle: 0, radius: 1 });
        const line = { delete: vitest_1.vi.fn() };
        const point = { delete: vitest_1.vi.fn() };
        const arc = { delete: vitest_1.vi.fn() };
        vitest_1.vi.spyOn(gcs, 'make_line').mockReturnValueOnce(line);
        vitest_1.vi.spyOn(gcs, 'make_point').mockReturnValueOnce(point);
        vitest_1.vi.spyOn(gcs, 'make_arc').mockReturnValueOnce(arc);
        gcs_wrapper.push_primitive({
            id: '6',
            crv1_id: '3', // Line
            angle: Math.PI / 2,
            crv2_id: '5', // Arc
            p_id: '4',
            type: 'angle_via_point'
        });
        (0, vitest_1.expect)(gcs.make_line).toHaveBeenCalledWith(0, 1, 2, 3);
        (0, vitest_1.expect)(gcs.make_arc).toHaveBeenCalledWith(
        // center
        0, 1, 
        // start
        2, 3, 
        // end
        4, 5, 
        // start angle, end angle, radius
        6, 7, 8);
        (0, vitest_1.expect)(gcs.make_point).toHaveBeenCalledWith(4, 5);
        (0, vitest_1.expect)(line.delete).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(arc.delete).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(point.delete).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('updates the solved_sketch_index after calling solve', () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        gcs_wrapper.push_primitive({ type: 'point', id: '2', x: 1, y: 2, fixed: false });
        gcs_wrapper.push_primitive({ type: 'line', id: '3', p1_id: '1', p2_id: '2' });
        gcs_wrapper.push_primitive({ type: 'circle', id: '4', c_id: '1', radius: 3 });
        const old_primitivs = gcs_wrapper.sketch_index.get_primitives();
        (0, vitest_1.expect)(old_primitivs).toHaveLength(4);
        // does +1 to each parameter
        gcs_wrapper.apply_solution();
        for (const item of old_primitivs) {
            const new_primitive = gcs_wrapper.sketch_index.get_primitive_or_fail(item.id);
            if (new_primitive.type !== item.type) {
                (0, vitest_1.expect)(new_primitive.type).toEqual(item.type);
            }
            switch (new_primitive.type) {
                case 'point':
                    {
                        const point = item;
                        (0, vitest_1.expect)(new_primitive.x).toBe(point.x + 1);
                        (0, vitest_1.expect)(new_primitive.y).toBe(point.y + 1);
                        break;
                    }
                case 'circle':
                    {
                        const circle = item;
                        (0, vitest_1.expect)(new_primitive.radius).toBe(circle.radius + 1);
                        break;
                    }
            }
        }
    });
    (0, vitest_1.it)("calls correctly the arc2arc perpendicular constraint with boolean parameters", () => {
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        gcs_wrapper.push_primitive({ type: 'point', id: '2', x: 1, y: 2, fixed: false });
        gcs_wrapper.push_primitive({ type: 'line', id: '3', p1_id: '1', p2_id: '2' });
        gcs_wrapper.push_primitive({ type: 'point', id: '4', x: 10, y: 10, fixed: false });
        gcs_wrapper.push_primitive({ type: 'arc', id: '5', c_id: '1', start_id: '2', end_id: '4', start_angle: 0, end_angle: 0, radius: 1 });
        const line = { delete: vitest_1.vi.fn() };
        const point = { delete: vitest_1.vi.fn() };
        const arc = { delete: vitest_1.vi.fn() };
        vitest_1.vi.spyOn(gcs, 'make_line').mockReturnValue(line);
        vitest_1.vi.spyOn(gcs, 'make_point').mockReturnValue(point);
        vitest_1.vi.spyOn(gcs, 'make_arc').mockReturnValue(arc);
        gcs_wrapper.push_primitive({
            type: 'perpendicular_arc2arc',
            id: '6',
            a1_id: '5',
            a2_id: '5',
            reverse1: false,
            reverse2: true,
        });
    });
    (0, vitest_1.it)("translates redundant constraints from gcs number ids to primitive string ids", () => {
        const redundant = [2, 3];
        vitest_1.vi.spyOn(gcs, 'get_redundant').mockReturnValueOnce({
            get: (index) => redundant[index],
            size: () => redundant.length,
            delete: () => vitest_1.vi.fn(),
            push_back: vitest_1.vi.fn()
        });
        gcs_wrapper.push_primitive({ type: 'point', id: '1', x: 0, y: 0, fixed: false });
        gcs_wrapper.push_primitive({ type: 'equal', id: '2-equal', param1: { o_id: '1', prop: 'x' }, param2: 5 });
        gcs_wrapper.push_primitive({ type: 'equal', id: '3-equal', param1: { o_id: '1', prop: 'x' }, param2: 5 });
        const redundant_ids = gcs_wrapper.get_gcs_redundant_constraints();
        (0, vitest_1.expect)(redundant_ids).toEqual(['2-equal', '3-equal']);
    });
});
//# sourceMappingURL=gcs_wrapper.test.js.map