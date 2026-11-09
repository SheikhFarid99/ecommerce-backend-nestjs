import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: Number(process.env.DB_PORT ?? 5432),
  DB_USERNAME: process.env.DB_USERNAME ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
  DB_DATABASE: process.env.DB_DATABASE ?? 'nest-js',
}));
