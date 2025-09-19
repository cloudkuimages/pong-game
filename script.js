document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const playerScoreElement = document.getElementById('player-score');
    const aiScoreElement = document.getElementById('ai-score');
    
    canvas.width = 600;
    canvas.height = 400;
    
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 80;
    const BALL_RADIUS = 8;
    const PADDLE_SPEED = 6;
    const INITIAL_BALL_SPEED = 5;
    const MAX_BALL_SPEED = 12;
    
    let playerScore = 0;
    let aiScore = 0;
    
    const player = {
        x: 20,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: '#4fc3f7',
        score: 0
    };
    
    const ai = {
        x: canvas.width - 30,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: '#ff5252',
        score: 0
    };
    
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: BALL_RADIUS,
        velocityX: INITIAL_BALL_SPEED,
        velocityY: INITIAL_BALL_SPEED,
        speed: INITIAL_BALL_SPEED,
        color: '#00cc99'
    };
    
    function drawRect(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }
    
    function drawCircle(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawNet() {
        for (let i = 0; i < canvas.height; i += 20) {
            drawRect(canvas.width / 2 - 1, i, 2, 10, '#444');
        }
    }
    
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = INITIAL_BALL_SPEED;
        
        ball.velocityX = -ball.velocityX;
        ball.velocityY = Math.random() * 10 - 5;
    }
    
    function update() {
        // Move the ball
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        // AI paddle movement
        const aiCenter = ai.y + ai.height / 2;
        const ballCenter = ball.y;
        
        // Add some "intelligence" to the AI
        if (ball.velocityX > 0) {
            if (aiCenter < ballCenter - 10) {
                ai.y += PADDLE_SPEED * 0.7;
            } else if (aiCenter > ballCenter + 10) {
                ai.y -= PADDLE_SPEED * 0.7;
            }
        } else {
            // Return to center slowly when ball is moving away
            if (aiCenter < canvas.height / 2 - 20) {
                ai.y += PADDLE_SPEED * 0.3;
            } else if (aiCenter > canvas.height / 2 + 20) {
                ai.y -= PADDLE_SPEED * 0.3;
            }
        }
        
        // Ball collision with top and bottom walls
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }
        
        // Determine which paddle is being hit
        let paddle = ball.x < canvas.width / 2 ? player : ai;
        
        // Check for paddle collisions
        if (
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.x + ball.radius > paddle.x &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.y + ball.radius > paddle.y
        ) {
            // Calculate where the ball hit the paddle
            let collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
            
            // Calculate angle based on where the ball hit the paddle
            let angleRad = (Math.PI / 4) * collidePoint;
            
            // Direction based on which paddle was hit
            let direction = ball.x < canvas.width / 2 ? 1 : -1;
            
            // Change velocity based on angle and direction
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);
            
            // Increase speed with each hit
            if (ball.speed < MAX_BALL_SPEED) {
                ball.speed += 0.2;
            }
        }
        
        // Update score if ball goes past paddle
        if (ball.x - ball.radius < 0) {
            aiScore++;
            aiScoreElement.textContent = aiScore;
            resetBall();
        } else if (ball.x + ball.radius > canvas.width) {
            playerScore++;
            playerScoreElement.textContent = playerScore;
            resetBall();
        }
    }
    
    function render() {
        // Clear canvas
        drawRect(0, 0, canvas.width, canvas.height, '#1e1e1e');
        
        // Draw net
        drawNet();
        
        // Draw paddles
        drawRect(player.x, player.y, player.width, player.height, player.color);
        drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
        
        // Draw ball with glowing effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = ball.color;
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
        ctx.shadowBlur = 0;
    }
    
    function game() {
        update();
        render();
    }
    
    // Mouse control for player paddle
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        player.y = e.clientY - rect.top - player.height / 2;
        
        // Keep paddle within canvas boundaries
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
        }
    });
    
    // Set game loop
    const framePerSecond = 60;
    setInterval(game, 1000 / framePerSecond);
});