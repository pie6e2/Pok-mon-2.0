// ======================================================
// ELEMENTOS
// ======================================================

const game = document.getElementById("game");
const player = document.getElementById("player");
const zombiesContainer = document.getElementById("zombies");
const bulletsContainer = document.getElementById("bullets");

const healthText = document.getElementById("health");
const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const waveText = document.getElementById("wave");

const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const finalWave = document.getElementById("finalWave");
const restartButton = document.getElementById("restart");

const pausaButton = document.getElementById("pausa");

// ======================================================
// JUGADOR
// ======================================================

let playerX = 0;
let playerY = 0;

const playerSpeed = 5;

let health = 100;
let score = 0;
let wave = 1;
let zombiesMuertos = 0;

// ======================================================
// RÉCORD
// ======================================================

let bestScore =
    Number(localStorage.getItem("zombieBest")) || 0;

bestText.textContent = bestScore;

// ======================================================
// CONTROLES
// ======================================================

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// ======================================================
// MOUSE
// ======================================================

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let shooting = false;

// ======================================================
// BALAS
// ======================================================

let bullets = [];

const bulletSpeed = 12;
const fireRate = 180;

let lastShot = 0;

// ======================================================
// ENEMIGOS
// ======================================================

let zombies = [];
let zombieSpawnTimer = 0;

let zombieSpeed = 1;

// ======================================================
// TIPOS DE ENEMIGOS
// ======================================================

const tiposEnemigos = [

    {
        nombre: "gengar",
        imagen: "assents/iconos de mi juego/gengar.gif",
        velocidad: 1.2,
        vida: 1,
        daño: 0.5,
        puntos: 10,
        tamaño: 70
    },

    {
        nombre: "Enemigo rápido",
        imagen: "assents/iconos de mi juego/aguita.gif",
        velocidad: 2.2,
        vida: 1,
        daño: 0.8,
        puntos: 20,
        tamaño: 60
    },

    {
        nombre: "Enemigo tanque",
        imagen: "assents/iconos de mi juego/bulbasur.gif",
        velocidad: 0.7,
        vida: 3,
        daño: 1,
        puntos: 30,
        tamaño: 100
    },

    {
        nombre: "Enemigo fuerte",
        imagen: "assents/iconos de mi juego/pinzas.gif",
        velocidad: 1,
        vida: 2,
        daño: 1,
        puntos: 25,
        tamaño: 85
    }

];

// ======================================================
// BOSS
// ======================================================

let boss = null;

const bossWaves = [5, 10, 15, 20, 25, 30];

let ultimoBoss = 0;

// ======================================================
// ESTADO
// ======================================================

let playing = true;
let pausado = false;

// ======================================================
// POSICIÓN INICIAL
// ======================================================

function colocarJugador() {

    playerX =
        game.clientWidth / 2 -
        player.offsetWidth / 2;

    playerY =
        game.clientHeight / 2 -
        player.offsetHeight / 2;

    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";
}

// ======================================================
// TECLADO
// ======================================================

document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    if (key === "w") keys.w = true;
    if (key === "a") keys.a = true;
    if (key === "s") keys.s = true;
    if (key === "d") keys.d = true;

    // PAUSA CON P
    if (key === "p") {

        pausado = !pausado;

        if (pausaButton) {

            pausaButton.textContent =
                pausado
                    ? "▶️ Reanudar"
                    : "⏸️ Pausar";
        }
    }
});

// ======================================================
// SOLTAR TECLAS
// ======================================================

document.addEventListener("keyup", function(event) {

    const key = event.key.toLowerCase();

    if (key === "w") keys.w = false;
    if (key === "a") keys.a = false;
    if (key === "s") keys.s = false;
    if (key === "d") keys.d = false;
});

// ======================================================
// MOUSE
// ======================================================

game.addEventListener("mousemove", function(event) {

    const rect =
        game.getBoundingClientRect();

    mouseX =
        event.clientX - rect.left;

    mouseY =
        event.clientY - rect.top;
});

// ======================================================
// DISPARAR
// ======================================================

game.addEventListener("mousedown", function(event) {

    if (event.button === 0) {

        shooting = true;
        shoot();
    }
});

game.addEventListener("mouseup", function(event) {

    if (event.button === 0) {

        shooting = false;
    }
});

document.addEventListener("mouseup", function() {

    shooting = false;
});

// ======================================================
// BOTÓN PAUSA
// ======================================================

if (pausaButton) {

    pausaButton.addEventListener("click", function() {

        pausado = !pausado;

        this.textContent =
            pausado
                ? "▶️ Reanudar"
                : "⏸️ Pausar";
    });
}

// ======================================================
// CAMBIAR FONDO
// ======================================================

function cambiarFondo() {

    game.classList.remove(
        "fondo2",
        "fondo3",
        "fondo4",
        "fondo5",
        "fondo6",
        "fondo7",
        "fondo8"
    );

    if (zombiesMuertos >= 20) {

        game.classList.add("fondo3");

    } else if (zombiesMuertos >= 10) {

        game.classList.add("fondo2");
    }
}

// ======================================================
// MOVER JUGADOR
// ======================================================

function movePlayer() {

    if (keys.w) playerY -= playerSpeed;
    if (keys.s) playerY += playerSpeed;
    if (keys.a) playerX -= playerSpeed;
    if (keys.d) playerX += playerSpeed;

    const width =
        game.clientWidth;

    const height =
        game.clientHeight;

    const playerWidth =
        player.offsetWidth;

    const playerHeight =
        player.offsetHeight;

    if (playerX < 0)
        playerX = 0;

    if (playerY < 0)
        playerY = 0;

    if (playerX > width - playerWidth)
        playerX = width - playerWidth;

    if (playerY > height - playerHeight)
        playerY = height - playerHeight;

    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";
}

// ======================================================
// APUNTAR
// ======================================================

function aimPlayer() {

    const centerX =
        playerX +
        player.offsetWidth / 2;

    const centerY =
        playerY +
        player.offsetHeight / 2;

    const angle =
        Math.atan2(
            mouseY - centerY,
            mouseX - centerX
        );

    player.style.transform =
        `rotate(${angle}rad)`;
}

// ======================================================
// DISPARAR
// ======================================================

function shoot() {

    const now =
        performance.now();

    if (now - lastShot < fireRate)
        return;

    lastShot = now;

    const centerX =
        playerX +
        player.offsetWidth / 2;

    const centerY =
        playerY +
        player.offsetHeight / 2;

    const dx =
        mouseX - centerX;

    const dy =
        mouseY - centerY;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance === 0)
        return;

    const directionX =
        dx / distance;

    const directionY =
        dy / distance;

    const bullet =
        document.createElement("div");

    bullet.classList.add("bullet");

    bullet.style.left =
        centerX + "px";

    bullet.style.top =
        centerY + "px";

    bulletsContainer.appendChild(
        bullet
    );

    bullets.push({

        element: bullet,

        x: centerX,
        y: centerY,

        dx: directionX,
        dy: directionY
    });
}

// ======================================================
// MOVER BALAS
// ======================================================

function updateBullets() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.x +=
            bullet.dx *
            bulletSpeed;

        bullet.y +=
            bullet.dy *
            bulletSpeed;

        bullet.element.style.left =
            bullet.x + "px";

        bullet.element.style.top =
            bullet.y + "px";

        // FUERA DEL MAPA
        if (

            bullet.x < -30 ||
            bullet.x >
                game.clientWidth + 30 ||
            bullet.y < -30 ||
            bullet.y >
                game.clientHeight + 30

        ) {

            bullet.element.remove();

            bullets.splice(i, 1);

            continue;
        }

        // ==================================================
        // GOLPEAR BOSS
        // ==================================================

        if (boss) {

            if (
                collision(
                    bullet.element,
                    boss.element
                )
            ) {

                boss.hp -= 20;

                updateBossHealth();

                bullet.element.remove();

                bullets.splice(i, 1);

                if (boss.hp <= 0) {

                    boss.element.remove();

                    boss = null;

                    score += 500;

                    scoreText.textContent =
                        score;

                    updateWaves();
                }

                continue;
            }
        }

        // ==================================================
        // GOLPEAR ENEMIGOS
        // ==================================================

        for (
            let j = zombies.length - 1;
            j >= 0;
            j--
        ) {

            const zombie =
                zombies[j];

            if (
                collision(
                    bullet.element,
                    zombie.element
                )
            ) {

                zombie.vida--;

                bullet.element.remove();

                bullets.splice(i, 1);

                // ENEMIGO MUERE
                if (zombie.vida <= 0) {

                    zombie.element.remove();

                    zombies.splice(j, 1);

                    score +=
                        zombie.puntos;

                    zombiesMuertos++;

                    scoreText.textContent =
                        score;

                    cambiarFondo();

                    updateWaves();
                }

                break;
            }
        }
    }
}

// ======================================================
// ELEGIR ENEMIGO
// ======================================================

function elegirEnemigo() {

    let cantidadTipos;

    if (wave < 3) {

        cantidadTipos = 1;

    } else if (wave < 6) {

        cantidadTipos = 2;

    } else if (wave < 10) {

        cantidadTipos = 3;

    } else {

        cantidadTipos =
            tiposEnemigos.length;
    }

    return tiposEnemigos[
        Math.floor(
            Math.random() *
            cantidadTipos
        )
    ];
}

// ======================================================
// CREAR ENEMIGO
// ======================================================

function spawnZombie() {

    const tipo =
        elegirEnemigo();

    const zombieElement =
        document.createElement("div");

    zombieElement.classList.add(
        "zombie"
    );

    zombieElement.style.width =
        tipo.tamaño + "px";

    zombieElement.style.height =
        tipo.tamaño + "px";

    const img =
        document.createElement("img");

    img.src =
        tipo.imagen;

    img.alt =
        tipo.nombre;

    zombieElement.appendChild(img);

    let x;
    let y;

    const side =
        Math.floor(
            Math.random() * 4
        );

    if (side === 0) {

        x =
            Math.random() *
            game.clientWidth;

        y = -100;

    } else if (side === 1) {

        x =
            game.clientWidth + 100;

        y =
            Math.random() *
            game.clientHeight;

    } else if (side === 2) {

        x =
            Math.random() *
            game.clientWidth;

        y =
            game.clientHeight + 100;

    } else {

        x = -100;

        y =
            Math.random() *
            game.clientHeight;
    }

    zombieElement.style.left =
        x + "px";

    zombieElement.style.top =
        y + "px";

    zombiesContainer.appendChild(
        zombieElement
    );

    zombies.push({

        element: zombieElement,

        x: x,
        y: y,

        velocidad:
            tipo.velocidad *
            (1 + (wave - 1) * 0.05),

        vida: tipo.vida,

        daño: tipo.daño,

        puntos: tipo.puntos
    });
}

// ======================================================
// MOVER ENEMIGOS
// ======================================================

function updateZombies() {

    for (
        let i = zombies.length - 1;
        i >= 0;
        i--
    ) {

        const zombie =
            zombies[i];

        const playerCenterX =
            playerX +
            player.offsetWidth / 2;

        const playerCenterY =
            playerY +
            player.offsetHeight / 2;

        const zombieCenterX =
            zombie.x +
            zombie.element.offsetWidth / 2;

        const zombieCenterY =
            zombie.y +
            zombie.element.offsetHeight / 2;

        const dx =
            playerCenterX -
            zombieCenterX;

        const dy =
            playerCenterY -
            zombieCenterY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        // MOVER
        if (distance > 30) {

            zombie.x +=
                (dx / distance) *
                zombie.velocidad;

            zombie.y +=
                (dy / distance) *
                zombie.velocidad;
        }

        zombie.element.style.left =
            zombie.x + "px";

        zombie.element.style.top =
            zombie.y + "px";

        // ==================================================
        // ATAQUE
        // ==================================================

        const distanciaGolpe = 55;

        if (
            distance <
            distanciaGolpe
        ) {

            health -=
                zombie.daño;

            healthText.textContent =
                Math.max(
                    0,
                    Math.floor(health)
                );

            // Retroceso pequeño
            zombie.x -=
                (dx / Math.max(distance, 1)) *
                0.5;

            zombie.y -=
                (dy / Math.max(distance, 1)) *
                0.5;

            if (health <= 0) {

                endGame();

                return;
            }
        }
    }
}

// ======================================================
// CREAR BOSS
// ======================================================

function spawnBoss() {

    if (boss)
        return;

    if (ultimoBoss === wave)
        return;

    ultimoBoss = wave;

    const bossElement =
        document.createElement("div");

    bossElement.classList.add(
        "boss"
    );

    // GIF DEL BOSS
    const img =
        document.createElement("img");

    img.src =
        "assents/iconos de mi juego/blaze.gif";

    img.alt =
        "Boss";

    bossElement.appendChild(img);

    // ==================================================
    // BARRA DE VIDA
    // ==================================================

    const healthBar =
        document.createElement("div");

    healthBar.classList.add(
        "bossHealthBar"
    );

    const healthFill =
        document.createElement("div");

    healthFill.classList.add(
        "bossHealthFill"
    );

    healthBar.appendChild(
        healthFill
    );

    bossElement.appendChild(
        healthBar
    );

    // ==================================================
    // NOMBRE
    // ==================================================

    const bossName =
        document.createElement("div");

    bossName.classList.add(
        "bossName"
    );

    bossName.textContent =
        "👹 BOSS";

    bossElement.appendChild(
        bossName
    );

    // ==================================================
    // VIDA
    // ==================================================

    const bossMaxHP =
        500 +
        ((wave - 5) / 5) *
        250;

    boss = {

        element: bossElement,

        hp: bossMaxHP,

        maxHp: bossMaxHP,

        healthFill: healthFill,

        x:
            game.clientWidth / 2 -
            85,

        y: -200
    };

    bossElement.style.left =
        boss.x + "px";

    bossElement.style.top =
        boss.y + "px";

    game.appendChild(
        bossElement
    );

    updateBossHealth();
}

// ======================================================
// VIDA DEL BOSS
// ======================================================

function updateBossHealth() {

    if (!boss)
        return;

    const percentage =
        (boss.hp /
            boss.maxHp) *
        100;

    boss.healthFill.style.width =
        Math.max(
            0,
            percentage
        ) + "%";
}

// ======================================================
// MOVER BOSS
// ======================================================

function updateBoss() {

    if (!boss)
        return;

    const playerCenterX =
        playerX +
        player.offsetWidth / 2;

    const playerCenterY =
        playerY +
        player.offsetHeight / 2;

    const bossCenterX =
        boss.x + 85;

    const bossCenterY =
        boss.y + 85;

    const dx =
        playerCenterX -
        bossCenterX;

    const dy =
        playerCenterY -
        bossCenterY;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance > 90) {

        boss.x +=
            (dx / distance) *
            0.7;

        boss.y +=
            (dy / distance) *
            0.7;
    }

    boss.element.style.left =
        boss.x + "px";

    boss.element.style.top =
        boss.y + "px";
}

// ======================================================
// COLISIÓN
// ======================================================

function collision(
    element1,
    element2
) {

    const rect1 =
        element1.getBoundingClientRect();

    const rect2 =
        element2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// ======================================================
// OLEADAS
// ======================================================

function updateWaves() {

    const newWave =
        Math.floor(
            score / 100
        ) + 1;

    if (newWave > wave) {

        wave = newWave;

        waveText.textContent =
            wave;

        zombieSpeed =
            1 +
            wave * 0.15;

        // BOSS
        if (
            bossWaves.includes(wave)
        ) {

            spawnBoss();
        }
    }
}

// ======================================================
// SISTEMA DE APARICIÓN
// ======================================================

function spawnSystem() {

    zombieSpawnTimer++;

    let spawnTime =
        Math.max(
            25,
            70 - wave * 4
        );

    // Si hay boss,
    // aparecen un poco más lento
    if (boss) {

        spawnTime += 20;
    }

    if (
        zombieSpawnTimer >=
        spawnTime
    ) {

        zombieSpawnTimer = 0;

        spawnZombie();

        if (wave >= 3) {

            spawnZombie();
        }

        if (wave >= 8) {

            spawnZombie();
        }
    }
}

// ======================================================
// GAME OVER
// ======================================================

function endGame() {

    if (!playing)
        return;

    playing = false;

    shooting = false;

    finalScore.textContent =
        score;

    finalWave.textContent =
        wave;

    gameOverScreen.style.display =
        "flex";

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "zombieBest",
            bestScore
        );

        bestText.textContent =
            bestScore;
    }
}

// ======================================================
// REINICIAR
// ======================================================

restartButton.addEventListener(
    "click",
    function() {

        // Eliminar enemigos
        zombies.forEach(
            zombie =>
                zombie.element.remove()
        );

        zombies = [];

        // Eliminar balas
        bullets.forEach(
            bullet =>
                bullet.element.remove()
        );

        bullets = [];

        // Eliminar boss
        if (boss) {

            boss.element.remove();

            boss = null;
        }

        // Reiniciar valores
        health = 100;
        score = 0;
        wave = 1;

        zombiesMuertos = 0;

        zombieSpawnTimer = 0;

        ultimoBoss = 0;

        playing = true;
        pausado = false;
        shooting = false;

        healthText.textContent =
            "100";

        scoreText.textContent =
            "0";

        waveText.textContent =
            "1";

        gameOverScreen.style.display =
            "none";

        game.className = "";

        colocarJugador();
    }
);

// ======================================================
// BUCLE PRINCIPAL
// ======================================================

function gameLoop() {

    if (
        playing &&
        !pausado
    ) {

        movePlayer();

        aimPlayer();

        if (shooting) {

            shoot();
        }

        updateBullets();

        updateZombies();

        updateBoss();

        spawnSystem();
    }

    requestAnimationFrame(
        gameLoop
    );
}

// ======================================================
// INICIAR JUEGO
// ======================================================

window.addEventListener(
    "load",
    function() {

        colocarJugador();

        gameLoop();
    }
);

window.addEventListener(
    "resize",
    function() {

        if (playing) {

            movePlayer();
        }
    }
);