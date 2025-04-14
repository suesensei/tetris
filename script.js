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
document.getElementById('rotateRight').onclick = () => playerRotateWrapper(1);

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  } else if (type === 'X') {
    return [
      [8, 8, 8],
      [8, 0, 8],
      [8, 8, 8],
    ];
  }
}

const colors = [
  null,
  'purple',
  'yellow',
  'orange',
  'blue',
  'cyan',
  'green',
  'red',
  'pink',
];

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = bounds.width / 12;
  const scaleY = bounds.height / 20;
  context.setTransform(scaleX, 0, 0, scaleY, 0, 0);

  context.fillStyle = '#000';
  context.fillRect(0, 0, 12, 20);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOTSZX';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
}

function playerRotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotateWrapper(dir) {
  const pos = player.pos.x;
  let offset = 1;
  playerRotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      playerRotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'q') {
    playerRotateWrapper(-1);
  } else if (event.key === 'w') {
    playerRotateWrapper(1);
  }
});

const arena = createMatrix(12, 20);
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
};

playerReset();
update();
