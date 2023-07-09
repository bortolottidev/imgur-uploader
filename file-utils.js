import { createReadStream, rmSync, readdirSync, readFileSync, createWriteStream, writeFileSync } from 'fs';
import { pipeline } from 'node:stream/promises';
import path from 'path';

const IMG_FORMAT_ACCEPTED = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_FORMAT_ACCEPTED = [".mp4"];
const ASSETS_DIR = "assets";
const CANNOT_UPLOAD_DIR = "cannot_upload";

export const readAssetsFiles = () => {
  const files = readdirSync(ASSETS_DIR);

  return files.
    map(file => {
      const isVideo = VIDEO_FORMAT_ACCEPTED.some(format => file.endsWith(format));
      const isPicture = IMG_FORMAT_ACCEPTED.some(format => file.endsWith(format));

      if (!isVideo && !isPicture) {
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

export const copyToCannotUploadDirectory = async (file, errorResponse) => {
  const filePath = path.resolve(ASSETS_DIR, file);
  const newFilePath = path.resolve(CANNOT_UPLOAD_DIR, file);
  const errorDetailsFilePath = path.resolve(CANNOT_UPLOAD_DIR, file + "_error.json");
  writeFileSync(errorDetailsFilePath, JSON.stringify(errorResponse, undefined, 3));

  const writeStream = createWriteStream(newFilePath);
  const readStream = createReadStream(filePath);
  try {
    await pipeline(readStream, writeStream);
  } catch (error) {
    console.error({ msg: 'Cannot move to CANNOT_UPLOAD_DIR', file, errorResponse, error });
    process.exit(121);
  }
}
