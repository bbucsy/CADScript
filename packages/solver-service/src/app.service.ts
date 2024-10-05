import { Injectable } from '@nestjs/common';
import { SimpleGeometryDescription } from '@cadscript/shared';
import {
  Algorithm,
  GcsWrapper,
  init_planegcs_module,
} from '@cadscript/planegcs';
@Injectable()
export class AppService {
  getHello(): SimpleGeometryDescription {
    return {
      modelName: 'test',
      data: [
        {
          type: 'POINT',
          id: 'Origin',
          helper: true,
          isLocked: true,
          posX: 0,
          posY: 0,
        },
      ],
    };
  }

  private async init_gcs_wrapper(): Promise<GcsWrapper> {
    const mod = await init_planegcs_module();
    const gcs_system_wasm = new mod.GcsSystem();
    const gcs_wrapper = new GcsWrapper(gcs_system_wasm);
    return gcs_wrapper;
  }

  async solveExample() {
    const wrapper = await this.init_gcs_wrapper();

    wrapper.push_primitive({
      id: '1',
      type: 'point',
      x: 0,
      y: 0,
      fixed: true,
    });

    wrapper.push_primitive({
      id: '2',
      type: 'point',
      x: 1,
      y: 1,
      fixed: false,
    });

    wrapper.push_primitive({
      id: '3',
      type: 'circle',
      c_id: '1',
      radius: 30,
    });

    wrapper.push_primitive({
      id: '4',
      type: 'point_on_circle',
      c_id: '3',
      p_id: '2',
    });

    wrapper.push_primitive({
      id: '5',
      type: 'vertical_pp',
      p1_id: '1',
      p2_id: '2',
    });

    wrapper.solve(Algorithm.DogLeg);

    wrapper.apply_solution();

    const solved_sektch = wrapper.sketch_index.get_primitives();

    wrapper.destroy_gcs_module();

    return solved_sektch;
  }
}
