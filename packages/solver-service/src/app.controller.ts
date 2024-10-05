import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SimpleGeometryDescription } from '@cadscript/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): SimpleGeometryDescription {
    return this.appService.getHello();
  }

  @Get('solve')
  getSolve() {
    return this.appService.solveExample();
  }
}
