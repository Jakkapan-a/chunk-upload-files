import fs from 'fs-extra';
const checkAllChunksUploaded = async (chunksDir: string, fileName: string, totalChunks: number): Promise<boolean> => {
    try {
        const files = await fs.readdir(chunksDir);
        const chunkFileName = fileName.split('.bin-').shift()+'.bin';
        const chunks = files.filter((file) => file.includes(chunkFileName));

        if (chunks.length > 0 && chunks.length == totalChunks)
        {
          return true;
        }
        return false;
    } catch (error) {
      console.error('Error checking chunks:', error);
      return false;
    }
  }

export default checkAllChunksUploaded;