// スマホとPC両対応：ブロックが落ちない不具合修正＋描画スケーリングを draw 内に統合

const container = document.createElement('div');
container.style.display = 'flex';
container.style.flexDirection = 'column';
container.style.alignItems = 'center';
container.style.padding = '1rem';
container.style.boxSizing = 'border-box';
document.body.style.margin = '0';
document.body.style.backgroundColor = '#000';
document.body.appendChild(container);

const canvas = document.createElement('canvas');
canvas.width = 240;
canvas.height = 400;
canvas.style.display = 'block';
canvas.style.width = '100%';
canvas.style.maxWidth = '600px';
canvas.style.aspectRatio = '3 / 5';
canvas.style.touchAction = 'none';
container.appendChild(canvas);

const context = canvas.getContext('2d');

function resizeCanvasSize() {
  const width = Math.min(window.innerWidth, 600);
  canvas.style.width = width + 'px';
  canvas.style.height = (width * 5 / 3) + 'px';
}
resizeCanvasSize();
window.addEventListener('resize', resizeCanvasSize);

const controls = document.createElement('div');
controls.style.marginTop = '1rem';
controls.style.display = 'grid';
controls.style.gridTemplateColumns = 'repeat(3, 1fr)';
controls.style.gridGap = '1rem';
controls.style.width = '100%';
controls.style.maxWidth = '400px';

controls.innerHTML = `
  <button id="rotateLeft">⤿</button>
  <button id="down">⬇️</button>
  <button id="rotateRight">⤾</button>
  <button id="left">◀️</button>
  <button style="visibility: hidden;"></button>
  <button id="right">▶️</button>
`;

Array.from(controls.querySelectorAll('button')).forEach(btn => {
  btn.style.fontSize = '6vw';
  btn.style.padding = '1.5rem';
  btn.style.borderRadius = '12px';
  btn.style.border = 'none';
  btn.style.background = '#444';
  btn.style.color = '#fff';
  btn.style.width = '100%';
});

container.appendChild(controls);

document.getElementById('left').onclick = () => playerMove(-1);
document.getElementById('right').onclick = () => playerMove(1);
document.getElementById('down').onclick = () => playerDrop();
document.getElementById('rotateLeft').onclick = () => playerRotateWrapper(-1);
document.getElementById('rotate
