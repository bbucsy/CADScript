import {
  Algorithm,
  GcsWrapper,
  init_planegcs_module,
  SolveStatus,
} from '@cadscript/planegcs';
import { ISolverResult, SimpleGeometryDescription } from '@cadscript/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConverterService } from './converter.service';
@Injectable()
export class SolverService {
  constructor(private readonly converterService: ConverterService) {}

  private getSolveStatus(status: SolveStatus): string {
    /*readonly Success: 0;
        readonly Converged: 1;
        readonly Failed: 2;
        readonly SuccessfulSolutionInvalid: 3;*/
    switch (status) {
      case 0:
        return 'Success';
      case 1:
        return 'Converged';
      case 2:
        return 'Failed';
      default:
        return `Unkowns Status <${status}>`;
    }
  }

  private async init_gcs_wrapper(): Promise<GcsWrapper> {
    const mod = await init_planegcs_module();
    const gcs_system_wasm = new mod.GcsSystem();
    const gcs_wrapper = new GcsWrapper(gcs_system_wasm);
    return gcs_wrapper;
  }

  async solve(model: SimpleGeometryDescription): Promise<ISolverResult> {
    const sketch = this.converterService.convertToSketchPrimitive(model);

    const gcs_wrapper = await this.init_gcs_wrapper();
    gcs_wrapper.push_primitives_and_params(sketch);
    const algorithms = [Algorithm.BFGS, Algorithm.LevenbergMarquardt];

    // solve with different solvers

    Logger.debug('Solving with DogLeg');
    let status = gcs_wrapper.solve(Algorithm.DogLeg);

    if (status !== 0) {
      for (const alg of algorithms) {
        Logger.debug(`Solving with ${alg}`);
        status = gcs_wrapper.solve(alg);
        if (status == 0) {
          break;
        }
      }
    }

    gcs_wrapper.apply_solution();
    const dof = gcs_wrapper.gcs.dof();

    const solved_sketch = gcs_wrapper.sketch_index.get_primitives();
    Logger.log(
      `redundant constrains: ${JSON.stringify(gcs_wrapper.get_gcs_redundant_constraints())}`,
    );
    Logger.log(
      `conflicting constrains_ ${JSON.stringify(gcs_wrapper.get_gcs_conflicting_constraints())}`,
    );

    gcs_wrapper.destroy_gcs_module();

    return {
      dof: dof,
      status: this.getSolveStatus(status),
      sketch: this.converterService.convertToDrawable(solved_sketch, model),
    };
  }
}
