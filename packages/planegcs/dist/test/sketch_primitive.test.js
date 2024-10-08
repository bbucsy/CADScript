"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const sketch_primitive_1 = require("../sketch/sketch_primitive");
(0, vitest_1.test)('get_constrained_primitive_ids', () => {
    const ids = (0, sketch_primitive_1.get_constrained_primitive_ids)({
        type: 'p2p_distance',
        p1_id: '1',
        p2_id: '2',
        distance: 1,
        id: '0',
    });
    (0, vitest_1.expect)(ids).toHaveLength(2);
    (0, vitest_1.expect)(ids).toContain('1');
    (0, vitest_1.expect)(ids).toContain('2');
});
(0, vitest_1.test)('get_referenced_sketch_params', () => {
    const params = (0, sketch_primitive_1.get_referenced_sketch_params)({
        id: '0',
        type: 'p2p_distance',
        p1_id: '1',
        p2_id: '2',
        distance: 'dist_param',
    });
    (0, vitest_1.expect)(params).toHaveLength(1);
    (0, vitest_1.expect)(params).toContain('dist_param');
});
//# sourceMappingURL=sketch_primitive.test.js.map