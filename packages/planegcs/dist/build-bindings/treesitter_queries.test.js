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
const treesitter_queries_1 = __importDefault(require("./treesitter_queries"));
let q;
(0, vitest_1.describe)('TreeSitterQueries', () => {
    (0, vitest_1.beforeAll)(() => {
        q = new treesitter_queries_1.default();
    });
    (0, vitest_1.describe)('queryConstraintFunctions', () => {
        (0, vitest_1.it)('returns a valid list of constraint functions', () => {
            // see GCS.h
            const src_string = `
            class Test {
                int addConstraintEqual(double *param1, double *param2,
                    int tagId=0, bool driving = true);
                int addConstraintDifference(double *param1, double *param2,
                        double *difference, int tagId=0, bool driving = true);
            };
            `;
            const result = q.queryConstraintFunctions(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'addConstraintEqual',
                    params_list: [
                        { type: 'double', identifier: '*param1' },
                        { type: 'double', identifier: '*param2' },
                        { type: 'int', identifier: 'tagId', optional_value: '0' },
                        { type: 'bool', identifier: 'driving', optional_value: 'true' }
                    ]
                }, {
                    fname: 'addConstraintDifference',
                    params_list: [
                        { type: 'double', identifier: '*param1' },
                        { type: 'double', identifier: '*param2' },
                        { type: 'double', identifier: '*difference' },
                        { type: 'int', identifier: 'tagId', optional_value: '0' },
                        { type: 'bool', identifier: 'driving', optional_value: 'true' }
                    ]
                }]);
        });
    });
    (0, vitest_1.describe)('queryEnum', () => {
        (0, vitest_1.it)('works with (old) enum outside a class', () => {
            const src_string = `
            enum DebugMode {
                NoDebug = 0, 
                Minimal = 1,
                IterationLevel = 2
            };`;
            const result = q.queryEnum('DebugMode', src_string);
            (0, vitest_1.expect)(result).toEqual({
                name: 'DebugMode',
                is_enum_class: false,
                values: [{
                        name: 'NoDebug',
                        value: 0
                    }, {
                        name: 'Minimal',
                        value: 1
                    }, {
                        name: 'IterationLevel',
                        value: 2
                    }]
            });
        });
        (0, vitest_1.it)('works with (old) enum inside a class', () => {
            const src_string = `
            class Test {
                enum DebugMode {
                    NoDebug = 0,
                    Minimal = 1,
                    IterationLevel = 2
                };
            };`;
            const result = q.queryEnum('Test::DebugMode', src_string);
            (0, vitest_1.expect)(result).toEqual({
                name: 'Test::DebugMode',
                is_enum_class: false,
                values: [{
                        name: 'NoDebug',
                        value: 0
                    }, {
                        name: 'Minimal',
                        value: 1
                    }, {
                        name: 'IterationLevel',
                        value: 2
                    }]
            });
        });
        (0, vitest_1.it)('works with enum class inside a class', () => {
            const src_string = `
            class Test { 
                public: 
                    enum class Alignment {
                        NoInternalAlignment,
                        InternalAlignment,
                        WhateverAlignment = 20,
                        OtherAlignment
                    }; 
            };`;
            const result = q.queryEnum('Test::Alignment', src_string);
            (0, vitest_1.expect)(result).toEqual({
                name: 'Test::Alignment',
                is_enum_class: true,
                values: [{
                        name: 'NoInternalAlignment',
                        value: 0
                    }, {
                        name: 'InternalAlignment',
                        value: 1
                    }, {
                        name: 'WhateverAlignment',
                        value: 20
                    }, {
                        name: 'OtherAlignment',
                        value: 21
                    }]
            });
        });
        (0, vitest_1.it)('works with enum class outside a class', () => {
            const src_string = `
            enum class Alignment {
                NoInternalAlignment,
                InternalAlignment
            };`;
            const result = q.queryEnum('Alignment', src_string);
            (0, vitest_1.expect)(result).toEqual({
                name: 'Alignment',
                is_enum_class: true,
                values: [{
                        name: 'NoInternalAlignment',
                        value: 0
                    }, {
                        name: 'InternalAlignment',
                        value: 1
                    }]
            });
        });
    });
    (0, vitest_1.describe)('queryFunctionTypes', () => {
        (0, vitest_1.it)('returns valid bool function', () => {
            const src_string = `
                class Test {
                    bool get_is_fixed(int i) {}
                };
            `;
            const result = q.queryFunctionTypes(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'get_is_fixed',
                    params: [
                        {
                            identifier: 'i',
                            type: 'int'
                        }
                    ],
                    return_type: 'bool'
                }]);
        });
        (0, vitest_1.it)('returns valid function with class return type', () => {
            const src_string = `
                class Test {
                    Ellipse make_ellipse(
                        int cx_i, int cy_i
                    ) {}
                };
            `;
            const result = q.queryFunctionTypes(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'make_ellipse',
                    params: [
                        {
                            identifier: 'cx_i',
                            type: 'int'
                        },
                        {
                            identifier: 'cy_i',
                            type: 'int'
                        }
                    ],
                    return_type: 'Ellipse'
                }]);
        });
        (0, vitest_1.it)('works with a function with reference arguments', () => {
            const src_string = `
                class Test {
                    void set_x(int &x, double y) {}
                };
            `;
            const result = q.queryFunctionTypes(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'set_x',
                    params: [
                        {
                            identifier: '&x',
                            type: 'int'
                        },
                        {
                            identifier: 'y',
                            type: 'double'
                        }
                    ],
                    return_type: 'void'
                }]);
        });
        (0, vitest_1.it)('works with a function with double* arguments', () => {
            const src_string = `
                class Test {
                    void set_x(double *x) {}
                };
            `;
            const result = q.queryFunctionTypes(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'set_x',
                    params: [
                        {
                            identifier: '*x',
                            type: 'double'
                        }
                    ],
                    return_type: 'void'
                }]);
        });
        (0, vitest_1.it)('works with a function with a default argument', () => {
            const src_string = `
                class Test {
                    void set_x(double x, double y=0) {}
                };
            `;
            const result = q.queryFunctionTypes(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'set_x',
                    params: [
                        {
                            identifier: 'x',
                            type: 'double'
                        },
                        {
                            identifier: 'y',
                            type: 'double',
                            optional_value: '0'
                        }
                    ],
                    return_type: 'void'
                }]);
        });
        (0, vitest_1.it)('works with unsigned int', () => {
            const src_string = `
                class Test {
                    void set_x(unsigned int x) {}
                };
            `;
            const result = q.queryFunctionTypes(src_string);
            (0, vitest_1.expect)(result).toEqual([{
                    fname: 'set_x',
                    params: [
                        {
                            identifier: 'x',
                            type: 'unsigned int'
                        }
                    ],
                    return_type: 'void'
                }]);
        });
    });
});
//# sourceMappingURL=treesitter_queries.test.js.map