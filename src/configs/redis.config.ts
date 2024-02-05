export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};
