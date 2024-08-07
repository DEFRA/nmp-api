import { ResponseInterceptor } from '@interceptors/response.interceptor';
// import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import EnvironmentService from '@shared/environment.service';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv?.config();
//require('dotenv').config();

const APPLICATION_PORT =
  process.env.PORT ?? EnvironmentService.APPLICATION_PORT();
const APPLICATION_VER = EnvironmentService.APPLICATION_VER() ?? '1.0.0';
// const APPLICATION_URL = EnvironmentService.APPLICATION_URL() ?? 'apis/v1';

const APPLICATION_SWAGGER_PATH =
  EnvironmentService.APPLICATION_SWAGGER_PATH() ?? 'docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: ['error','fatal','warn']});

  const config = new DocumentBuilder()
    .setTitle('NMP Application API')
    .setDescription('NMP')
    .setVersion(APPLICATION_VER)
    .addTag('group')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description:
          'Enter the Bearer Authorization string as following: Bearer [Generated-JWT-Token].',
      },
      'Bearer',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(APPLICATION_SWAGGER_PATH, app, document);

  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(APPLICATION_PORT);
}
bootstrap();

console.log(`Your app is listen on PORT ${APPLICATION_PORT}`);
console.log(`Your swagger UI is accessible on  ${APPLICATION_SWAGGER_PATH}`);
