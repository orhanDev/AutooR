const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');
const version = timestamp.substring(0, 12);

const indexHtmlPath = path.join(__dirname, '../public/index.html');

let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

htmlContent = htmlContent.replace(
    /(href|src)=["']([^"']*\.(css|js))(\?v=[\d]+)?["']/g,
    (match, attr, file, ext, oldVersion) => {
        if (file.startsWith('http')) {
            return match;
        }
        return `${attr}="${file}?v=${version}"`;
    }
);

fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');

console.log(`Cache version updated to: ${version}`);

