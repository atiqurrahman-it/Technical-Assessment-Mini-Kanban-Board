import path from 'path';
import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts }) => `${ts} [${level}]: ${message}`);

const fileTransport = (filename: string, level: string) =>
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', filename),
    level,
  });

/** General application logger — request/lifecycle info. */
export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({ format: combine(colorize(), timestamp(), logFormat) }),
    fileTransport('success.log', 'info'),
  ],
});

/** Dedicated error logger, used by the global error handler. */
export const errorLogger = winston.createLogger({
  level: 'error',
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({ format: combine(colorize(), timestamp(), logFormat) }),
    fileTransport('error.log', 'error'),
  ],
});
