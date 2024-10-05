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
const index_1 = require("../index");
(0, vitest_1.describe)('make_gcs_wrapper', () => {
    (0, vitest_1.it)('should return a GcsWrapper', async () => {
        const gcs = await (0, index_1.make_gcs_wrapper)();
        (0, vitest_1.expect)(gcs).toBeInstanceOf(index_1.GcsWrapper);
    });
});
//# sourceMappingURL=index.test.js.map