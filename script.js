document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  let playerScore = document.getElementById("score");
  const ctx = canvas.getContext("2d");

  let playerX = canvas.width / 2 - 32; // Initial player position
  let playerSpeed = 5; // Adjust speed as needed
  let moveLeft = false;
  let moveRight = false;
  let enemyX = canvas.width / 2 - 32; // Initial enemy position
  let secondEnemyX = canvas.width / 2 + 60;
  let enemySpeed = 2; // Adjust enemy speed as needed
  let enemyMoveDirection = Math.random() > 0.5 ? 1 : -1; // Random initial direction, 1 for right, -1 for left
  let lasers = [];
  let enemyLasers = [];
  let playerLaserCount = 0;
  let gameStarted = false;
  let playerHp = 100;
  let enemyHp = 100;
  let firstEnemyLaserLimit = 2; // Limit of lasers for the first enemy
  let secondEnemyLaserLimit = 2; // Limit of lasers for the second enemy
  let firstEnemyLaserCount = 0; // Current laser count for the first enemy
  let secondEnemyLaserCount = 0; // Current laser count for the second enemy
  let secondEnemyActive = false; // This flags if the second enemy is on screen
  let secondEnemyY = 96; // Initial Y position for the seacond enemy if activated
  playerScore = 0;
  let secondEnemyMoveDirection = Math.random() > 0.5 ? 1 : -1; // Random initial direction for second enemy
  let secondEnemySpeed = 2; // Adjust as needed
  let laserSpeedUpgrade = false;
  let spaceshipSpeedUpgrade = false;
  let spaceshipDefenseUpgrade = false;
  let shieldActive = false;
  let shieldCharges = 5; // Total of 5 charges
  let shieldActivationTime = 0;
  let hpRestorationUpgrade = false;
  let laserSpeed = 8;
  let enemyLaserSpeed = 6;
  let gameActive = true;
  let bgMusic = new Audio("./assets/bg-music.mp3");
  bgMusic.loop = true; // Loop the music

  // Load and draw background, player, and enemy
  const bgImage = new Image();
  const player = new Image();
  const enemy = new Image();

  function draw() {
    if (!gameStarted) {
      showInstructions();
      return; // Don't proceed to draw game elements
    }
    ctx.drawImage(bgImage, 0, 0);
    ctx.drawImage(player, playerX, canvas.height - 64);
    ctx.drawImage(enemy, enemyX, 0); // Make sure to use enemyX here
    // If the shield is active, draw a glow around the player
    if (shieldActive) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = "yellow";
      ctx.drawImage(player, playerX, canvas.height - 64); // Redraw player to apply glow
      ctx.shadowBlur = 0; // Reset shadowBlur for other drawings
    }
    if (secondEnemyActive) {
      ctx.drawImage(enemy, secondEnemyX, secondEnemyY);
      secondEnemyX += secondEnemySpeed * secondEnemyMoveDirection;

      // Optionally, randomly change direction for a more dynamic movement
      if (Math.random() < 0.01) {
        secondEnemyMoveDirection *= -1;
      }

      // Border checks to reverse direction if hitting the canvas edge
      if (secondEnemyX <= 0 || secondEnemyX >= canvas.width - 64) {
        secondEnemyMoveDirection *= -1;
      }
    }
  }

  //upgrades
  function checkAndApplyUpgrades() {
    if (playerScore >= 20 && !laserSpeedUpgrade) {
      // Increase Laser Speed
      // Assuming you have a variable for laser speed, increase it here.
      laserSpeed += 3; // Adjust as needed
      laserSpeedUpgrade = true;
      console.log("Laser speed increased!");
    }

    if (playerScore >= 40 && !spaceshipSpeedUpgrade) {
      // Increase Spaceship Speed
      playerSpeed += 2; // Adjust as needed
      spaceshipSpeedUpgrade = true;
      console.log("Spaceship speed increased!");
    }
    if (playerScore >= 60 && !spaceshipDefenseUpgrade) {
      //defense for 5s, 5 charges
      spaceshipDefenseUpgrade = true;
    }

    if (playerScore >= 80 && !hpRestorationUpgrade) {
      // Each hit now restores HP
      hpRestorationUpgrade = true;
      console.log("HP restoration on hit activated!");
    }
  }

  function showInstructions() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Welcome to Space Invaders",
      canvas.width / 2,
      canvas.height / 2 - 40
    );
    ctx.fillText("Press A or D to move", canvas.width / 2, canvas.height / 2);
    ctx.fillText(
      "Press SPACE to shoot",
      canvas.width / 2,
      canvas.height / 2 + 40
    );
    ctx.fillText(
      `Press ENTER to start the game`,
      canvas.width / 2,
      canvas.height / 2 + 80
    );
    ctx.fillText(
      "Mind background music and sound effects!",
      canvas.width / 2,
      canvas.height / 2 + 120
    );
  }
  function startGame() {
    updateGame(); // Start the game loop
    updateHPBars();
    playBackgroundMusic(); // Function to play the background music
  }
  function playBackgroundMusic() {
    bgMusic.play();
  }
  function enemyHitSound() {
    let enemyHit = new Audio("./assets/enemyhit.wav");
    enemyHit.play();
  }

  function playerHitSound() {
    let playerHit = new Audio("./assets/playerhit.wav");
    playerHit.play();
  }
  function updateHPBars() {
    const playerHPFiller = document.getElementById("playerHPFiller");
    const enemyHPFiller = document.getElementById("enemyHPFiller");

    // Assuming playerHP and enemyHP are percentages (0 to 100)
    playerHPFiller.style.height = `${playerHp}%`;
    enemyHPFiller.style.height = `${enemyHp}%`;
  }
  function attemptEnemyShooting() {
    // Logic for the first enemy to shoot
    if (firstEnemyLaserCount < firstEnemyLaserLimit && Math.random() < 0.05) {
      enemyLasers.push({
        x: enemyX + 32 - 5,
        y: 32 + 64,
        shooter: "firstEnemy",
      });
      firstEnemyLaserCount++;
    }

    // Logic for the second enemy to shoot, independent of the first enemy
    if (
      secondEnemyActive &&
      secondEnemyLaserCount < secondEnemyLaserLimit &&
      Math.random() < 0.05
    ) {
      enemyLasers.push({
        x: secondEnemyX + 32 - 5,
        y: secondEnemyY + 64,
        shooter: "secondEnemy",
      });
      secondEnemyLaserCount++;
    }
  }

  bgImage.onload = () => {
    player.src = "./assets/player.png"; // Load player after background to ensure correct draw order
  };
  player.onload = () => {
    enemy.src = "./assets/enemy1.png"; // Load enemy after player
  };
  enemy.onload = draw; // Draw everything once all images are loaded
  bgImage.src = "./assets/background.png";

  document.addEventListener("keydown", (event) => {
    if (event.key === "a") moveLeft = true;
    if (event.key === "d") moveRight = true;
    if (event.code === "Space" && playerLaserCount < 2) {
      // Only shoot if less than 3 lasers on screen
      lasers.push({ x: playerX + 32 - 5, y: canvas.height - 64 }); // Adjust the X position as needed
      playerLaserCount++; // Increment the laser count
    }
    if (
      event.key === "q" &&
      spaceshipDefenseUpgrade &&
      shieldCharges > 0 &&
      !shieldActive
    ) {
      shieldActive = true;
      shieldCharges--;
      shieldActivationTime = Date.now();
      console.log("Shield activated! Remaining charges: ", shieldCharges);
    }
    if (event.code === "Enter" && !gameStarted) {
      gameStarted = true;
      startGame(); // Function to start the game
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "a") moveLeft = false;
    if (event.key === "d") moveRight = false;
  });

  function updateGame() {
    if (!gameActive) {
      return; // Stop the game loop if the game is not active
    }
    attemptEnemyShooting();
    if (enemyHp <= 50) enemySpeed = 3;
    if (enemyHp <= 25) enemySpeed = 4;
    if (enemyHp <= 30 && !secondEnemyActive) {
      secondEnemyActive = true;
    }
    if (shieldActive && Date.now() - shieldActivationTime >= 5000) {
      // 5 seconds
      shieldActive = false;
      console.log("Shield deactivated!");
    }

    if (moveLeft && playerX > 0) playerX -= playerSpeed;
    if (moveRight && playerX < canvas.width - 64) playerX += playerSpeed;

    enemyX += enemySpeed * enemyMoveDirection;
    if (enemyX <= 0) {
      enemyMoveDirection = 1;
      enemyX += enemySpeed; // Correct position slightly
    } else if (enemyX >= canvas.width - 64) {
      enemyMoveDirection = -1;
      enemyX -= enemySpeed; // Correct position slightly
    }

    // Introduce randomness in movement direction change
    if (Math.random() < 0.02) {
      // Adjust the probability as needed
      enemyMoveDirection *= -1; // Change direction randomly
    }

    // Adjust enemy speed randomly for more unpredictability
    if (Math.random() < 0.01) {
      // Adjust the probability as needed
      enemySpeed = Math.random() * 1 + 1; // Random speed between 2 and 4
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].y -= 10;
      if (lasers[i].y < 0) {
        lasers.splice(i, 1);
        playerLaserCount--;
        continue;
      }

      // Check for collision with the first enemy
      if (
        lasers[i].y <= 32 + 64 &&
        lasers[i].x >= enemyX &&
        lasers[i].x <= enemyX + 64
      ) {
        lasers.splice(i, 1);
        playerLaserCount--;
        enemyHitSound();
        playerScore++;
        enemyHp--;
        if (hpRestorationUpgrade) {
          playerHp += 1; // Restore some HP. Adjust the amount as needed.
          // Make sure player HP doesn't exceed max HP
          playerHp = Math.min(playerHp, 100); // Assuming 100 is max HP
        }
        if (enemyHp <= 0) {
          // Handle the first enemy defeat if needed
          gameActive = false;
          bgMusic.pause();
          bgMusic.currentTime = 0;
          // Call the function to draw the game over screen
          // Update the modal's body with the score
          document.getElementById(
            "gameOverModalBody"
          ).innerHTML = `You scored ${playerScore} points.`;

          // Show the modal using Bootstrap 5 method
          var gameOverModal = new bootstrap.Modal(
            document.getElementById("gameOverModal")
          );
          gameOverModal.show();
        }
        document.getElementById("score").innerText = "Score: " + playerScore;
        updateHPBars();
        continue;
      }

      // Check for collision with the second enemy
      if (
        secondEnemyActive &&
        lasers[i].y <= secondEnemyY + 64 &&
        lasers[i].x >= secondEnemyX &&
        lasers[i].x <= secondEnemyX + 64
      ) {
        lasers.splice(i, 1);
        playerLaserCount--;
        enemyHitSound();
        playerScore++;
        enemyHp--; // Decrement second enemy's HP here
        if (enemyHp <= 0) {
          secondEnemyActive = false; // Remove or deactivate the second enemy
        }
        document.getElementById("score").innerText = "Score: " + playerScore;
        updateHPBars();
      }
    }
    // Update enemy laser positions
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
      if (enemyHp <= 80) enemyLaserSpeed = 10;
      enemyLasers[i].y += enemyLaserSpeed;

      if (enemyLasers[i].y > canvas.height) {
        // Access the shooter property before splicing
        const shooter = enemyLasers[i].shooter;
        enemyLasers.splice(i, 1); // Remove the laser

        // Decrement the appropriate laser count
        if (shooter === "firstEnemy") {
          firstEnemyLaserCount--;
        } else if (shooter === "secondEnemy") {
          secondEnemyLaserCount--;
        }
        continue;
      }

      // Check for collision with player
      if (
        enemyLasers[i].y >= canvas.height - 64 &&
        enemyLasers[i].x >= playerX &&
        enemyLasers[i].x <= playerX + 64
      ) {
        // Access the shooter property before splicing
        const shooter = enemyLasers[i].shooter;
        enemyLasers.splice(i, 1); // Remove the laser

        // Decrement the appropriate laser count
        if (shooter === "firstEnemy") {
          firstEnemyLaserCount--;
        } else if (shooter === "secondEnemy") {
          secondEnemyLaserCount--;
        }
        if (!shieldActive) {
          if (enemyHp <= 50) {
            playerHp -= 3;
          } else {
            playerHp--;
          }
        }

        updateHPBars();
        playerHitSound();
        if (playerHp <= 0) {
          gameActive = false;
          bgMusic.pause();
          bgMusic.currentTime = 0;
          // Call the function to draw the game over screen
          // Update the modal's body with the score
          document.getElementById(
            "gameOverModalBody"
          ).innerHTML = `You scored ${playerScore} points.`;

          // Show the modal using Bootstrap 5 method
          var gameOverModal = new bootstrap.Modal(
            document.getElementById("gameOverModal")
          );
          gameOverModal.show();

          // Optionally, provide a way to refresh the game without manually refreshing the page
          document.addEventListener(
            "keydown",
            (event) => {
              if (event.key === "Enter") {
                location.reload(); // Refresh the page to restart the game
              }
            },
            { once: true }
          );
        }
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();

    for (const laser of lasers) {
      ctx.fillStyle = "red";
      ctx.fillRect(laser.x, laser.y, 10, 20);
    }

    for (const enemyLaser of enemyLasers) {
      ctx.fillStyle = "yellow";
      ctx.fillRect(enemyLaser.x, enemyLaser.y, 10, 20);
    }

    checkAndApplyUpgrades();

    requestAnimationFrame(updateGame);
  }

  showInstructions(); // Display game instructions
});
