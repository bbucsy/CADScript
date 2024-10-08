"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
Object.defineProperty(exports, "__esModule", { value: true });
exports.cpp_type_to_js_type = void 0;
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
const config_1 = require("./config");
const primitive_types = {
    "double": "number",
    "unsigned double": "number",
    "int": "number",
    "unsigned int": "number",
    "bool": "boolean",
    "void": "void"
};
function fix_identifier_chars(name) {
    return name.replace('::', '_');
}
function cpp_type_to_js_type(cpp_type) {
    if (cpp_type in primitive_types) {
        return primitive_types[cpp_type];
    }
    const geom_classes = Object.keys(config_1.class_letter_mapping);
    const enums = config_1.exported_enums.map(e => e.enum_name);
    if ([...geom_classes, ...enums].includes(cpp_type)) {
        return fix_identifier_chars(cpp_type);
    }
    else if (cpp_type in config_1.exported_vectors) {
        return config_1.exported_vectors[cpp_type];
    }
    throw new Error(`Unknown type ${cpp_type}!`);
}
exports.cpp_type_to_js_type = cpp_type_to_js_type;
//# sourceMappingURL=cpp2js.js.map