const fs = require('fs');
const path = require('path');

function removeComments(content, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let result = content;
    
    if (ext === '.js' || ext === '.ts' || ext === '.jsx' || ext === '.tsx') {
        result = result.replace(/\/\/.*$/gm, '');
        result = result.replace(/\/\*[\s\S]*?\*\
    } else if (ext === '.css' || ext === '.scss' || ext === '.sass') {
        result = result.replace(/\/\*[\s\S]*?\*\
        result = result.replace(/\/\/.*$/gm, '');
    } else if (ext === '.html') {
        result = result.replace(/<!--[\s\S]*?-->/g, '');
        result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
            let cleaned = scriptContent
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\
            return match.replace(scriptContent, cleaned);
        });
        result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
            let cleaned = styleContent.replace(/\/\*[\s\S]*?\*\
            return match.replace(styleContent, cleaned);
        });
    } else if (ext === '.toml' || ext === '.yml' || ext === '.yaml' || ext === '.txt' || ext === '.md' || ext === '.env' || ext === '' || filePath.endsWith('.gitignore') || filePath.endsWith('env-example.txt')) {
        result = result.replace(/^\s*#.*$/gm, '');
    }

    result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return result;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const cleaned = removeComments(content, filePath);
        if (content !== cleaned) {
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

function processDirectory(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage']) {
    if (!fs.existsSync(dir)) {
        return 0;
    }
    
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        
        if (file.startsWith('.') && file !== '.gitignore') {
            continue;
        }
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                count += processDirectory(filePath, excludeDirs);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            const fileName = path.basename(file);
            
            if (['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.sass', '.html', '.toml', '.yml', '.yaml', '.txt', '.md'].includes(ext) ||
                fileName === '.gitignore' ||
                fileName.endsWith('.env') ||
                fileName === 'env-example.txt') {
                if (processFile(filePath)) {
                    count++;
                }
            }
        }
    }
    
    return count;
}

const projectRoot = path.join(__dirname, '..');

console.log('Tüm yorumlar temizleniyor...\n');

let totalCleaned = 0;

totalCleaned += processDirectory(projectRoot);

console.log(`\n✅ Toplam ${totalCleaned} dosya temizlendi.`);

