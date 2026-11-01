const BOARD_WIDTH = 36;
const BOARD_HEIGHT = 13;
const PLAYER_Y = BOARD_HEIGHT - 2;
const MAX_BULLETS = 3;

export const createInvaderGame = (onExit) => {
  const game = document.createElement("div");
  game.className = "terminal-entry terminal-invader-game";
  game.dataset.invaderGame = "";
  game.tabIndex = 0;
  game.setAttribute("role", "application");
  game.setAttribute("aria-label", "ASCII Space Invaders game");

  const board = document.createElement("pre");
  board.className = "terminal-invader-board";
  const instructions = document.createElement("p");
  instructions.className = "terminal-invader-instructions";
  instructions.textContent = "A/D or arrows move  |  Space fires  |  Q quits";
  game.append(board, instructions);

  const invaders = Array.from({ length: 24 }, (_, index) => ({
    x: 3 + (index % 8) * 4,
    y: 1 + Math.floor(index / 8),
    alive: true,
  }));
  let playerX = Math.floor(BOARD_WIDTH / 2);
  const bullets = [];
  let direction = 1;
  let ticks = 0;
  let stopped = false;
  let timer;
  const cells = new Uint8Array(BOARD_WIDTH * BOARD_HEIGHT);

  const render = () => {
    cells.fill(32);
    for (const invader of invaders) {
      if (invader.alive) cells[invader.y * BOARD_WIDTH + invader.x] = 87;
    }
    for (const bullet of bullets)
      cells[bullet.y * BOARD_WIDTH + bullet.x] = 124;
    cells[PLAYER_Y * BOARD_WIDTH + playerX] = 65;

    const border = `+${"-".repeat(BOARD_WIDTH)}+`;
    let output = `SPACE INVADERS\n${border}\n`;
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      const offset = y * BOARD_WIDTH;
      let row = "|";
      for (let x = 0; x < BOARD_WIDTH; x += 1)
        row += String.fromCharCode(cells[offset + x]);
      output += `${row}|\n`;
    }
    board.textContent = `${output}${border}`;
  };

  const finish = (message) => {
    if (stopped) return;
    stopped = true;
    window.clearInterval(timer);
    document.removeEventListener("keydown", handleKeydown, true);
    instructions.textContent = `${message}  |  Q returns to the terminal`;
    game.removeAttribute("data-invader-game");
    game.tabIndex = -1;
    onExit();
  };

  const tick = () => {
    if (stopped) return;
    ticks += 1;
    let changed = false;
    for (let index = bullets.length - 1; index >= 0; index -= 1) {
      const bullet = bullets[index];
      bullet.y -= 1;
      changed = true;
      const hit = invaders.find(
        (invader) => invader.alive && invader.x === bullet.x && invader.y === bullet.y,
      );
      if (hit) {
        hit.alive = false;
        bullets.splice(index, 1);
      } else if (bullet.y < 0) {
        bullets.splice(index, 1);
      }
    }

    if (ticks % 4 === 0) {
      const activeInvaders = invaders.filter((invader) => invader.alive);
      changed = activeInvaders.length > 0 || changed;
      const leftEdge = Math.min(...activeInvaders.map((invader) => invader.x));
      const rightEdge = Math.max(...activeInvaders.map((invader) => invader.x));
      if (leftEdge + direction < 1 || rightEdge + direction >= BOARD_WIDTH - 1) {
        direction *= -1;
        for (const invader of activeInvaders) invader.y += 1;
      } else {
        for (const invader of activeInvaders) invader.x += direction;
      }
      if (activeInvaders.some((invader) => invader.y >= PLAYER_Y)) {
        render();
        finish("GAME OVER");
        return;
      }
    }

    if (changed) render();
    if (invaders.every((invader) => !invader.alive)) finish("ALL CLEAR");
  };

  const handleKeydown = (event) => {
    if (stopped) return;
    event.stopImmediatePropagation();
    const key = event.key.toLowerCase();
    if (key === "q" || event.code === "KeyQ" || key === "escape") {
      event.preventDefault();
      finish("GAME ENDED");
    } else if (key === "arrowleft" || key === "a") {
      event.preventDefault();
      playerX = Math.max(1, playerX - 1);
      render();
    } else if (key === "arrowright" || key === "d") {
      event.preventDefault();
      playerX = Math.min(BOARD_WIDTH - 2, playerX + 1);
      render();
    } else if (key === " ") {
      event.preventDefault();
      if (bullets.length < MAX_BULLETS) {
        bullets.push({ x: playerX, y: PLAYER_Y - 1 });
        render();
      }
    }
  };

  document.addEventListener("keydown", handleKeydown, true);
  timer = window.setInterval(tick, 160);

  render();
  return game;
};