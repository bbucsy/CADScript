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
const cpp2js_1 = require("./cpp2js");
(0, vitest_1.describe)('cppTypeToJsType', () => {
    (0, vitest_1.it)('works with primitive types', () => {
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('double')).toBe('number');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('int')).toBe('number');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('bool')).toBe('boolean');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('void')).toBe('void');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('unsigned int')).toBe('number');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('unsigned double')).toBe('number');
    });
    (0, vitest_1.it)('works with geometry classes', () => {
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('Ellipse')).toBe('Ellipse');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('Point')).toBe('Point');
    });
    (0, vitest_1.it)('works with enums', () => {
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('InternalAlignmentType')).toBe('InternalAlignmentType');
        (0, vitest_1.expect)((0, cpp2js_1.cpp_type_to_js_type)('Constraint::Alignment')).toBe('Constraint_Alignment');
    });
});
//# sourceMappingURL=cpp2js.test.js.map