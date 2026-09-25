import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application, ApplicationStatusHistory } from './application.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Application, ApplicationStatusHistory])],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
