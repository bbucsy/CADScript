"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilReadFile = exports.filePath = exports.arrToNTuples = exports.camelToSnakeCase = void 0;
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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function camelToSnakeCase(str) {
    str = str.replace(/([PL]2[PL])/, "$1_");
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}
exports.camelToSnakeCase = camelToSnakeCase;
// [1, 2, 3, 4], 2 -> [[1, 2], [3, 4]]
function arrToNTuples(arr, n) {
    return arr.reduce((acc, arg, i) => {
        if (i % n === 0) {
            acc.push([arg]);
        }
        else {
            acc[acc.length - 1].push(arg);
        }
        return acc;
    }, []);
}
exports.arrToNTuples = arrToNTuples;
// fix relative paths for nodejs
function filePath(fname) {
    return path_1.default.dirname(process.argv[1]) + "/" + fname;
}
exports.filePath = filePath;
function utilReadFile(fname) {
    return fs_1.default.readFileSync(filePath(fname)).toString();
}
exports.utilReadFile = utilReadFile;
//# sourceMappingURL=utils.js.map