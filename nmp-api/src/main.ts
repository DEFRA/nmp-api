import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from 'Interceptors/response.interceptor';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv?.config();
//require('dotenv').config();

const APPLICATION_PORT = process?.env.APPLICATION_PORT ?? 3000;
const APPLICATION_VER = process?.env.APPLICATION_VER ?? '1';
const APPLICATION_URL = process?.env.APPLICATION_URL ?? 'apis/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('DEFRA Application API')
    .setDescription('DEFRA')
    .setVersion(APPLICATION_VER)
    .addTag('group')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix(APPLICATION_URL, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(APPLICATION_PORT);
}
bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   const config = new DocumentBuilder()
//     .setTitle('UMR Tool Apis')
//     .setDescription('UMR Tool Apis description')
//     .setVersion('1.0')
//     .addTag('group')
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('apis', app, document);

//   app.setGlobalPrefix('apis/v1', {
//     exclude: [{ path: 'health', method: RequestMethod.GET }],
//   });
//   app.enableCors();
//   app.useGlobalInterceptors(new CustomResponseInterceptor());
//   await app.listen(3000);
// }
// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3000);
// }
// bootstrap();
