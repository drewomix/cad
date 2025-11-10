export default () => ({
  PORT: parseInt(process.env.PORT ?? '3333', 10),
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/cad',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL ?? '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL ?? '7d',
  WEB_ORIGIN: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  SOCKET_PATH: process.env.SOCKET_PATH ?? '/socket.io',
  CSRF_PROTECTION: process.env.CSRF_PROTECTION ?? 'false',
  HMAC_SECRET: process.env.HMAC_SECRET ?? 'dev-hmac-secret',
  FEATURE_FIVEM: process.env.FEATURE_FIVEM ?? 'true'
});
