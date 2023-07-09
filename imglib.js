import assert from 'assert';
import imgur from 'imgur';
import { readAsStream, copyToCannotUploadDirectory } from './file-utils.js';
const { ImgurClient } = imgur;

export const ALBUM_API = "https://api.imgur.com/3/account/me/albums/0";
export const UPLOAD_API = "https://api.imgur.com/3/image";
const VIDEO_ALBUM_TITLE = process.env.VIDEO_ALBUM_TITLE || "Videos";
const PICTURE_ALBUM_TITLE = process.env.PICTURE_ALBUM_TITLE || "Pictures";

const prepareTokenHeader = () => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.IMGUR_BEARER_TOKEN}`);

  return myHeaders;
}

const client = new ImgurClient({ accessToken: process.env.IMGUR_BEARER_TOKEN });

export default class MyImgLib {

  videoAlbum;
  pictureAlbum;
  errorCounter = 0;

  async init() {
    const requestOptions = {
      method: 'GET',
      headers: prepareTokenHeader(),
      redirect: 'follow'
    };

    const { data: albums = [] } = await fetch(ALBUM_API, requestOptions)
      .then(response => response.json())
      .catch(error => {
        console.error('Cannot init imglib', error);
      });

    this.videoAlbum = albums.find(album => album.title === VIDEO_ALBUM_TITLE);
    this.pictureAlbum = albums.find(album => album.title === PICTURE_ALBUM_TITLE);
    assert(this.videoAlbum !== undefined, "Cannot find video album");
    assert(this.pictureAlbum !== undefined, "Cannot find picture album");
  }

  async uploadVideo(file) {
    const response = await client.upload({
      image: readAsStream(file),
      album: this.videoAlbum.id,
      name: file,
      title: file,
      type: 'stream',
    });

    const error = this.checkImgurResponse(response);
    if (error) {
      this.errorCounter++;
      if (this.errorCounter === 4) {
        throw new Error('Already reached 3 errors in a row, process exit');
      }
      await copyToCannotUploadDirectory(file, error);
    }
  }

  async upload(file, fileContentBinary) {
    const formdata = new FormData();
    formdata.append("type", "base64");
    formdata.append("image", fileContentBinary);
    formdata.append("album", this.pictureAlbum.id);
    formdata.append("name", file);
    formdata.append("title", file);

    var requestOptions = {
      method: 'POST',
      headers: prepareTokenHeader(),
      body: formdata,
    };

    const response = await fetch(UPLOAD_API, requestOptions)
      .then(response => response.json())
      .catch(error => console.log('error during upload', error));
    const error = this.checkImgurResponse(response)
    if (error) {
      this.errorCounter++;
      if (this.errorCounter === 4) {
        throw new Error('Already reached 3 errors in a row, process exit');
      }
      await copyToCannotUploadDirectory(file, error);
    }
  }

  checkImgurResponse(response) {
    const { success, data } = response;
    console.log('Uploaded', { success, link: data.link, deletehash: data.deletehash })

    if (!success) {
      console.error("Something went wrong during upload", response);
      return { msg: "Cannot upload image", response };
    }
  }
}
