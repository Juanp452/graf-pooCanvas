// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Paleta de colores Neón vibrantes para la renovación de pelotas
const NEON_COLORS = [
    '#FF007F', // Rosa Neón
    '#00F0FF', // Cian Neón
    '#39FF14', // Verde Neón
    '#FF00F0', // Magenta
    '#FFE600', // Amarillo Neón
    '#BF00FF', // Violeta Neón
    '#FF3131', // Rojo Neón
    '#00FF9F'  // Turquesa Neón
];

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    draw() {
        ctx.save();
        // Efecto de luz Neón (resplandor)
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia de sentido al reaparecer

        // Cambiar a un color neón aleatorio diferente al reaparecer en el centro
        const availableColors = NEON_COLORS.filter(c => c !== this.color);
        this.color = availableColors[Math.floor(Math.random() * availableColors.length)];
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, color, isPlayerControlled = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 7;
    }

    draw() {
        ctx.save();
        // Resplandor neón en la paleta
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        // Dibujo con bordes redondeados para estilo moderno
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 6);
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    move(direction) {
        if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height < canvas.height) {
            this.y += this.speed;
        }
    }

    // Movimiento de la paleta automática (IA) siguiendo la pelota amenazante más cercana
    autoMove(balls) {
        let targetBall = null;
        let minDistance = Infinity;

        for (const ball of balls) {
            if (ball.speedX > 0) {
                const distance = canvas.width - ball.x;
                if (distance < minDistance) {
                    minDistance = distance;
                    targetBall = ball;
                }
            }
        }

        if (!targetBall && balls.length > 0) {
            targetBall = balls[0];
        }

        if (targetBall) {
            const paddleCenter = this.y + this.height / 2;
            if (targetBall.y < paddleCenter - 12) {
                this.y -= this.speed;
            } else if (targetBall.y > paddleCenter + 12) {
                this.y += this.speed;
            }
        }
    }
}

// Clase Game (Controla el juego)
class Game {
    constructor() {
        // Generar 5 pelotas con diferente tamaño, color inicial neón y velocidad
        this.balls = [
            new Ball(canvas.width / 2, canvas.height / 2, 9,  4.5,  3.5, '#FF007F'), // Rosa
            new Ball(canvas.width / 2, canvas.height / 2, 13, -5.5,  4.0, '#00F0FF'), // Cian
            new Ball(canvas.width / 2, canvas.height / 2, 7,   6.5, -5.0, '#39FF14'), // Verde
            new Ball(canvas.width / 2, canvas.height / 2, 15, -3.5,  2.5, '#FFE600'), // Amarillo
            new Ball(canvas.width / 2, canvas.height / 2, 11,  5.0, -4.5, '#FF00F0')  // Magenta
        ];

        // Paleta del jugador: Doble de alto (200px) con resplandor neón azul/cian (#00F0FF)
        this.paddle1 = new Paddle(12, canvas.height / 2 - 100, 14, 200, '#00F0FF', true);

        // Paleta CPU: Alto normal (100px) con resplandor magenta/rosa (#FF007F)
        this.paddle2 = new Paddle(canvas.width - 26, canvas.height / 2 - 50, 14, 100, '#FF007F', false);

        this.keys = {};
    }

    drawField() {
        // Línea central punteada estilo neón
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.restore();
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar elementos decorativos
        this.drawField();

        // Dibujar pelotas
        this.balls.forEach(ball => ball.draw());

        // Dibujar paletas
        this.paddle1.draw();
        this.paddle2.draw();
    }

    update() {
        // Control de paleta del jugador
        if (this.keys['ArrowUp']) {
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown']) {
            this.paddle1.move('down');
        }

        // Control IA de CPU
        this.paddle2.autoMove(this.balls);

        // Actualizar pelotas y verificar colisiones
        this.balls.forEach(ball => {
            ball.move();

            // Colisión con Paleta del Jugador
            if (
                ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
                ball.x + ball.radius >= this.paddle1.x &&
                ball.y >= this.paddle1.y &&
                ball.y <= this.paddle1.y + this.paddle1.height &&
                ball.speedX < 0
            ) {
                ball.speedX = -ball.speedX;
            }

            // Colisión con Paleta de la CPU
            if (
                ball.x + ball.radius >= this.paddle2.x &&
                ball.x - ball.radius <= this.paddle2.x + this.paddle2.width &&
                ball.y >= this.paddle2.y &&
                ball.y <= this.paddle2.y + this.paddle2.height &&
                ball.speedX > 0
            ) {
                ball.speedX = -ball.speedX;
            }

            // Si la pelota sale del área lateral, regresa al centro y cambia de color
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
                ball.reset();
            }
        });
    }

    handleInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });
        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    run() {
        this.handleInput();
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Inicialización del juego
const game = new Game();
game.run();