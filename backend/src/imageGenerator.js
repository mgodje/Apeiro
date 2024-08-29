const axios = require("axios").default;
const fs = require("fs");
const path = require("path");

const imagesDir = path.resolve(__dirname, "static", "css", "images", "scenes");
async function createImage(prompt, number) {
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=2048&height=1152&model=flux&nologo=true&private=true`
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const filePath = path.join(imagesDir, `downloaded_image_${number}.jpg`);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

}

module.exports = {
  createImage
}
