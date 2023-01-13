import fs from 'fs';
import { logger } from './logger';

/**
 * @param path file location
 * @description removing saved file if request was not successful
 */
export const removeFile = (path: string) => {
  const isImageExist = fs.statSync(path);

  if (isImageExist) {
    fs.unlink(path, (err) => {
      if (err) logger.error(err);
    });
  }
};
