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
            
            // # ile başlayan satırları kontrol et
            if (trimmed.startsWith('#')) {
                // Eğer bu bir kategori başlığı değilse (ör: # Dependencies, # Environment variables)
                // ve açık bir yorum satırıysa, atla
                if (trimmed.length > 1 && !trimmed.match(/^#\s*[A-Z][a-z]+/)) {
                    // Yorum satırı, atla
                    continue;
                }
            }
            
            cleanedLines.push(line);
        }
        
        let cleaned = cleanedLines.join('\n');
        cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
        
        if (cleaned !== original) {
            fs.writeFileSync(filePath, cleaned, 'utf8');
            console.log(`✓ Temizlendi: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ Hata: ${filePath} - ${error.message}`);
        return false;
    }
}

const configFiles = [
    'netlify.toml',
    'env-example.txt',
    '.gitignore'
];

console.log('Config dosyalarındaki yorumlar temizleniyor...\n');

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

console.log(`\n✅ Toplam ${count} config dosyası temizlendi.`);

