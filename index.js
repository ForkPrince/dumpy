const { createCanvas, loadImage, Image } = require("canvas");
const Encoder = require("gif-encoder-2");

const shading = require("./shading.json");
const data = require("./data.json");

data.forEach(layer => {
  layer.reverse();
  layer.base = layer.pop();
  layer.mask = layer.pop();
});

shading.forEach((layer, index) => {
  for (let i = 0; i < layer; i++) {
    const str = new String(data[index][i]);
    str.shading = true;
    data[index].push(str);
  }
});

function path(d, color) {
  if (d.shading) color = color.map(int => Math.round(int / 1.5));
  return `<path fill="rgb(${color.join(',')})" d="${d}"/>`;
}

function buildLayerSVG(layer, color) {
  const basePath = path(layer.base, [0, 0, 0]);
  const maskPath = path(layer.mask, [149, 201, 218]);
  const layerPaths = layer.map(d => path(d, color)).join('');

  return `data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 128 128" width="128" height="128" xmlns="http://www.w3.org/2000/svg">${basePath}${maskPath}${layerPaths}</svg>`;
}

function loopIndex(arr, num) {
  return (num + arr.length) % arr.length;
}

async function getImageData(image, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  try {
    const img = await loadImage(image);
    ctx.drawImage(img, 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size).data;
  } catch (error) {
    console.error("Error loading image:", error);
    throw error;
  }
}

module.exports = async (image, { size = 10, resolution = 1080, speed = 10 } = {}) => {
  const imgSize = resolution / size;

  try {
    const pixels = await getImageData(image, size);
    const pixelLength = pixels.length;
    const gif = new Encoder(resolution, resolution);

    gif.setTransparent(0);
    gif.setDelay(speed);
    gif.start();

    const canvas = createCanvas(resolution, resolution);
    const ctx = canvas.getContext('2d');

    async function generateFrame(frame) {
      const promises = [];
      let x = 0;
      let y = 0;

      for (let i = 0; i < pixelLength; i += 4) {
        const [r, g, b, a] = pixels.slice(i, i + 4);

        if (a > 125) {
          const img = new Image();
          const promise = new Promise(resolve => {
            img.onload = () => {
              resolve();
              ctx.drawImage(img, x * imgSize, y * imgSize, imgSize * 2, imgSize * 2);
            };
          });

          promises.push(promise);

          const offset = i / 4 % data.length;
          const svg = buildLayerSVG(data[loopIndex(data, offset + frame)], [r, g, b]);
          img.src = svg;
        }

        x++;
        if (x === size) {
          x = 0;
          y++;
        }
      }

      await Promise.all(promises);
      return ctx;
    }

    for (let f = 0; f < data.length; f++) {
      const frame = await generateFrame(f);
      gif.addFrame(frame);
      ctx.clearRect(0, 0, resolution, resolution);
    }

    gif.finish();
    return gif.out.getData();
  } catch (error) {
    console.error("Error generating GIF:", error);
    throw error;
  }
};