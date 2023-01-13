import { Request } from 'express';
import multer from 'multer';
import { generateUniqueKey } from '../utils/uniqueId';
import fs from 'fs';
import path from 'path';

const UPLOAD_LOCATION = '../uploads/images';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const target = path.join(__dirname, UPLOAD_LOCATION);

    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, {
        recursive: true,
      });
    }

    cb(null, target);
  },

  filename: (_req, file, cb) => {
    const key = generateUniqueKey(8);

    cb(null, `${key}_${file.originalname}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(`${file.mimetype} not acceptable`, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fieldSize: 5e6,
  },
});
