const fs = require('fs');
const path = require('path');

const emojiMap = {
  '🔍': '<Icon name="search" />',
  '👥': '<Icon name="users" />',
  '📜': '<Icon name="certificate" />',
  '📝': '<Icon name="assessment" />',
  '📊': '<Icon name="reports" />',
  '⏳': '<Icon name="pending" />',
  '✅': '<Icon name="check" />',
  '🗑️': '<Icon name="trash" />',
  '👁️‍🗨️': '<Icon name="eyeOff" />',
  '👁️': '<Icon name="eye" />',
  '🚀': '<Icon name="rocket" />',
  '🏆': '<Icon name="trophy" />',
  '📅': '<Icon name="calendar" />',
  '✏️': '<Icon name="pencil" />',
  '✓': '<Icon name="checkSmall" />',
  '✗': '<Icon name="x" />',
  '⬇️': '<Icon name="down" />',
  '⬆️': '<Icon name="up" />',
  '↕️': '<Icon name="upDown" />',
  '⚠': '<Icon name="warning" />',
  '☀️': '<Icon name="sun" />',
  '🌙': '<Icon name="moon" />',
  '☰': '<Icon name="menu" />',
  '×': '<Icon name="close" />',
  '📄': '<Icon name="file" />'
};

const regex = new RegExp(Object.keys(emojiMap).join('|'), 'g');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Before replacing, check if we need to add the import statement
      if (regex.test(content)) {
         if (!content.includes('import Icon')) {
            // find the last import and add this below it
            const lines = content.split('\n');
            let lastImport = -1;
            for(let i = 0; i < lines.length; i++) {
               if (lines[i].startsWith('import ')) {
                  lastImport = i;
               }
            }
            if (lastImport !== -1) {
               // Calculate relative path for Icon.jsx
               const relPath = path.relative(path.dirname(fullPath), path.join(process.cwd(), 'src', 'components', 'Icon'));
               let importPath = relPath.replace(/\\/g, '/');
               if (!importPath.startsWith('.')) importPath = './' + importPath;
               
               lines.splice(lastImport + 1, 0, `import Icon from "${importPath}";`);
               content = lines.join('\n');
            }
         }
         
         // Replace emojis
         content = content.replace(regex, match => emojiMap[match]);
         
         // Fix cases where the replacement creates invalid JSX, e.g. title="<Icon ... />"
         content = content.replace(/title="<Icon.*?\/>"/g, 'title=""');
         content = content.replace(/aria-label="<Icon.*?\/>"/g, 'aria-label=""');
         content = content.replace(/placeholder="<Icon.*?\/>(.*?)"/g, 'placeholder="$1"');
         
         fs.writeFileSync(fullPath, content, 'utf8');
         console.log('Processed', fullPath);
      }
    }
  });
}
walk('./src');
