"use strict";
// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
Object.defineProperty(exports, "__esModule", { value: true });
exports.geometry_classes = exports.exported_vectors = exports.class_letter_mapping = exports.exported_enums = void 0;
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
exports.exported_enums = [
    {
        enum_name: 'InternalAlignmentType',
        file: 'Constraints.h'
    },
    { enum_name: 'DebugMode', file: 'GCS.h' },
    { enum_name: 'Constraint::Alignment', file: 'Constraints.h' },
    { enum_name: 'SolveStatus', file: 'GCS.h' },
    { enum_name: 'Algorithm', file: 'GCS.h' },
];
const exported_geometry_classes = [
    {
        name: "Point",
    },
    {
        name: "Curve",
        skip_make: true,
    },
    {
        name: "Line",
        base: "Curve"
    },
    {
        name: "Circle",
        base: "Curve"
    },
    {
        name: "Ellipse",
        base: "Curve"
    },
    {
        name: "Hyperbola",
        base: "Curve"
    },
    {
        name: "Parabola",
        base: "Curve"
    },
    {
        name: "Arc",
        base: "Circle"
    },
    {
        name: "ArcOfHyperbola",
        base: "Hyperbola"
    },
    {
        name: "ArcOfEllipse",
        base: "Ellipse"
    },
    {
        name: "ArcOfParabola",
        base: "Parabola"
    },
    {
        name: "BSpline",
        base: "Curve"
    }
];
exports.class_letter_mapping = {
    "Point": "p",
    "Line": "l",
    "Circle": "c",
    "Ellipse": "e",
    "Hyperbola": "h",
    "Parabola": "pb",
    "Arc": "a",
    "ArcOfHyperbola": "ah",
    "ArcOfEllipse": "ae",
    "ArcOfParabola": "ap",
    "Curve": "cv",
    "BSpline": "bs"
};
exports.exported_vectors = {
    'vector<double>': 'DoubleVector',
    'vector<int>': 'IntVector'
};
function geometry_classes() {
    return exported_geometry_classes.map(cls => ({
        ...cls,
        make_fname: `make_${(0, utils_1.camelToSnakeCase)(cls.name)}`
    }));
}
exports.geometry_classes = geometry_classes;
//# sourceMappingURL=config.js.map