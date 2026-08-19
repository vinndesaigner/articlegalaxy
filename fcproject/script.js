const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- OBJEK PEMAIN (USER) ---
const player = {
    x: 100,
    y: 250,
    radius: 15,
    color: 'blue',
    speed: 4
};

// --- OBJEK BOLA ---
const ball = {
    x: 400,
    y: 250,
    radius: 10,
    color: 'white',
    vx: 0, // Kecepatan X
    vy: 0, // Kecepatan Y
    friction: 0.98 // Gesekan rumput (biar bola makin lama makin pelan)
};

// --- KONTROL KEYBOARD ---
const keys = {};

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// --- LOGIKA UPDATE GAME (PHYSICS & MOVEMENT) ---
function update() {
    // 1. Gerakan Pemain (Panah Keyboard)
    if (keys['ArrowUp'] && player.y - player.radius > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y + player.radius < canvas.height) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x - player.radius > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x + player.radius < canvas.width) player.x += player.speed;

    // 2. Fisika Bola (Pergerakan & Gesekan)
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= ball.friction; // Pengurangan kecepatan otomatis
    ball.vy *= ball.friction;

    // 3. Deteksi Tabrakan Pemain vs Bola (Collision Detection)
    let dx = ball.x - player.x;
    let dy = ball.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Kalo jarak pemain & bola lebih kecil dari total radius mereka = TABRAKAN!
    if (distance < player.radius + ball.radius) {
        let angle = Math.atan2(dy, dx);
        let force = 6; // Kekuatan dorongan bola
        ball.vx = Math.cos(angle) * force;
        ball.vy = Math.sin(angle) * force;
    }

    // 4. Pantulan Bola ke Tembok Lapangan
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.vx *= -1;
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.vy *= -1;
}

// --- RENDER VISUAL KE LAYAR ---
function draw() {
    // Bersihin Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Garis Tengah Lapangan
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Gambar Pemain
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Gambar Bola
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// --- GAME LOOP ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Jalankan Game
gameLoop();