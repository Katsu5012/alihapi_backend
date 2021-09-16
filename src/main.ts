import { NestFactory,Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import {ConfigService} from '@nestjs/config'
import {ClassSerializerInterceptor} from '@nestjs/common'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(
    app.get(Reflector))
  );
  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: 'https://d3rox2eglxl43p.cloudfront.net',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept,Authorization',
    credentials:true  
  });
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
