"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.params_to_call_string = exports.params_to_definition_string = exports.getFunctionTypesTypescript = exports.getEnums = exports.getConstraintFunctions = void 0;
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
const utils_1 = require("./utils");
const treesitter_queries_1 = __importDefault(require("./treesitter_queries"));
const config_1 = require("./config");
const cpp2js_1 = require("./cpp2js");
const tsq = new treesitter_queries_1.default();
const planegcs_dir = '../planegcs';
function getConstraintFunctions() {
    const src_string = (0, utils_1.utilReadFile)(planegcs_dir + '/GCS.h');
    const functions = tsq.queryConstraintFunctions(src_string).map(item => ({
        ...item,
        params_list: item.params_list.map(param => ({
            ...param,
            is_enum: config_1.exported_enums.map(e => e.enum_name).includes(param.type)
        })),
        definition_params: params_to_definition_string(item.params_list),
        call_params: params_to_call_string(item.params_list),
        fname_lower: (0, utils_1.camelToSnakeCase)(item.fname),
    }));
    const duplicates = new Set();
    let last_n = "";
    for (const fn of functions) {
        if (fn.fname_lower === last_n) {
            duplicates.add(fn.fname_lower);
        }
        last_n = fn.fname_lower;
    }
    // differentiate between constraints (which are overloaded)
    return functions.map(fn => {
        let specificator_str = "";
        // 1: one extra parameter (incrAngle), only in p2p_angle (one special case)
        if (fn.fname_lower === "add_constraint_p2p_angle") {
            if (fn.params_list.map(p => p.identifier).includes("incrAngle")) {
                specificator_str = "_incr_angle";
            }
            // 2: different objects (pl vs ppl, pl vs ppp, ll vs pppp), e.g. point_on_line
        }
        else if (duplicates.has(fn.fname_lower)) {
            specificator_str = "_" + fn_specificator(fn.params_list);
        }
        const fname_lower = fn.fname_lower + specificator_str;
        return {
            ...fn,
            fname_lower,
            // data for typescript definitions
            constraint_name: fn.fname.replace('addConstraint', '') + specificator_str.toUpperCase(),
            constraint_type: fname_lower.replace('add_constraint_', '')
        };
    });
}
exports.getConstraintFunctions = getConstraintFunctions;
function getEnums() {
    return config_1.exported_enums.map(({ enum_name, file }) => tsq.queryEnum(enum_name, (0, utils_1.utilReadFile)(planegcs_dir + '/' + file)));
}
exports.getEnums = getEnums;
function getFunctionTypesTypescript() {
    const src_string = (0, utils_1.utilReadFile)(planegcs_dir + '/bindings.cpp');
    const cpp_funcs = tsq.queryFunctionTypes(src_string);
    const ts_funcs = cpp_funcs.map(item => ({
        return_type: (0, cpp2js_1.cpp_type_to_js_type)(item.return_type),
        fname: item.fname,
        args: item.params.map(({ type, identifier }) => ({
            type: (0, cpp2js_1.cpp_type_to_js_type)(type),
            identifier: identifier.replace('&', '')
        })).map(({ type, identifier }) => `${identifier}: ${type}`).join(', ')
    }));
    return ts_funcs;
}
exports.getFunctionTypesTypescript = getFunctionTypesTypescript;
// necessary for specifying overloaded functions
// e.g. function that takes Point, Line as arguments would be suffixed with `_pl`
function fn_specificator(params) {
    let output = "";
    for (const p of params) {
        if (p.type in config_1.class_letter_mapping) {
            output += config_1.class_letter_mapping[p.type];
        }
    }
    return output;
}
// for addConstraint functions
function params_to_definition_string(params) {
    const arr = [];
    for (const param of params) {
        if (param.type === 'double' && param.identifier.startsWith('*')) {
            const id = double_pointer_param_to_param_i(param.identifier);
            arr.push(`int ${id}`);
        }
        else {
            arr.push(`${param.type} ${param.identifier}`);
        }
    }
    return arr.join(', ');
}
exports.params_to_definition_string = params_to_definition_string;
function params_to_call_string(params) {
    const arr = [];
    for (const param of params) {
        if (param.type === 'double' && param.identifier.startsWith('*')) {
            const id = double_pointer_param_to_param_i(param.identifier);
            arr.push(`p_params[${id}]`);
        }
        else {
            arr.push(`${param.identifier.replace('&', '')}`);
        }
    }
    return arr.join(', ');
}
exports.params_to_call_string = params_to_call_string;
function double_pointer_param_to_param_i(identifier) {
    const id = identifier.replace('*', '');
    return id + (id.startsWith('param') ?
        '_i' : '_param_i');
}
//# sourceMappingURL=parse_cpp.js.map