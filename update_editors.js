const fs = require('fs');
const path = require('path');

const levelData = {
  'the-perfect-square.html': {
    title: 'Perfect Square',
    instruction: `Replicate the <strong>Perfect Square</strong>. You will need <strong>width: 100px</strong>, <strong>height: 100px</strong>, and <strong>background-color: #3b82f6</strong>.`,
    htmlComment: `<!-- Step 1: Create a div element -->
<!-- Step 2: Give it an id of "user-shape" and class of "shape" -->`,
    checkMatchChecks: `
  if (user.width !== target.width) { match = false; reason = \`Width is incorrect. Target is \${target.width}.\`; }
  else if (user.height !== target.height) { match = false; reason = \`Height is incorrect. Target is \${target.height}.\`; }
  else if (user.backgroundColor !== target.backgroundColor) { match = false; reason = \`Background color is incorrect.\`; }
`
  },
  'the-magic-circle.html': {
    title: 'Magic Circle',
    instruction: `Replicate the <strong>Magic Circle</strong>. You will need <strong>width: 100px</strong>, <strong>height: 100px</strong>, <strong>background-color: #ef4444</strong>, and <strong>border-radius: 50%</strong>.`,
    htmlComment: `<!-- Step 1: Create a div element -->
<!-- Step 2: Give it an id of "user-shape" and class of "shape" -->`,
    checkMatchChecks: `
  if (user.width !== target.width) { match = false; reason = \`Width is incorrect. Target is \${target.width}.\`; }
  else if (user.height !== target.height) { match = false; reason = \`Height is incorrect. Target is \${target.height}.\`; }
  else if (user.backgroundColor !== target.backgroundColor) { match = false; reason = \`Background color is incorrect.\`; }
  else if (user.borderRadius !== target.borderRadius) { match = false; reason = \`Border radius is incorrect.\`; }
`
  },
  'the-potion-pill.html': {
    title: 'Potion Pill',
    instruction: `Replicate the <strong>Potion Pill</strong>. You will need <strong>width: 150px</strong>, <strong>height: 60px</strong>, <strong>background-color: #10b981</strong>, and <strong>border-radius: 999px</strong> (or 50px).`,
    htmlComment: `<!-- Step 1: Create a div element -->
<!-- Step 2: Give it an id of "user-shape" and class of "shape" -->`,
    checkMatchChecks: `
  if (user.width !== target.width) { match = false; reason = \`Width is incorrect. Target is \${target.width}.\`; }
  else if (user.height !== target.height) { match = false; reason = \`Height is incorrect. Target is \${target.height}.\`; }
  else if (user.backgroundColor !== target.backgroundColor) { match = false; reason = \`Background color is incorrect.\`; }
  else if (user.borderRadius === '0px') { match = false; reason = \`Border radius is incorrect.\`; }
`
  },
  'the-golden-ring.html': {
    title: 'Golden Ring',
    instruction: `Replicate the <strong>Golden Ring</strong>. You will need <strong>width: 100px</strong>, <strong>height: 100px</strong>, <strong>border: 15px solid #f59e0b</strong>, and <strong>border-radius: 50%</strong> (No background color needed).`,
    htmlComment: `<!-- Step 1: Create a div element -->
<!-- Step 2: Give it an id of "user-shape" and class of "shape" -->`,
    checkMatchChecks: `
  if (user.width !== target.width) { match = false; reason = \`Width is incorrect. Target is \${target.width}.\`; }
  else if (user.height !== target.height) { match = false; reason = \`Height is incorrect. Target is \${target.height}.\`; }
  else if (user.borderWidth !== target.borderWidth) { match = false; reason = \`Border width is incorrect.\`; }
  else if (user.borderRadius !== target.borderRadius) { match = false; reason = \`Border radius is incorrect.\`; }
`
  },
  'the-dragons-eye.html': {
    title: "Dragon's Eye",
    instruction: `Replicate the <strong>Dragon's Eye</strong>. You will need <strong>width: 100px</strong>, <strong>height: 100px</strong>, <strong>background-color: #eab308</strong>, and <strong>border-radius: 50% 0 50% 0</strong>.`,
    htmlComment: `<!-- Step 1: Create a div element -->
<!-- Step 2: Give it an id of "user-shape" and class of "shape" -->`,
    checkMatchChecks: `
  if (user.width !== target.width) { match = false; reason = \`Width is incorrect. Target is \${target.width}.\`; }
  else if (user.height !== target.height) { match = false; reason = \`Height is incorrect. Target is \${target.height}.\`; }
  else if (user.backgroundColor !== target.backgroundColor) { match = false; reason = \`Background color is incorrect.\`; }
  else if (user.borderRadius === '0px') { match = false; reason = \`Border radius is incorrect.\`; }
`
  }
};

for (const [file, data] of Object.entries(levelData)) {
  const filePath = path.join(__dirname, 'public/levels', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Canvas to have id="user-canvas"
  content = content.replace(
    /<div class="canvas">\s*<div id="user-shape" class="shape"><\/div>\s*<\/div>/,
    `<div class="canvas" id="user-canvas">\n      <div id="user-shape" class="shape"></div>\n    </div>`
  );

  // Replace instruction
  content = content.replace(
    /<div id="instruction">[\s\S]*?<\/div>/,
    `<div id="instruction">\n    <span class="icon">✨</span>\n    <p>${data.instruction}</p>\n  </div>`
  );

  // Add HTML editor
  const editorsHtml = `<div id="editors">
    <div class="editor-pane">
      <div class="pane-header">HTML</div>
      <textarea id="html-editor" spellcheck="false">${data.htmlComment}
<div id="user-shape" class="shape"></div>
</textarea>
    </div>
    <div class="editor-pane">
      <div class="pane-header">CSS</div>
      <textarea id="css-editor" spellcheck="false">/* Match the ${data.title}! */
.shape {
  
}
</textarea>
    </div>
  </div>`;
  content = content.replace(/<div id="editors">[\s\S]*?<\/div>\s*<\/div>/, editorsHtml);

  // Update Javascript Live Preview to include HTML
  const jsPreview = `// Live HTML Preview
document.getElementById('html-editor').addEventListener('input', (e) => {
  document.getElementById('user-canvas').innerHTML = e.target.value;
});

// Live CSS Preview`;
  content = content.replace('// Live CSS Preview', jsPreview);

  // Update checkMatch
  const newCheckMatch = `function checkMatch() {
  const target = getComputedStyle(document.getElementById('target-shape'));
  const userShape = document.getElementById('user-shape');
  const failReason = document.getElementById('fail-reason');
  
  if (!userShape) {
    failReason.textContent = "Cannot find an element with id='user-shape'. Make sure your HTML has id='user-shape'.";
    document.getElementById('fail-overlay').classList.add('show');
    return;
  }

  const user = getComputedStyle(userShape);
  
  let match = true;
  let reason = '';
${data.checkMatchChecks}
  if (match) {`;
  content = content.replace(/function checkMatch\(\) \{[\s\S]*?if \(match\) \{/, newCheckMatch);

  fs.writeFileSync(filePath, content);
  console.log('Updated editors in ' + file);
}

// Update CSS file for borders
const cssPath = path.join(__dirname, 'public/levels/magical-level.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.editor-pane:first-child')) {
  cssContent = cssContent.replace('.editor-pane {', '.editor-pane:first-child { border-right: 1px solid var(--border-color); }\n.editor-pane {');
  fs.writeFileSync(cssPath, cssContent);
}

