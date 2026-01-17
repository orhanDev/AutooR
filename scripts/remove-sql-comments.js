const fs = require('fs');
const path = require('path');

function removeSQLComments(content) {
    let result = content;
    
    result = result.replace(/--.*$/gm, '');
    
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    
    result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    result = result.trim();
    
    return result;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const cleaned = removeSQLComments(content);
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

function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        return 0;
    }
    
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            count += processDirectory(filePath);
        } else if (file.endsWith('.sql')) {
            if (processFile(filePath)) {
                count++;
            }
        }
    }
    
    return count;
}

const projectRoot = path.join(__dirname, '..');

console.log('SQL-Dateikommentare werden entfernt...\n');

let totalCleaned = 0;

const dbPath = path.join(projectRoot, 'db');
if (fs.existsSync(dbPath)) {
    console.log('\n=== db/ ===');
    totalCleaned += processDirectory(dbPath);
}

const rootSQLFiles = fs.readdirSync(projectRoot).filter(f => f.endsWith('.sql'));
for (const file of rootSQLFiles) {
    const filePath = path.join(projectRoot, file);
    console.log(`\n=== ${file} ===`);
    if (processFile(filePath)) {
        totalCleaned++;
    }
}

console.log(`\n✅ Insgesamt ${totalCleaned} SQL-Dateien bereinigt.`);

