const dumpy = require("./index");
const fs = require("fs/promises");

async function test() {
    const buffer = await dumpy("https://cdn.discordapp.com/emojis/839575637051703296.png", {
        size: 16,
        speed: 10,
        resolution: 512
    });

    await fs.writeFile("dumpy.gif", buffer);
}

test();