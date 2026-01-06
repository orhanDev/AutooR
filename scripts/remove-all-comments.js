const fs = require('fs');
const path = require('path');

function removeComments(content, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let result = content;
    
    if (ext === '.js' || ext === '.ts') {
        
        result = result.replace(/`([\s\S]*?)`/g, (match, templateContent) => {
            let cleaned = templateContent.replace(
            return '`' + cleaned + '`';
        });

        result = result.replace(/(['"])([\s\S]*?)\1/g, (match, quote, stringContent) => {
            if (stringContent.includes('<!--')) {
                let cleaned = stringContent.replace(
                return quote + cleaned + quote;
            }
            return match;
        });

        result = result.replace(/\/\/.*$/gm, '');

        result = result.replace(/\/\*[\s\S]*?\*\
    } else if (ext === '.css' || ext === '.scss') {
        
        result = result.replace(/\/\*[\s\S]*?\*\
    } else if (ext === '.html') {
        
        result = result.replace(

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
    } else if (ext === '.svg') {
        
        result = result.replace(
    }

    result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');

    result = result.trim();
    
    return result;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const cleaned = removeComments(content, filePath);
        if (content !== cleaned) {
            fs.writeFileSync(filePath, cleaned, 'utf8');
            console.log(`✓ ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ ${filePath} - ${error.message}`);
        return false;
    }
}

function processDirectory(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build', 'frontend']) {
    if (!fs.existsSync(dir)) {
        return 0;
    }
    
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
            if (['.js', '.ts', '.css', '.scss', '.html', '.svg'].includes(ext)) {
                if (processFile(filePath)) {
                    count++;
                }
            }
        }
    }
    
    return count;
}

const projectRoot = path.join(__dirname, '..');

console.log('Tüm yorum satırları kaldırılıyor...\n');

let totalCleaned = 0;

const routesPath = path.join(projectRoot, 'routes');
if (fs.existsSync(routesPath)) {
    console.log('\n=== routes/ ===');
    totalCleaned += processDirectory(routesPath);
}

const publicPath = path.join(projectRoot, 'public');
if (fs.existsSync(publicPath)) {
    console.log('\n=== public/ ===');
    totalCleaned += processDirectory(publicPath);
}

const scriptsPath = path.join(projectRoot, 'scripts');
if (fs.existsSync(scriptsPath)) {
    console.log('\n=== scripts/ ===');
    totalCleaned += processDirectory(scriptsPath);
}

const middlewarePath = path.join(projectRoot, 'middleware');
if (fs.existsSync(middlewarePath)) {
    console.log('\n=== middleware/ ===');
    totalCleaned += processDirectory(middlewarePath);
}

const viewsPath = path.join(projectRoot, 'views');
if (fs.existsSync(viewsPath)) {
    console.log('\n=== views/ ===');
    totalCleaned += processDirectory(viewsPath);
}

const mainFiles = ['server.js'];
for (const file of mainFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
        console.log(`\n=== ${file} ===`);
        if (processFile(filePath)) {
            totalCleaned++;
        }
    }
}

console.log(`\n✅ Toplam ${totalCleaned} dosya temizlendi.`);