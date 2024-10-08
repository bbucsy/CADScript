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
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const parse_cpp_1 = require("./parse_cpp");
const config_1 = require("./config");
const nunjucks_1 = __importDefault(require("nunjucks"));
nunjucks_1.default.configure({ autoescape: false });
// get the data from the cpp analysis
const fn_constraints = (0, parse_cpp_1.getConstraintFunctions)();
const enums = (0, parse_cpp_1.getEnums)();
const geom_classes = (0, config_1.geometry_classes)();
// todo: refactor the deps to Makefile
let fn_ts_bindings; // depends on generating bindings.cpp first
// get script cli args: input_file1 output_file1 input_file2 output_file2 ...
const args = process.argv.slice(2);
const input_outputs = (0, utils_1.arrToNTuples)(args, 2);
const import_enums = ['InternalAlignmentType', 'Constraint_Alignment'];
for (const [template, output_file] of input_outputs) {
    if (template === 'gcs_system.ts.njk') {
        fn_ts_bindings = (0, parse_cpp_1.getFunctionTypesTypescript)();
    }
    const output_str = nunjucks_1.default.render((0, utils_1.filePath)(`templates/${template}`), { fn_constraints, enums, fn_ts_bindings, geom_classes, import_enums });
    fs_1.default.writeFileSync((0, utils_1.filePath)(output_file), output_str);
}
//# sourceMappingURL=render_templates.js.map