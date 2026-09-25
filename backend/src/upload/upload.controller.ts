import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post('cv')
  @ApiOperation({ summary: 'Upload CV (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/cv',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Hanya file PDF yang diizinkan'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadCV(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    return {
      filename: file.filename,
      path: `/uploads/cv/${file.filename}`,
      size: file.size,
    };
  }

  @Post('screenshot')
  @ApiOperation({ summary: 'Upload screenshot' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/screenshots',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Hanya file gambar yang diizinkan'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadScreenshot(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    return {
      filename: file.filename,
      path: `/uploads/screenshots/${file.filename}`,
      size: file.size,
    };
  }
}
