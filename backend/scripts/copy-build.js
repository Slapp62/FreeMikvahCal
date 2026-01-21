const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../../frontend/dist');
const destination = path.join(__dirname, '../public');

console.log('📦 Copying frontend build...');
console.log(`   Source: ${source}`);
console.log(`   Destination: ${destination}`);

try {
  // Remove destination directory if it exists
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
    console.log('✅ Cleaned destination directory');
  }

  // Copy all files from source to destination recursively
  fs.cpSync(source, destination, { recursive: true });
  console.log('✅ Frontend build copied to backend/public');
} catch (error) {
  console.error('❌ Error copying build files:', error.message);
  process.exit(1);
}
