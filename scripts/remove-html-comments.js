const fs = require('fs');
const path = require('path');

function removeHtmlComments(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const original = content;

        content = content.replace(/<!--[\s\S]*?-->/g, '');

        content = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
            let cleaned = scriptContent
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\
            cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n');
            return match.replace(scriptContent, cleaned);
        });

        content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
            let cleaned = styleContent.replace(/\/\*[\s\S]*?\*\
            cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n');
            return match.replace(styleContent, cleaned);
        });

        content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Bereinigt: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ Fehler: ${filePath} - ${error.message}`);
        return false;
    }
}

const publicDir = path.join(__dirname, '..', 'public');
const htmlFiles = [];

function findHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findHtmlFiles(filePath);
        } else if (file.endsWith('.html')) {
            htmlFiles.push(filePath);
        }
    }
}

findHtmlFiles(publicDir);

console.log('Kommentare in HTML-Dateien werden bereinigt...\n');

let count = 0;
for (const file of htmlFiles) {
    if (removeHtmlComments(file)) {
        count++;
    }
}

console.log(`\n✅ Insgesamt ${count} HTML-Dateien bereinigt.`);