import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const { BadRequestException } = require('../infrastructure/http-exceptions');

export const fileUploader = multer({
  storage: multer.memoryStorage(),
  // increase size limit if needed
  limits: { fileSize: 30 * 1024 * 1024 }, //30mb
  // startProcessing(req, busboy) {
  //   req.rawBody ? busboy.end(req.rawBody) : req.pipe(busboy);
  // },
  fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'application/pdf'
    ) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Only .png, .jpg, .jpeg and .pdf formats allowed!'));
    }
  },
});