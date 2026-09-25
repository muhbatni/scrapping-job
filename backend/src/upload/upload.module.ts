import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
