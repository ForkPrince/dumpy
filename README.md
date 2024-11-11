# Among Us: Dumpy (GIF)

A simple GIF generator to create animated "Dumpy Among Us" GIFs, forked from [Commandtechno/dumpy](https://github.com/Commandtechno/dumpy).

## Installation

```bash
npm install @forkprince/dumpy
```

## Usage

```js
const dumpy = require("@forkprince/dumpy");
const fs = require("fs/promises");

const buffer = await dumpy("https://cdn.discordapp.com/emojis/839575637051703296.png", {
    size: 16,
    speed: 10,
    resolution: 512
});

await fs.writeFile("dumpy.gif", buffer);
```

### Options

- **size** (Number)  
  The number of rows and columns in the animation grid. The higher the value, the larger the grid (Default: `10`).

- **speed** (Number)  
  Delay between frames in milliseconds. A lower value will create faster animations (Default: `10`).

- **resolution** (Number)  
  The output width and height of the GIF in pixels. A higher value results in better quality (Default: `1080`).