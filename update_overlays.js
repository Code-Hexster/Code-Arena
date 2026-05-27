const fs = require('fs');
const path = require('path');

const files = [
  'the-perfect-square.html',
  'the-magic-circle.html',
  'the-potion-pill.html',
  'the-golden-ring.html',
  'the-dragons-eye.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'public/levels', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace success overlay
  const newOverlay = `<div id="success-overlay" class="overlay">
  <h2>Spell Conjured!</h2>
  <p>Your magic takes perfect shape.</p>
  <button style="margin-top: 25px;" class="btn btn-check" onclick="window.parent.postMessage({ type: 'next-level' }, '*')">Return to Map</button>
</div>`;

  content = content.replace(/<div id="success-overlay" class="overlay">[\s\S]*?<\/div>/, newOverlay);

  // Replace fireConfetti script
  const newConfetti = `function fireConfetti(){
  const colors = ['#F4D068', '#fde047', '#34d399', '#8b5cf6'];
  for(let i=0; i<60; i++){
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = (40 + Math.random() * 20) + 'vw';
    s.style.top = (60 + Math.random() * 20) + 'vh';
    s.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    s.style.animationDuration = (1 + Math.random() * 2) + 's';
    s.style.animationDelay = (Math.random() * 0.5) + 's';
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 3500);
  }
}`;

  content = content.replace(/function fireConfetti\(\)\{[\s\S]*?\}\s*</, newConfetti + '\n<');

  fs.writeFileSync(filePath, content);
  console.log('Updated overlay and sparks in ' + file);
});

// Update magical-level.css
const cssPath = path.join(__dirname, 'public/levels/magical-level.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Replace confetti css with spark css
const newSparkCss = `/* Sparks */
.spark {
  position: absolute; width: 5px; height: 5px; border-radius: 50%;
  background-color: var(--accent-color); animation: floatUp linear forwards;
  box-shadow: 0 0 15px 3px var(--accent-color);
}
@keyframes floatUp {
  0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(-400px) scale(0) rotate(360deg); opacity: 0; }
}`;

cssContent = cssContent.replace(/\/\* Confetti \*\/[\s\S]*?$/, newSparkCss);

fs.writeFileSync(cssPath, cssContent);
console.log('Updated magical-level.css');

