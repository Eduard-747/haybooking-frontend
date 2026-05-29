const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx')) {
      callback(path.join(dir, f));
    }
  });
}

const folders = ['components', 'app'];
folders.forEach(f => walkDir(f, file => {
  let content = fs.readFileSync(file, 'utf8');

  let updated = false;

  // More robust regex: look for h-\d+ w-\d+ div followed by Logo
  const regex = /<div\s+className="[^"]*h-\d+\s+w-\d+[^"]*"[^>]*>[\s\S]*?<\/div>\s*<Logo\s*\/>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '<Logo />');
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned up logo in ${file}`);
  }
}));
