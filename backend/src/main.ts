import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: ['http://localhost', 'http://localhost:80', 'http://localhost:5173', 'http://frontend:80'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Job Apply Assistant Indonesia')
    .setDescription('API untuk membantu pencarian dan manajemen lamaran kerja di Indonesia')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('profiles', 'User profile management')
    .addTag('jobs', 'Job listings')
    .addTag('applications', 'Job applications')
    .addTag('job-sources', 'Job sources management')
    .addTag('crawl-logs', 'Crawling logs')
    .addTag('notifications', 'Notifications')
    .addTag('dashboard', 'Dashboard statistics')
    .addTag('admin', 'Admin panel')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
