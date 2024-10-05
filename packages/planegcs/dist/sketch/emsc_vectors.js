"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emsc_vec_to_arr = exports.arr_to_doublevec = exports.arr_to_intvec = void 0;
function arr_to_intvec(gcs_module, arr) {
    const vec = new gcs_module.IntVector();
    for (const val of arr) {
        vec.push_back(val);
    }
    return vec;
}
exports.arr_to_intvec = arr_to_intvec;
function arr_to_doublevec(gcs_module, arr) {
    const vec = new gcs_module.DoubleVector();
    for (const val of arr) {
        vec.push_back(val);
    }
    return vec;
}
exports.arr_to_doublevec = arr_to_doublevec;
function emsc_vec_to_arr(vec) {
    const result = [];
    for (let i = 0; i < vec.size(); ++i) {
        result.push(vec.get(i));
    }
    vec.delete();
    return result;
}
exports.emsc_vec_to_arr = emsc_vec_to_arr;
//# sourceMappingURL=emsc_vectors.js.map