const fs = require('fs');
const path = require('path');

function removeConfigComments(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const original = content;
        const lines = content.split('\n');
        const cleanedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed.startsWith('#')) {

                if (trimmed.length > 1 && !trimmed.match(/^#\s*[A-Z][a-z]+/)) {
                    
                    continue;
                }
            }
            
            cleanedLines.push(line);
        }
        
        let cleaned = cleanedLines.join('\n');
        cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
        
        if (cleaned !== original) {
            fs.writeFileSync(filePath, cleaned, 'utf8');
            console.log(`✓ Bereinigt: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ Fehler: ${filePath} - ${error.message}`);
        return false;
    }
}

const configFiles = [
    'netlify.toml',
    'env-example.txt',
    '.gitignore'
];

console.log('Kommentare in Config-Dateien werden bereinigt...\n');

const projectRoot = path.join(__dirname, '..');
let count = 0;

for (const file of configFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
        if (removeConfigComments(filePath)) {
            count++;
        }
    }
}

console.log(`\n✅ Insgesamt ${count} Config-Dateien bereinigt.`);