
import { createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const toDownloads =JSON.parse(process.env.DOWNLOAD_FILES);
const baseUrl = "https://i.redd.it/";
const assetsDir = "assets/";

export default async () => {
  for (const imgId of toDownloads) {
    if(existsSync(assetsDir + imgId)) {
      console.warn("Skipping due to already exists ", { imgId });
      continue;
    }

    const res = await fetch(`${baseUrl}${imgId}`);
    const pipelineAsync = promisify(pipeline);
   
    if (res.status !== 200) {
      console.warn("Cannot find: " + imgId, { res });
      continue;
    }

    const writestream = createWriteStream(assetsDir + imgId);
    await pipelineAsync(res.body, writestream);
  }
}

