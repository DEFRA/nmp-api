import { ResponseInterceptor } from '@interceptors/response.interceptor';
// import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import EnvironmentService from '@shared/environment.service';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { CustomLoggerService } from './custom-logger/custom-logger.service';
dotenv?.config();
let APPLICATION_PORT;
const logger = new CustomLoggerService();
const start = performance.now(); 
logger.log(`---------------------------- Logger Started at ${start} ------------------------------------`)


const APPLICATION_VER = EnvironmentService.APPLICATION_VER() ?? '1.0.0';
// const APPLICATION_URL = EnvironmentService.APPLICATION_URL() ?? 'apis/v1';

function tryJsonStringify(data:any) {
    try {
        // Attempt to stringify the data
        return JSON.stringify(data);
    } catch (error) {
        // If an error occurs, return a message with the error
        return data;
    }
}

const APPLICATION_SWAGGER_PATH =
  EnvironmentService.APPLICATION_SWAGGER_PATH() ?? 'docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 /* const customLogger = new CustomLoggerService();

  console.log = (message?: any, ...optionalParams: any[]) => {
    customLogger.log(`${tryJsonStringify(message)} ${optionalParams.join(' ')}`);
  };

  console.error = (message?: any, ...optionalParams: any[]) => {
    customLogger.error(
      `${tryJsonStringify(message)} ${optionalParams.join(' ')}`,
      optionalParams.join(' '),
    );
  };

  console.warn = (message?: any, ...optionalParams: any[]) => {
    customLogger.warn(`${tryJsonStringify(message)} ${optionalParams.join(' ')}`);
  };

  console.debug = (message?: any, ...optionalParams: any[]) => {
    customLogger.debug(`${tryJsonStringify(message)} ${optionalParams.join(' ')}`);
  };

  console.debug = (message?: any, ...optionalParams: any[]) => {
    customLogger.verbose(`${tryJsonStringify(message)} ${optionalParams.join(' ')}`);
  };
  
  */
  
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
  APPLICATION_PORT = process.env.PORT ?? EnvironmentService.APPLICATION_PORT();
  await app.listen(APPLICATION_PORT);
}

logger.log(`Http server is starting ${start}`);
bootstrap();
const end = performance.now();
logger.log( `Http server has been started! ${end}`)

logger.log(`Task Duration: ${end - start}ms`);

logger.log(`Your app is listen on PORT ${APPLICATION_PORT}`);
logger.log(`Your swagger UI is accessible on  ${APPLICATION_SWAGGER_PATH}`);
