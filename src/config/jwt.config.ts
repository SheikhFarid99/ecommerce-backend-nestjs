import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',
}));
