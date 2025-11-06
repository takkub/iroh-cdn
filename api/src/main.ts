import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow all origins
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    exposedHeaders: 'Content-Disposition',
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Increase body size limit for large file uploads (no limit)
  app.use(json({ limit: '50gb' }));
  app.use(urlencoded({ extended: true, limit: '50gb' }));

  const port = process.env.PORT ? Number(process.env.PORT) : 6666;
  await app.listen(port, '0.0.0.0');
  console.log(`[api] listening on ${port}`);
}
bootstrap();
