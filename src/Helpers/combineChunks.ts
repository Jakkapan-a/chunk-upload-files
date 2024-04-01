import path from 'path';
import fs from 'fs-extra';

 const combineChunks = async (chunksDir: string, finalDir: string, fileName: string, newFileName: string, totalChunks: number) => {
    const finalPath = path.join(finalDir, fileName).split('.bin-').shift()+'.bin';
    try {
        // get all files in chunksDir
        const files = await fs.readdir(chunksDir);
        const chunkFileName = fileName.split('.bin-').shift()+'.bin';
        for (let i = 1; i <= totalChunks; i++) {
            const chunk = files.find((file) => file.includes(`${chunkFileName}-${i}`));
            if (!chunk) {
                console.log('Chunk not found:', chunkFileName, i);
                return;
            }
            console.log('Chunk found:', chunk);
            const chunkPath = path.join(chunksDir, chunk);
            // console.log('File chunkPath :', chunkPath);
            const chunkContent = await fs.readFile(chunkPath);
            await fs.appendFile(finalPath, chunkContent);
            // // Remove chunk
            await fs.remove(chunkPath);
        }

        files.forEach(async (file) => {
          const filePath = path.join(chunksDir, file);
          if(!fs.existsSync(filePath)) return;
          const stats = await fs.stat(filePath);
          const now = new Date().getTime();
          const createTime = stats.birthtime.getTime();
          const diff = now - createTime;
          console.log('File:', file, 'createTime:', createTime, 'now:', now, 'diff:', diff);
          // convert to minutes
          const minutes = Math.floor(diff / 60000);
          console.log('Minutes:', minutes);

          if (minutes > 60) {
              console.log('Remove file:', file);
              await fs.remove(filePath);
          }         
      });
    } catch (error) {
      console.error('Error combining chunks:', error);
    }
}

export default combineChunks;