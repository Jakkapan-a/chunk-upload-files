// Validate request body

import { Request, Response, NextFunction } from 'express';

const validateFiles = (req: Request, res: Response, next: NextFunction) => {
  const { resumableChunkNumber, resumableTotalChunks, resumableFilename, _token: token, _key } = req.body;
  // Validate request
  if (!resumableChunkNumber || !resumableTotalChunks || !resumableFilename || !token || !_key) {
    return res.status(400).send('Invalid request.');
  }
  next();
};


export default validateFiles;