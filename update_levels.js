const fs = require('fs');
const path = require('path');

const cssContent = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');

:root {
  --bg-color: #010103;
  --panel-bg: #050508;
  --text-color: #94a3b8;
  --border-color: rgba(244, 208, 104, 0.15);
  --accent-color: #F4D068;
  --success-color: #34d399;
  --font-ui: "Cinzel", serif;
  --font-mono: "JetBrains Mono", monospace;
  --font-display: "Cinzel Decorative", serif;
}

* { box-sizing: border-box; }
body {
  margin: 0; padding: 0;
  background: var(--bg-color); color: var(--text-color);
  font-family: var(--font-ui);
  display: flex; flex-direction: column;
  height: 100vh; overflow: hidden;
}

/* Split View Area */
#view-area {
  display: flex;
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}
.view-pane {
  flex: 1;
  display: flex; flex-direction: column;
  border-right: 1px solid var(--border-color);
  position: relative;
}
.view-pane:last-child { border-right: none; }
.pane-title {
  position: absolute; top: 12px; left: 12px;
  background: rgba(1, 1, 3, 0.8); padding: 4px 10px;
  border: 1px solid rgba(244, 208, 104, 0.3);
  border-radius: 4px; font-size: 11px; font-weight: bold;
  text-transform: uppercase; letter-spacing: 2px; z-index: 10;
  color: var(--accent-color);
  box-shadow: 0 0 10px rgba(244, 208, 104, 0.1);
}

.canvas {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  background-image: 
    linear-gradient(45deg, #09090b 25%, transparent 25%), 
    linear-gradient(-45deg, #09090b 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #09090b 75%),
    linear-gradient(-45deg, transparent 75%, #09090b 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
}

/* Editor Area */
#editor-area {
  height: 280px;
  display: flex; flex-direction: column;
  background: #010103;
}
#instruction {
  padding: 12px 20px; background: rgba(244, 208, 104, 0.05);
  border-bottom: 1px solid var(--border-color);
  font-size: 14px; display: flex; align-items: center; gap: 12px;
  color: #e2e8f0; font-family: var(--font-ui);
  letter-spacing: 0.5px;
}
.icon { font-size: 20px; filter: drop-shadow(0 0 5px rgba(244,208,104,0.5)); }
#editors {
  flex: 1; display: flex;
}
.editor-pane {
  flex: 1; display: flex; flex-direction: column;
}
.pane-header {
  background: rgba(1, 1, 3, 0.8); font-size: 11px;
  padding: 6px 15px; font-family: var(--font-mono); color: var(--accent-color);
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase; letter-spacing: 2px;
}
textarea {
  flex: 1; background: #010103; color: #a78bfa;
  font-family: var(--font-mono); font-size: 14px;
  padding: 15px; border: none; resize: none; outline: none;
  line-height: 1.6;
}

/* Controls */
#controls {
  padding: 12px 20px; background: #050508;
  display: flex; gap: 12px; align-items: center;
  border-top: 1px solid var(--border-color);
}
.btn {
  padding: 8px 20px; border: none; border-radius: 4px;
  font-weight: bold; cursor: pointer; font-family: var(--font-ui);
  transition: all 0.2s; letter-spacing: 1px; text-transform: uppercase; font-size: 12px;
}
.btn:active { transform: scale(0.95); }
.btn-check { 
  background: rgba(244, 208, 104, 0.1); 
  color: var(--accent-color); 
  border: 1px solid var(--accent-color);
  box-shadow: 0 0 10px rgba(244, 208, 104, 0.1);
}
.btn-check:hover { 
  background: rgba(244, 208, 104, 0.2); 
  box-shadow: 0 0 15px rgba(244, 208, 104, 0.3); 
  color: #fff;
}
.btn-hint { 
  background: transparent; color: #94a3b8; border: 1px solid #475569; 
}
.btn-hint:hover { 
  background: rgba(255,255,255,0.05); color: white; border-color: #94a3b8;
}
#hint-text { 
  color: var(--accent-color); font-size: 13px; font-family: var(--font-mono); 
  display: none; background: rgba(244, 208, 104, 0.1); padding: 6px 12px; border-radius: 4px;
}

/* Overlays */
.overlay {
  position: absolute; inset: 0; background: rgba(1, 1, 3, 0.95);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.4s; z-index: 100;
  backdrop-filter: blur(5px);
}
.overlay.show { opacity: 1; pointer-events: auto; }
.overlay h2 { 
  font-size: 42px; margin: 0 0 15px 0; font-family: var(--font-display); 
  text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 20px currentColor;
}
.overlay p { font-size: 18px; margin: 0 0 30px 0; color: #cbd5e1; font-family: var(--font-ui); }
#success-overlay h2 { color: var(--accent-color); }
#fail-overlay h2 { color: #ef4444; }

/* Confetti */
.confetti {
  position: absolute; width: 8px; height: 16px;
  background-color: var(--accent-color); animation: fall linear forwards;
  box-shadow: 0 0 10px var(--accent-color);
  opacity: 0.8;
}
@keyframes fall {
  to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
`;

fs.writeFileSync(path.join(__dirname, 'public/levels/magical-level.css'), cssContent);

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

  // Extract the target shape CSS
  const targetShapeMatch = content.match(/#target-shape\s*{[^}]*}/);
  const targetShapeCss = targetShapeMatch ? targetShapeMatch[0] : '';

  // Replace the entire <style> block with link + target shape
  content = content.replace(/<style>[\s\S]*?<\/style>/, `<link rel="stylesheet" href="/levels/magical-level.css">
<style>
  /* Target Shape Styling (Hidden from user code) */
  ${targetShapeCss}
</style>`);

  // Update instruction icons and text if needed (e.g., emojis to something magical)
  content = content.replace('<span class="icon">🟦</span>', '<span class="icon">✨</span>');
  content = content.replace('<span class="icon">🔴</span>', '<span class="icon">✨</span>'); // Just in case
  
  // Replace button text "✓ Submit Match" with magical text
  content = content.replace('✓ Submit Match', 'Cast Spell');
  content = content.replace('💡 Hint', 'Consult Tome');

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
