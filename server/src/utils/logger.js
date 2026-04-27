const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

// Base format
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: baseFormat,
  transports: []
});

// ✅ PRODUCTION (Vercel) → ONLY console (NO FILE SYSTEM)
if (isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple()
    )
  }));
}

// ✅ DEVELOPMENT → File + Console
else {
  const path = require('path');
  const fs = require('fs');

  const logDir = path.join(__dirname, '../../logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  );

  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

module.exports = logger;