import ImgLib from './imglib.js';
import { deleteFile, readFileContentBase64, readAssetsFiles } from './file-utils.js';

(async () => {
  const images = new ImgLib();
  await images.init();

  const files = readAssetsFiles();
  let uploadedNumber = 0;
  for(const { isVideo, isPicture, file } of files) {
    if (isPicture) {
      console.info("Uploading picture: " + file);
      const fileContentBase64 = readFileContentBase64(file);
      await images.upload(file, fileContentBase64);
    }

    if (isVideo) {
      console.info("Uploading video: " + file);
      await images.uploadVideo(file);
    }

    console.info("Deleting...", file);
    deleteFile(file);
    uploadedNumber++;
  }
  console.info(`Correctly uploaded and deleted ${uploadedNumber} images`)
})()

