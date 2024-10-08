import { Body, Controller, Post } from '@nestjs/common';
import { ISolverResult, SimpleGeometryDescription } from '@cadscript/shared';
import { ConverterService } from './converter.service';
import { SketchPrimitive } from '@cadscript/planegcs';
import { SolverService } from './solver.service';

@Controller()
export class AppController {
  constructor(
    private readonly solverService: SolverService,
    private readonly converterService: ConverterService,
  ) {}

  @Post('sd2sp')
  convertToSketchPrimitive(
    @Body() input: SimpleGeometryDescription,
  ): SketchPrimitive[] {
    return this.converterService.convertToSketchPrimitive(input);
  }

  @Post('solve')
  async solveGeometry(
    @Body() input: SimpleGeometryDescription,
  ): Promise<ISolverResult> {
    return await this.solverService.solve(input);
  }
}
