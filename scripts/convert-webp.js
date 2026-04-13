const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, '../public/assets');

fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputPath = path.join(dir, file);
            const outputPath = path.join(dir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

            sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath)
                .then(info => {
                    console.log(`Converted ${file} to WebP: ${info.size} bytes`);
                })
                .catch(err => {
                    console.error(`Error converting ${file}:`, err);
                });
        }
    });
});
