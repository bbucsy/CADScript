import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConverterService } from './converter.service';
import { SolverService } from './solver.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SolverService, ConverterService],
})
export class AppModule {}
