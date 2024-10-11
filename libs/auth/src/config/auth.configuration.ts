import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt_secret: process.env.JWT_SECRET,
  expires_in: process.env.JWT_EXPIRES_IN,
}));
