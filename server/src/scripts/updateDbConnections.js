const fs = require('fs');
const path = require('path');

const newConnectionCode = `require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});`;

const filesToUpdate = [
    'checkAnalysisData.js',
    'checkCompanyUser.js',
    'checkSessionsData.js',
    'checkTableStructure.js',
    'createCompanyUser.js',
    'exportUsers.js',
    'updateSessionsTable.js'
];

filesToUpdate.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fixed regex - using a different pattern that's more reliable
        const poolPattern = /const\s+pool\s*=\s*new\s+Pool\s*\(\s*\{[\s\S]*?\}\s*\)\s*;/;
        content = content.replace(poolPattern, newConnectionCode);
        
        // Add dotenv import if it doesn't exist
        if (!content.includes("require('dotenv')")) {
            content = newConnectionCode + '\n\n' + content.split('\n').slice(1).join('\n');
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${filename}`);
    } catch (err) {
        console.error(`❌ Failed to update ${filename}:`, err.message);
    }
});

console.log('\nDatabase connection updates complete!'); 