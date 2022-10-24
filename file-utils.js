import { createReadStream, rmSync, readdirSync, readFileSync } from 'fs';
import path from 'path';

const IMG_FORMAT_ACCEPTED = [".jpg", ".jpeg", ".png"];
const VIDEO_FORMAT_ACCEPTED = [".mp4"];
const ASSETS_DIR = "assets";

export const readAssetsFiles = () => {
  const files = readdirSync(ASSETS_DIR);

  return files.
    map(file => {
      const isVideo = VIDEO_FORMAT_ACCEPTED.some(format => file.endsWith(format));
      const isPicture = IMG_FORMAT_ACCEPTED.some(format => file.endsWith(format));

      if(!isVideo && !isPicture) {
        return null;
      }

      return {
        isVideo,
        isPicture,
        file,
      };
    }).
    // remove file with bad format
    filter(Boolean);
}

export const readAsStream = file => {
  const filePath = path.resolve(ASSETS_DIR, file);

  return createReadStream(filePath);
}

export const readFileContentBase64 = (file) => {
  const filePath = path.resolve(ASSETS_DIR, file);

  return readFileSync(filePath, 'base64');
}

export const deleteFile = (file) => {
  const filePath = path.resolve(ASSETS_DIR, file);

  return rmSync(filePath);
}
