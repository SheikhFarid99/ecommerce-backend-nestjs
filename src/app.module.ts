import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config.js';
import DatabaseConfig from './config/database.config.js';
import { validate } from './config/env.validation.js';
import jwtConfig from './config/jwt.config.js';
import { join } from 'node:path';
import {
  I18nModule,
  AcceptLanguageLocaleResolver,
  QueryLocaleResolver,
  JsonI18nLoader,
} from '@nestjs/i18n';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

const NODE_ENV = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${NODE_ENV}`,
      validate,
      load: [appConfig, DatabaseConfig, jwtConfig],
    }),
    I18nModule.forRoot({
      defaultLocale: 'en',
      supportedLocales: ['en', 'bn'],
      loader: new JsonI18nLoader({
        path: join(__dirname, 'i18n'),
        watch: NODE_ENV !== 'production',
      }),
      resolvers: [
        new QueryLocaleResolver('lang'),
        new AcceptLanguageLocaleResolver(),
      ],
      missingKey: NODE_ENV === 'production' ? 'fallback' : 'throw',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
