import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config.js';
import DatabaseConfig from './config/database.config.js';
import { validate } from './config/env.validation.js';
import jwtConfig from './config/jwt.config.js';
const NODE_ENV = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${NODE_ENV}`,
      validate,
      load: [appConfig, DatabaseConfig, jwtConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
