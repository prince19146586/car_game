/* ============================================
   SPEED SAGA - Professional Game Logic
   Advanced Car Physics & Game Mechanics
   ============================================ */
 
class GameState {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.distance = 0;
        this.level = 1;
        this.time = 0;
        this.health = 100;
        this.combo = 1;
        this.difficulty = 'normal';
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.graphicsQuality = 'medium';
    }
 
    reset() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.distance = 0;
        this.level = 1;
        this.time = 0;
        this.health = 100;
        this.combo = 1;
    }
}
 
class Car {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.velocity = 0;
        this.maxSpeed = 15;
        this.acceleration = 0.3;
        this.friction = 0.95;
        this.rotation = 0;
        this.rotationSpeed = 0.08;
        this.maxRotationSpeed = 0.15;
        this.color = '#ff006e';
        this.isInvincible = false;
        this.invincibilityTime = 0;
    }
 
    update(input, deltaTime) {
        // Acceleration
        if (input.accelerate) {
            this.velocity = Math.min(this.velocity + this.acceleration, this.maxSpeed);
        } else if (input.brake) {
            this.velocity = Math.max(this.velocity - 0.5, 0);
        } else {
            this.velocity *= this.friction;
        }
 
        // Steering
        if (input.left) {
            this.rotation = Math.max(this.rotation - this.rotationSpeed, -this.maxRotationSpeed);
        } else if (input.right) {
            this.rotation = Math.min(this.rotation + this.rotationSpeed, this.maxRotationSpeed);
        } else {
            this.rotation *= 0.9;
        }
 
        // Movement
        const radians = (this.rotation * Math.PI) / 180;
        this.x += Math.sin(radians) * this.velocity;
        this.y -= this.velocity;
 
        // Boundary checking
        const canvasWidth = 800;
        const padding = this.width / 2;
        this.x = Math.max(padding, Math.min(this.x, canvasWidth - padding));
 
        // Invincibility effect
        if (this.isInvincible) {
            this.invincibilityTime -= deltaTime;
            if (this.invincibilityTime <= 0) {
                this.isInvincible = false;
            }
        }
    }
 
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
 
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
 
        // Car glow effect
        if (!this.isInvincible) {
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width / 2 - 2, -this.height / 2 - 2, this.width + 4, this.height + 4);
        } else {
            // Invincibility glow
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.8)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(0, 255, 65, 0.8)';
            ctx.strokeRect(-this.width / 2 - 3, -this.height / 2 - 3, this.width + 6, this.height + 6);
        }
 
        // Windshield
        ctx.fillStyle = 'rgba(200, 200, 255, 0.4)';
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, this.width - 10, 15);
 
        // Headlights
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-this.width / 2 + 8, -this.height / 2, 6, 4);
        ctx.fillRect(this.width / 2 - 14, -this.height / 2, 6, 4);
 
        ctx.restore();
    }
 
    getCollisionBox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}
 
class Obstacle {
    constructor(x, y, type = 'car') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 60;
        this.velocity = 0;
        this.color = this.getColor();
        this.health = 100;
        this.flash = 0;
    }
 
    getColor() {
        const colors = ['#00d4ff', '#ff006e', '#ffbe0b', '#00ff41'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
 
    update(gameSpeed) {
        this.y += gameSpeed;
        if (this.flash > 0) this.flash--;
    }
 
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
 
        if (this.flash > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        } else {
            ctx.fillStyle = this.color;
        }
 
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
 
        // Obstacle glow
        ctx.strokeStyle = 'rgba(255, 0, 110, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2 - 2, -this.height / 2 - 2, this.width + 4, this.height + 4);
 
        ctx.restore();
    }
 
    getCollisionBox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}
 
class PowerUp {
    constructor(x, y, type = 'shield') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 25;
        this.rotation = 0;
        this.rotationSpeed = 5;
        this.color = this.getColor();
        this.pulse = 0;
        this.pulseSpeed = 0.1;
    }
 
    getColor() {
        const colors = {
            shield: '#00ff41',
            speed: '#00d4ff',
            score: '#ffbe0b',
            heal: '#ff006e'
        };
        return colors[this.type] || '#00ff41';
    }
 
    update() {
        this.rotation += this.rotationSpeed;
        this.pulse = Math.sin(this.rotation * Math.PI / 180) * 5;
        this.y += 3;
    }
 
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
 
        // Outer glow
        ctx.fillStyle = `rgba(${this.color === '#00ff41' ? '0, 255, 65' : '0, 212, 255'}, 0.2)`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 15 + this.pulse, 0, Math.PI * 2);
        ctx.fill();
 
        // Star shape
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        this.drawStar(ctx, 0, 0, 5, this.size, this.size * 0.5);
        ctx.fill();
        ctx.stroke();
 
        ctx.restore();
    }
 
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
 
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }
 
    getCollisionBox() {
        return {
            x: this.x - this.size,
            y: this.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }
}
 
class SpeedSagaGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.car = new Car(this.canvas.width / 2, this.canvas.height - 100);
        this.obstacles = [];
        this.powerUps = [];
        this.input = {
            accelerate: false,
            brake: false,
            left: false,
            right: false
        };
        this.gameSpeed = 5;
        this.spawnRate = 0.02;
        this.lastFrameTime = Date.now();
        this.deltaTime = 0;
 
        this.setupEventListeners();
        this.setupAudioElements();
        this.startCinemaIntro();
    }
 
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
 
        // Menu buttons
        document.getElementById('playBtn').addEventListener('click', () => this.startGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('helpBtn').addEventListener('click', () => this.openHelp());
        document.getElementById('skipIntro').addEventListener('click', () => this.skipIntro());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resume());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.mainMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.mainMenu());
        document.getElementById('backSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('backHelpBtn').addEventListener('click', () => this.closeHelp());
 
        // Settings
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.gameState.difficulty = e.target.value;
        });
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.gameState.soundEnabled = e.target.checked;
        });
        document.getElementById('musicToggle').addEventListener('change', (e) => {
            this.gameState.musicEnabled = e.target.checked;
        });
        document.getElementById('graphicsSelect').addEventListener('change', (e) => {
            this.gameState.graphicsQuality = e.target.value;
        });
 
        // Audio controls
        document.getElementById('audioToggleIntro').addEventListener('click', () => this.toggleAudio());
        document.getElementById('audioToggleGame').addEventListener('click', () => this.toggleAudio());
    }
 
    setupAudioElements() {
        // Generate placeholder sounds (in production, use actual audio files)
        this.sounds = {
            accelerate: new Audio(),
            crash: new Audio(),
            dodge: new Audio(),
            powerUp: new Audio(),
            levelUp: new Audio()
        };
    }
 
    handleKeyDown(e) {
        if (!this.gameState.isPlaying) return;
 
        switch (e.key.toUpperCase()) {
            case 'W':
                this.input.accelerate = true;
                e.preventDefault();
                break;
            case 'S':
                this.input.brake = true;
                e.preventDefault();
                break;
            case 'A':
                this.input.left = true;
                e.preventDefault();
                break;
            case 'D':
                this.input.right = true;
                e.preventDefault();
                break;
            case ' ':
                this.input.brake = true;
                e.preventDefault();
                break;
            case 'P':
                this.togglePause();
                e.preventDefault();
                break;
        }
    }
 
    handleKeyUp(e) {
        switch (e.key.toUpperCase()) {
            case 'W':
                this.input.accelerate = false;
                break;
            case 'S':
            case ' ':
                this.input.brake = false;
                break;
            case 'A':
                this.input.left = false;
                break;
            case 'D':
                this.input.right = false;
                break;
        }
    }
 
    startCinemaIntro() {
        const cinemaIntro = document.getElementById('cinemaIntro');
        setTimeout(() => {
            cinemaIntro.style.opacity = '0';
            cinemaIntro.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                cinemaIntro.classList.add('hidden');
                this.showMainMenu();
            }, 500);
        }, 10000); // 10 second intro
    }
 
    skipIntro() {
        const cinemaIntro = document.getElementById('cinemaIntro');
        cinemaIntro.classList.add('hidden');
        this.showMainMenu();
    }
 
    showMainMenu() {
        document.getElementById('mainMenu').classList.remove('hidden');
    }
 
    hideMainMenu() {
        document.getElementById('mainMenu').classList.add('hidden');
    }
 
    openSettings() {
        document.getElementById('settingsPanel').classList.remove('hidden');
    }
 
    closeSettings() {
        document.getElementById('settingsPanel').classList.add('hidden');
    }
 
    openHelp() {
        document.getElementById('helpPanel').classList.remove('hidden');
    }
 
    closeHelp() {
        document.getElementById('helpPanel').classList.add('hidden');
    }
 
    startGame() {
        this.hideMainMenu();
        this.gameState.reset();
        this.gameState.isPlaying = true;
        this.car = new Car(this.canvas.width / 2, this.canvas.height - 100);
        this.obstacles = [];
        this.powerUps = [];
        this.lastFrameTime = Date.now();
        document.getElementById('gameContainer').classList.remove('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameOverMenu').classList.add('hidden');
        this.gameLoop();
    }
 
    resume() {
        this.gameState.isPaused = false;
        document.getElementById('pauseMenu').classList.add('hidden');
        this.gameLoop();
    }
 
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        if (this.gameState.isPaused) {
            document.getElementById('pauseScore').textContent = this.gameState.score;
            document.getElementById('pauseDistance').textContent = this.gameState.distance + ' m';
            document.getElementById('pauseLevel').textContent = this.gameState.level;
            document.getElementById('pauseMenu').classList.remove('hidden');
        } else {
            document.getElementById('pauseMenu').classList.add('hidden');
            this.gameLoop();
        }
    }
 
    restart() {
        this.startGame();
    }
 
    mainMenu() {
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameOverMenu').classList.add('hidden');
        this.gameState.isPlaying = false;
        this.showMainMenu();
    }
 
    toggleAudio() {
        this.gameState.soundEnabled = !this.gameState.soundEnabled;
        const btn = event.target.closest('.audio-btn');
        btn.textContent = this.gameState.soundEnabled ? '🔊' : '🔇';
    }
 
    gameLoop() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
 
        // Calculate delta time
        const now = Date.now();
        this.deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
 
        // Update game state
        this.update();
 
        // Draw game
        this.draw();
 
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
 
    update() {
        // Update car
        this.car.update(this.input, this.deltaTime);
 
        // Update game speed based on level
        const difficultyMultiplier = {
            easy: 0.8,
            normal: 1.0,
            hard: 1.3,
            insane: 1.6
        }[this.gameState.difficulty] || 1.0;
 
        this.gameSpeed = 5 + (this.gameState.level - 1) * 0.5;
        this.gameSpeed *= difficultyMultiplier;
 
        // Update game time
        this.gameState.time += this.deltaTime;
 
        // Update distance
        this.gameState.distance += Math.floor(this.gameSpeed / 10);
 
        // Score based on distance
        if (Math.floor(this.gameState.distance) % 100 === 0 && this.gameState.distance % 100 < 10) {
            this.gameState.score += 10 * this.gameState.combo;
        }
 
        // Level up
        const newLevel = Math.floor(this.gameState.distance / 1000) + 1;
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.playSound('levelUp');
            this.showWarning('LEVEL ' + newLevel + '!');
            this.spawnRate += 0.005;
        }
 
        // Spawn obstacles
        if (Math.random() < this.spawnRate) {
            this.spawnObstacle();
        }
 
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].update(this.gameSpeed);
 
            // Check collision with player
            if (this.checkCollision(this.car, this.obstacles[i])) {
                if (!this.car.isInvincible) {
                    this.gameState.health -= 25;
                    this.gameState.combo = 1;
                    this.playSound('crash');
                    this.showWarning('HIT!');
                    this.car.isInvincible = true;
                    this.car.invincibilityTime = 1.5;
 
                    if (this.gameState.health <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
 
            // Remove off-screen obstacles
            if (this.obstacles[i].y > this.canvas.height + 100) {
                this.obstacles.splice(i, 1);
                this.gameState.combo = Math.min(this.gameState.combo + 1, 10);
                this.gameState.score += 50 * this.gameState.combo;
            }
        }
 
        // Spawn power-ups
        if (Math.random() < this.spawnRate * 0.3) {
            this.spawnPowerUp();
        }
 
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
 
            // Check collision with player
            if (this.checkCollision(this.car, this.powerUps[i])) {
                this.collectPowerUp(this.powerUps[i]);
                this.powerUps.splice(i, 1);
            } else if (this.powerUps[i].y > this.canvas.height + 100) {
                this.powerUps.splice(i, 1);
            }
        }
 
        // Update HUD
        this.updateHUD();
    }
 
    spawnObstacle() {
        const x = Math.random() * (this.canvas.width - 80) + 40;
        const obstacle = new Obstacle(x, -60);
        this.obstacles.push(obstacle);
    }
 
    spawnPowerUp() {
        const x = Math.random() * (this.canvas.width - 80) + 40;
        const types = ['shield', 'speed', 'score', 'heal'];
        const type = types[Math.floor(Math.random() * types.length)];
        const powerUp = new PowerUp(x, -30, type);
        this.powerUps.push(powerUp);
    }
 
    collectPowerUp(powerUp) {
        this.playSound('powerUp');
 
        switch (powerUp.type) {
            case 'shield':
                this.car.isInvincible = true;
                this.car.invincibilityTime = 3;
                break;
            case 'speed':
                this.car.maxSpeed = Math.min(this.car.maxSpeed + 5, 25);
                setTimeout(() => {
                    this.car.maxSpeed = 15;
                }, 3000);
                break;
            case 'score':
                this.gameState.score += 500 * this.gameState.combo;
                break;
            case 'heal':
                this.gameState.health = Math.min(this.gameState.health + 50, 100);
                break;
        }
    }
 
    checkCollision(obj1, obj2) {
        const box1 = obj1.getCollisionBox();
        const box2 = obj2.getCollisionBox();
 
        return (
            box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y
        );
    }
 
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 40, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
 
        // Draw road
        this.drawRoad();
 
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }
 
        // Draw power-ups
        for (const powerUp of this.powerUps) {
            powerUp.draw(this.ctx);
        }
 
        // Draw car
        this.car.draw(this.ctx);
 
        // Draw particles
        this.drawParticles();
    }
 
    drawRoad() {
        const roadY = (this.gameState.distance * this.gameSpeed) % 60;
 
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        this.ctx.lineWidth = 2;
 
        // Center line
        for (let i = -1; i < this.canvas.height / 30; i++) {
            const y = i * 60 + roadY - 60;
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, y);
            this.ctx.lineTo(this.canvas.width / 2, y + 30);
            this.ctx.stroke();
        }
 
        // Side lines
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(50, 0);
        this.ctx.lineTo(50, this.canvas.height);
        this.ctx.stroke();
 
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 50, 0);
        this.ctx.lineTo(this.canvas.width - 50, this.canvas.height);
        this.ctx.stroke();
 
        this.ctx.setLineDash([]);
    }
 
    drawParticles() {
        // Add exhaust effect
        if (this.car.velocity > 2) {
            this.ctx.fillStyle = `rgba(0, 212, 255, ${0.3 * (this.car.velocity / this.car.maxSpeed)})`;
            this.ctx.fillRect(
                this.car.x - 15,
                this.car.y + this.car.height / 2,
                30,
                20
            );
        }
    }
 
    updateHUD() {
        document.getElementById('speedValue').textContent = Math.floor(this.car.velocity * 10);
        document.getElementById('rpmFill').style.width = (this.car.velocity / this.car.maxSpeed * 100) + '%';
        document.getElementById('scoreValue').textContent = this.gameState.score;
        document.getElementById('levelValue').textContent = this.gameState.level;
        document.getElementById('distanceValue').textContent = Math.floor(this.gameState.distance);
        document.getElementById('healthFill').style.width = this.gameState.health + '%';
        document.getElementById('timeValue').textContent = this.formatTime(this.gameState.time);
 
        // Show combo multiplier
        if (this.gameState.combo > 1) {
            document.getElementById('multiplierDisplay').style.display = 'flex';
            document.getElementById('multiplierValue').textContent = 'x' + this.gameState.combo;
        } else {
            document.getElementById('multiplierDisplay').style.display = 'none';
        }
 
        // Health warning
        if (this.gameState.health < 30) {
            document.getElementById('healthFill').style.background = 'linear-gradient(90deg, #ffbe0b, #ff006e)';
        } else {
            document.getElementById('healthFill').style.background = 'linear-gradient(90deg, #00ff41, #ff006e)';
        }
    }
 
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
 
    showWarning(message) {
        const warning = document.getElementById('warningMessage');
        warning.textContent = message;
        warning.classList.remove('hidden');
        setTimeout(() => {
            warning.classList.add('hidden');
        }, 1000);
    }
 
    playSound(soundName) {
        if (!this.gameState.soundEnabled) return;
        // Sound effects would be played here
        // For now, using Web Audio API or actual audio files
    }
 
    gameOver() {
        this.gameState.isPlaying = false;
        document.getElementById('finalScore').textContent = this.gameState.score;
        document.getElementById('finalDistance').textContent = this.gameState.distance + ' m';
        document.getElementById('finalLevel').textContent = this.gameState.level;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameState.time);
        document.getElementById('gameOverMenu').classList.remove('hidden');
    }
}
 
// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new SpeedSagaGame();
});
