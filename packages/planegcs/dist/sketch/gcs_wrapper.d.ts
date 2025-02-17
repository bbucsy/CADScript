import { SketchIndex } from "./sketch_index.js";
import type { SketchPrimitive, SketchParam } from "./sketch_primitive";
import { type GcsSystem } from "../planegcs_dist/gcs_system.js";
import { Algorithm, SolveStatus, DebugMode } from "../planegcs_dist/enums.js";
import { oid } from "../planegcs_dist/id";
export declare class GcsWrapper {
    gcs: GcsSystem;
    p_param_index: Map<oid, number>;
    sketch_index: SketchIndex;
    private sketch_param_index;
    private nondriving_constraint_params_order;
    private enable_equal_optimization;
    get debug_mode(): DebugMode;
    set debug_mode(mode: DebugMode);
    get equal_optimization(): boolean;
    set equal_optimization(val: boolean);
    constructor(gcs: GcsSystem);
    destroy_gcs_module(): void;
    clear_data(): void;
    push_primitive(o: SketchPrimitive): void;
    push_primitives_and_params(objects: (SketchPrimitive | SketchParam)[]): void;
    solve(algorithm?: Algorithm): SolveStatus;
    apply_solution(): void;
    set_convergence_threshold(threshold: number): void;
    get_convergence_threshold(): number;
    set_max_iterations(n: number): void;
    get_max_iterations(): number;
    get_gcs_params(): number[];
    get_gcs_conflicting_constraints(): string[];
    get_gcs_redundant_constraints(): string[];
    get_gcs_partially_redundant_constraints(): string[];
    has_gcs_conflicting_constraints(): boolean;
    has_gcs_redundant_constraints(): boolean;
    has_gcs_partially_redundant_constraints(): boolean;
    push_sketch_param(name: string, value: number, fixed?: boolean): number;
    set_sketch_param(name: string, value: number): void;
    get_sketch_param_value(name: string): number | undefined;
    get_sketch_param_values(): Map<string, number>;
    private push_p_params;
    private push_point;
    private push_line;
    private push_circle;
    private push_arc;
    private push_ellipse;
    private push_hyperbola;
    private push_arc_of_hyperbola;
    private push_parabola;
    private push_arc_of_parabola;
    private push_arc_of_ellipse;
    private sketch_primitive_to_gcs;
    private push_constraint;
    private get_primitive_addr;
    private pull_primitive;
    private pull_point;
    private pull_line;
    private pull_arc;
    private pull_circle;
    private pull_ellipse;
    private pull_arc_of_ellipse;
    private pull_hyperbola;
    private pull_arc_of_hyperbola;
    private pull_parabola;
    private pull_arc_of_parabola;
    private pull_constraint;
}
