const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const logtailToken = process.env.LOGTAIL_TOKEN || '';
const logtail = logtailToken ? new Logtail(logtailToken) : null;

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    ...(logtail ? [new LogtailTransport(logtail)] : [])
  ],
  exitOnError: false,
});

module.exports = logger;
