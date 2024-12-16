import { Module } from '@nestjs/common';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';

@Module({
  controllers: [SetsController],
  providers: [SetsService, { provide: 'SetsService', useClass: SetsService }],
  exports: [SetsService],
})
export class SetsModule {}
