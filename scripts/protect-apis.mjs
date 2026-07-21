import fs from 'fs';
import path from 'path';

const apiRoutesDir = path.join(process.cwd(), 'app/api/cms');

const moduleMap = {
  'amenities': 'Amenities',
  'customers': 'Customers',
  'developers': 'Developers',
  'media': 'Media',
  'payment-plans': 'PaymentPlans',
  'projects': 'Projects',
  'roles': 'Settings',
  'templates': 'Templates',
  'units': 'Units',
  'users': 'Users'
};

function processFile(filePath, moduleName) {
  let content = fs.readFileSync(filePath, 'utf-8');

  let changed = false;

  // Add imports if missing
  if (!content.includes("import { getCurrentUser } from '@/server/utils/auth'")) {
    content = `import { getCurrentUser } from '@/server/utils/auth'\n` + content;
    changed = true;
  }
  if (!content.includes("import { checkPermission, AccessLevel } from '@/server/utils/permissions'")) {
    content = `import { checkPermission, AccessLevel } from '@/server/utils/permissions'\n` + content;
    changed = true;
  }
  
  if (content.includes("import { NextResponse }") && !content.startsWith("import { NextResponse }")) {
    // try to move it up? Not necessary
  }

  // Regex to find export async function GET, POST, PUT, DELETE, PATCH
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  for (const method of methods) {
    const regex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{`, 'g');
    let match;
    let newContent = '';
    let lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      newContent += content.substring(lastIndex, match.index + match[0].length);
      const accessLevel = method === 'GET' ? 'AccessLevel.VIEW' : 'AccessLevel.EDIT';
      
      const checkCode = `\n  const user = await getCurrentUser()\n  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })\n  if (!checkPermission(user, '${moduleName}', ${accessLevel})) {\n    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })\n  }\n`;
      
      // If the code already contains a check, skip
      const checkNextStr = content.substring(match.index + match[0].length, match.index + match[0].length + 200);
      if (!checkNextStr.includes('getCurrentUser')) {
        newContent += checkCode;
        changed = true;
      }
      lastIndex = match.index + match[0].length;
    }
    newContent += content.substring(lastIndex);
    content = newContent;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir, moduleName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath, moduleName);
    } else if (file === 'route.ts') {
      processFile(fullPath, moduleName);
    }
  }
}

for (const [dirName, moduleName] of Object.entries(moduleMap)) {
  const fullDir = path.join(apiRoutesDir, dirName);
  if (fs.existsSync(fullDir)) {
    traverse(fullDir, moduleName);
  }
}
