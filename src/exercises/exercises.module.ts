import { Module } from '@nestjs/common';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { SetsModule } from '../sets/sets.module';

@Module({
  imports: [SetsModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
