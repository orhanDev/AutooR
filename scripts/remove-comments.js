const fs = require('fs');
const path = require('path');

function removeComments(content, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let result = content;
    
    if (ext === '.js' || ext === '.ts') {

        result = result.replace(/\/\/.*$/gm, '');
        
        result = result.replace(/\/\*[\s\S]*?\*\
    } else if (ext === '.css' || ext === '.scss') {
        
        result = result.replace(/\/\*[\s\S]*?\*\
    } else if (ext === '.html') {
        
        result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
            const cleaned = scriptContent
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\
            return match.replace(scriptContent, cleaned);
        });
        result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
            const cleaned = styleContent.replace(/\/\*[\s\S]*?\*\
            return match.replace(styleContent, cleaned);
        });
        
        result = result.replace(/<!--[\s\S]*?-->/g, '');
    } else if (ext === '.md' || ext === '.txt' || ext === '.toml' || ext === '.yml' || ext === '.yaml') {

        result = result.replace(/^\s*#\s+[A-Z].*$/gm, ''); 
    }

    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
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

function processDirectory(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build']) {
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                count += processDirectory(filePath, excludeDirs);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.js', '.ts', '.css', '.scss', '.html'].includes(ext)) {
                if (processFile(filePath)) {
                    count++;
                }
            }
        }
    }
    
    return count;
}

const projectRoot = path.join(__dirname, '..');
const importantDirs = [
    'routes',
    'public/js',
    'public/css',
    'middleware',
    'scripts'
];

console.log('Yorumlar temizleniyor...\n');

let totalCleaned = 0;

for (const dir of importantDirs) {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`\n${dir} Verzeichnis wird verarbeitet...`);
        totalCleaned += processDirectory(dirPath);
    }
}

const mainFiles = ['server.js'];
for (const file of mainFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
        if (processFile(filePath)) {
            totalCleaned++;
        }
    }
}

console.log(`\n✅ Toplam ${totalCleaned} dosya temizlendi.`);

