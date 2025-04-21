import { createLogger, transports, format } from 'winston';

/** アプリ全体で使う JSON ロガー */
export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({ format: format.json() }),   // 標準出力に JSON
  ],
});
