import app from './app';
import config from './app/config';
import { logger } from './share/logger';

app.listen(config.port, () => {
  logger.info(`Kanban API listening on port ${config.port} [${config.env}]`);
});
