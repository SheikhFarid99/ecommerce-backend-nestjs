import databaseConfig from './database.config.js';
import appConfig from './app.config.js';
import jwtConfig from './jwt.config.js';

export type Configuration = {
  app: ReturnType<typeof databaseConfig>;
  database: ReturnType<typeof appConfig>;
  jwt: ReturnType<typeof jwtConfig>;
};
