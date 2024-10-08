import { Injectable } from '@nestjs/common';
import {
  Drawable,
  SGArcRef,
  SGCircleRef,
  SGLineRef,
  SGPointRef,
  SimpleGeometryDescription,
} from '@cadscript/shared';
import {
  SketchCircle,
  SketchPoint,
  SketchPrimitive,
} from '@cadscript/planegcs';
@Injectable()
export class ConverterService {
  convertToSketchPrimitive(
    model: SimpleGeometryDescription,
  ): SketchPrimitive[] {
    const sketchPrimitives: Array<SketchPrimitive> = [];
    const latePush: Array<SketchPrimitive> = [];

    const pointPlaceAlgorithm = (pos: number | undefined): number => {
      // TODO: replace this algorithm with something more sophisticated
      if (typeof pos === 'undefined') {
        return Math.random() + 0.01; // so no point is placed at origo
      } else return pos;
    };

    const entityReference = (
      ref: SGLineRef | SGCircleRef | SGArcRef | SGPointRef,
    ) => `${ref.index}`;

    model.data.forEach((entity, index) => {
      if (entity.type === 'POINT') {
        sketchPrimitives.push({
          type: 'point',
          fixed: entity.isLocked,
          x: pointPlaceAlgorithm(entity.posX),
          y: pointPlaceAlgorithm(entity.posY),
          id: `${index}`,
        });
      }

      if (entity.type == 'LINE') {
        sketchPrimitives.push({
          type: 'line',
          id: `${index}`,
          p1_id: entityReference(entity.p1),
          p2_id: entityReference(entity.p2),
        });
      }

      if (entity.type == 'CIRCLE') {
        sketchPrimitives.push({
          id: `${index}`,
          type: 'circle',
          c_id: entityReference(entity.center),
          radius: 1,
        });
      }

      if (entity.type == 'ARC') {
        const arc_id = `${index}`;
        sketchPrimitives.push({
          type: 'arc',
          id: arc_id,
          c_id: entityReference(entity.center),
          start_id: entityReference(entity.start),
          end_id: entityReference(entity.end),
          radius: 1,
          start_angle: 0,
          end_angle: Math.PI / 2,
        });
        latePush.push({
          type: 'arc_rules',
          id: `-`,
          a_id: arc_id,
        });
      }

      if (entity.type === 'P2P_DISTANCE') {
        sketchPrimitives.push({
          type: 'p2p_distance',
          id: `${index}`,
          distance: entity.d,
          p1_id: entityReference(entity.p1),
          p2_id: entityReference(entity.p2),
        });
      }

      if (entity.type == 'ANGLE') {
        sketchPrimitives.push({
          type: 'l2l_angle_ll',
          id: `${index}`,
          angle: entity.a * (Math.PI / 180),
          l1_id: entityReference(entity.l1),
          l2_id: entityReference(entity.l2),
        });
      }

      if (entity.type == 'SAMELENGTH') {
        sketchPrimitives.push({
          type: 'equal_length',
          id: `${index}`,
          l1_id: entityReference(entity.l1),
          l2_id: entityReference(entity.l2),
        });
      }

      if (entity.type == 'PERPENDICULAR') {
        sketchPrimitives.push({
          type: 'perpendicular_ll',
          id: `${index}`,
          l1_id: entityReference(entity.l1),
          l2_id: entityReference(entity.l2),
        });
      }

      if (entity.type == 'PARALLEL') {
        sketchPrimitives.push({
          type: 'parallel',
          id: `${index}`,
          l1_id: entityReference(entity.l1),
          l2_id: entityReference(entity.l2),
        });
      }

      if (entity.type == 'COINCIDENT') {
        sketchPrimitives.push({
          type: 'p2p_coincident',
          id: `${index}`,
          p1_id: entityReference(entity.p1),
          p2_id: entityReference(entity.p2),
        });
      }

      if (entity.type == 'P2L_Distance') {
        sketchPrimitives.push({
          type: 'p2l_distance',
          id: `${index}`,
          p_id: entityReference(entity.p),
          l_id: entityReference(entity.l),
          distance: entity.d,
        });
      }

      if (entity.type == 'TANGENT') {
        sketchPrimitives.push({
          type: 'tangent_la',
          id: `${index}`,
          l_id: entityReference(entity.l),
          a_id: entityReference(entity.a),
        });
      }

      if (entity.type == 'P_ON_L') {
        sketchPrimitives.push({
          type: entity.midpoint
            ? 'point_on_perp_bisector_pl'
            : 'point_on_line_pl',
          id: `${index}`,
          l_id: entityReference(entity.l),
          p_id: entityReference(entity.p),
        });
      }

      if (entity.type == 'P_ON_C') {
        sketchPrimitives.push({
          type: 'point_on_circle',
          id: `${index}`,
          c_id: entityReference(entity.c),
          p_id: entityReference(entity.p),
        });
      }

      if (entity.type == 'P_ON_A') {
        sketchPrimitives.push({
          type: 'point_on_arc',
          id: `${index}`,
          a_id: entityReference(entity.a),
          p_id: entityReference(entity.p),
        });
      }

      if (entity.type == 'CIRCLE_RADIUS') {
        sketchPrimitives.push({
          type: 'circle_radius',
          id: `${index}`,
          c_id: entityReference(entity.c),
          radius: entity.r,
        });
      }

      if (entity.type == 'ARC_RADIUS') {
        sketchPrimitives.push({
          type: 'arc_radius',
          id: `${index}`,
          a_id: entityReference(entity.c),
          radius: entity.r,
        });
      }
    });

    latePush.forEach((primitive) => {
      const copy = { ...primitive };
      copy.id = `${sketchPrimitives.length}`;
      sketchPrimitives.push(copy);
    });

    return sketchPrimitives;
  }

  private assertPoint(
    primitive: SketchPrimitive | undefined,
  ): asserts primitive is SketchPoint {
    if (typeof primitive === 'undefined' || primitive.type !== 'point') {
      throw new Error('Could not match point primitive to point entity');
    }
  }

  private assertCircle(
    primitive: SketchPrimitive | undefined,
  ): asserts primitive is SketchCircle {
    if (typeof primitive === 'undefined' || primitive.type !== 'circle') {
      throw new Error('Could not match circle primitive to circle entity');
    }
  }

  private assertArc(
    primitive: SketchPrimitive | undefined,
  ): asserts primitive is SketchCircle {
    if (typeof primitive === 'undefined' || primitive.type !== 'arc') {
      throw new Error('Could not match arc primitive to arc entity');
    }
  }

  convertToDrawable(
    sketch: SketchPrimitive[],
    original: SimpleGeometryDescription,
  ): Drawable[] {
    const result: Drawable[] = [];

    original.data.forEach((entity, index) => {
      if (entity.type === 'POINT') {
        const primitive = sketch.find((p) => p.id === `${index}`);
        this.assertPoint(primitive);

        result.push({
          type: 'POINT',
          helper: entity.helper,
          x: primitive.x,
          y: primitive.y,
        });
      }

      if (entity.type === 'LINE') {
        const p1 = sketch.find((p) => p.id === `${entity.p1.index}`);
        const p2 = sketch.find((p) => p.id === `${entity.p2.index}`);
        this.assertPoint(p1);
        this.assertPoint(p2);

        result.push({
          type: 'LINE',
          helper: entity.helper,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
        });
      }

      if (entity.type === 'CIRCLE') {
        const c = sketch.find((p) => p.id === `${entity.center.index}`);
        const entityPrimitive = sketch.find((p) => p.id === `${index}`);
        this.assertPoint(c);
        this.assertCircle(entityPrimitive);

        result.push({
          type: 'CIRCLE',
          helper: entity.helper,
          radius: entityPrimitive.radius,
          x: c.x,
          y: c.y,
        });
      }

      if (entity.type === 'ARC') {
        const start = sketch.find((p) => p.id === `${entity.start.index}`);
        const center = sketch.find((p) => p.id === `${entity.center.index}`);
        const end = sketch.find((p) => p.id === `${entity.end.index}`);
        const entityPrimitive = sketch.find((p) => p.id === `${index}`);
        this.assertPoint(start);
        this.assertPoint(center);
        this.assertPoint(end);
        this.assertCircle(entityPrimitive);

        result.push({
          type: 'ARC',
          helper: entity.helper,
          radius: entityPrimitive.radius,
          xs: start.x,
          ys: start.y,
          xc: center.x,
          yc: center.y,
          xe: end.x,
          ye: end.y,
        });
      }
    });

    return result;
  }
}
