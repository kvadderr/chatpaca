const fs = require('fs');
const url = 'http://62.68.146.39:4000/gen/faceSwap';
const axios = require('axios')
const sharp = require('sharp');
const db = require('./db');

function readFileAsBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64String = fileBuffer.toString('base64');
  return base64String;
}

async function getImageBase64(inputPathArray) {
  const data = [];
  try {
    for (const inputPath of inputPathArray) {
      const imageBuffer = await sharp(inputPath).blur(10).toBuffer();
      const base64Data = imageBuffer.toString('base64');
      data.push(base64Data);
    }
    return data;
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error.message);
    throw error;
  }
}


async function getImageBase64WithoutBlur(inputPathArray) {
  const data = [];
  try {
    for (const inputPath of inputPathArray) {
      const imageBuffer = await sharp(inputPath.path).blur(0.3).toBuffer();
      const base64Data = imageBuffer.toString('base64');
      data.push(base64Data);
    }
    return data;
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error.message);
    throw error;
  }
}

async function saveImageLocally(base64DataArray) {
  const filePaths = [];

  for (const base64Data of base64DataArray) {
    const fileName = `image_${Date.now()}.jpg`;
    const filePath = `./generating/${fileName}`;
    await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));
    filePaths.push(filePath);
  }

  return filePaths;
}


function toDataUrl(url, callback) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    })
      .then(response => {
        const base64Data = Buffer.from(response.data, 'binary').toString('base64');
        const dataUrl = `data:${response.headers['content-type']};base64,${base64Data}`;
        resolve(dataUrl);
      })
      .catch(error => {
        reject(`Error: ${error.message}`);
      });
  });
}

async function generateImage(isMale, userPhotoPath) {
  let baseImage1, baseImage2, baseImage3;

  if (isMale) {
    baseImage1 = './assets/man_1.jpeg';
    baseImage2 = './assets/man_2.jpeg';
    baseImage3 = './assets/man_3.jpeg';
  } else {
    baseImage1 = './assets/girl_1.jpeg';
    baseImage2 = './assets/girl_2.jpeg';
    baseImage3 = './assets/girl_3.jpeg';
  }

  const userPhoto = await toDataUrl(userPhotoPath);

  const base64Data1 = readFileAsBase64(baseImage1);
  const base64Data2 = readFileAsBase64(baseImage2);
  const base64Data3 = readFileAsBase64(baseImage3);

  const data1 = {
    original: base64Data1,
    userFace: userPhoto
  };

  const data2 = {
    original: base64Data2,
    userFace: userPhoto
  };

  const data3 = {
    original: base64Data3,
    userFace: userPhoto
  };

  const responses = await Promise.all([
    axios.post(url, data1),
    axios.post(url, data2),
    axios.post(url, data3)
  ]);

  return responses.map(response => response.data);
}

module.exports = {
  generateImage,
  saveImageLocally,
  getImageBase64,
  readFileAsBase64,
  getImageBase64WithoutBlur
}