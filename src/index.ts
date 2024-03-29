import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import checkAllChunksUploaded from './Helpers/checkAllChunksUploaded';
import combineChunks from './Helpers/combineChunks';
const crypto = require('crypto');

const HOST = '127.0.0.1';
const PORT = 3000;
// core options
const optionsCors:cors.CorsOptions ={
  origin: ['*'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', '_token', '_key']
};

const app = express();
const ioOptionsCors = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
  }
}
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer,ioOptionsCors);

app.use(cors());
// const uploadDir = 'uploads';
// const binDir = 'bin';
// const chunkDir = path.join(uploadDir, 'chunks');

const upload = multer({ dest: 'chunks/' }); // 

fs.ensureDirSync('chunks');
fs.ensureDirSync('bin');

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.get('/', (req: Request, res: Response) => {
  res.json({ status: true , message: 'Server is running' });
});
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
 if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // Extract payload from Resumable.js
  const { resumableChunkNumber, resumableTotalChunks, resumableFilename, _token: token, _key } = req.body;
  // const key = crypto.createHash('md5').update(_key).digest('hex');
  const chunkFilename = path.join('chunks', `${_key}_${resumableFilename}-${resumableChunkNumber}`);
  const fileIdentifier = `${_key}_${resumableFilename}-${resumableChunkNumber}`;
  // Move chunk to the final destination
  console.log('Saving chunk:', req.file.path, 'to', chunkFilename);
  await fs.move(req.file.path, chunkFilename, { overwrite: true });
  // Check if all chunks are uploaded
  const chunksUploaded = await checkAllChunksUploaded('chunks', fileIdentifier, resumableTotalChunks);
  
  
  if (chunksUploaded) {
    const finalFilename = path.join('bin', `${_key}_${resumableFilename}`).replace('\\', '/');
    // Combine all chunks into one file
    await combineChunks('chunks', 'bin', fileIdentifier,finalFilename, resumableTotalChunks);
    io.emit('file-uploaded-'+_key, {status:'success', path: finalFilename, filename: path.basename(finalFilename)});

    return res.json({ path: finalFilename, filename: path.basename(finalFilename) });
  }
  res.json({ done: Number(resumableChunkNumber) / Number(resumableTotalChunks), status: true });
  });


httpServer.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});

// ---------------------------------------------------------- //

 