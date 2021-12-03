// Kwarren17@georgefox.edu
// due 2021-11-11

// This is a little bit of a mess. I need more objects and more carefully selected scope. 

// Heavily referenced source:
// https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Move_the_ball

const canvas = document.getElementById("gamePage");
const context = canvas.getContext("2d");
const gameWidth = canvas.getAttribute("width");
const gameHeight = canvas.getAttribute("height");

// context.strokeStyle = 'F00';
// context.beginPath();
// context.moveTo(gameWidth/2, 0);
// context.lineTo(gameWidth/2,gameHeight);
// context.closePath();
// context.stroke();

// context.beginPath();
// context.moveTo(0, gameHeight/2);
// context.lineTo(gameWidth, gameHeight/2);
// context.closePath();
// context.stroke();



// init player values at middle of screen, falling down. 
let charSize = 25;
let playerX = gameWidth/2;
let playerY = gameHeight/2;
let playerDX = 0;       // m/s
let playerDY = 0;       // m/s
let tStep = 1/60;       // s

// arbitrary variables to fiddle with to try and improve control 'feel'
let inputForce = 0;     // N
let inputAngle = 0; 
let grappleForce = 0;   // N
let grappleAngle = 0;
let playerMass = 10;    // kg
let gravAccel = 0;      // m/s^2

// calculate player boundries
let playerLeft = playerX-charSize/2;
let playerRight = playerY+charSize/2;
let playerTop = playerY-charSize/2;
let playerBot = playerY+charSize/2;

// init player actions
let mouseXPos = 0;
let mouseYPos = 0;
let grapplePointX = 0;
let grapplePointY = 0;
let grappleFlag = false;

// jank state machine
let aPress = false;
let dPress = false;


//-------------------------
// Visuals and Animation
//-------------------------
function draw() {
    context.clearRect(0, 0, gameWidth, gameHeight);
    drawPlayer();
}

function drawPlayer() {
    // draw player
    context.fillStyle = '#F00';
    context.beginPath();
    context.moveTo(playerX-charSize/2, playerY+charSize/2);
    context.lineTo(playerX+charSize/2, playerY+charSize/2);
    context.lineTo(playerX, playerY-charSize/2);
    context.closePath();
    context.fill();

    // draw grapple
	if (grappleFlag) {
		context.moveTo(playerX, playerY);
		context.lineTo(grapplePointX, grapplePointY);
		context.stroke();
	}
}

//-------------------------
// Collision and stuff
//-------------------------
function checkCollision() {
    return checkPlayerGameBoundries();
}

function checkPlayerGameBoundries() {
    let value = false;
    // lower boundry
    if (playerBot + playerDY+1 > gameHeight) {
        playerDY = 0;
        value = true;

        playerX = gameWidth/2;
        playerY = gameHeight/2;
    } 
    // upper boundry
    else if (playerTop + playerDY+1 < 0) {
        playerDY = 0;
        value = true;
        playerX = gameWidth/2;
        playerY = gameHeight/2;
    } 
    // left boundry
    else if (playerLeft + playerDX+1 < 0) {
        playerDX = 0;
        value = true;
        playerX = gameWidth/2;
        playerY = gameHeight/2;
    }
    // right boundry
    else if (playerRight + playerDX+1 > gameWidth) {
        playerDX = 0;
        value = true;
        playerX = gameWidth/2;
        playerY = gameHeight/2;
    }    

    return value;
}

//-------------------------
// Actions
//-------------------------
// reference: https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
canvas.addEventListener('mousemove', function(event) {
    let gameRect = canvas.getBoundingClientRect();

    mouseXPos = event.clientX - gameRect.left;
    mouseYPos = event.clientY - gameRect.top;

    document.getElementById("mouse-x-coordinate").innerHTML = mouseXPos;
    document.getElementById("mouse-y-coordinate").innerHTML = mouseYPos;

    return {
        x: mouseXPos,
        y: mouseYPos
    };
});

canvas.addEventListener("click", function(e) {
    let gameRect = canvas.getBoundingClientRect();
    grappleFlag = true;
    grapplePointX = e.clientX -gameRect.left;
    grapplePointY = e.clientY - gameRect.top;
    grappleForce = 200;
});

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        inputForce = 100;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        inputForce = -100;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        inputForce = 0;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        inputForce = 0;
    }
}

//-------------------------
// Mathy things
//-------------------------
function updateXVelocity (grappleAngle, inputAngle) {
    //console.log("x" + ((grappleForce*Math.cos(grappleAngle) + inputForce)/playerMass)*tStep + playerDX)
    return ((grappleForce*Math.cos(grappleAngle) + inputForce)/playerMass)*tStep + playerDX;
}

function updateYVelocity (grappleAngle, inputAngle) {
    //console.log("y" + ((grappleForce*Math.cos(grappleAngle) + inputForce)/playerMass)*tStep + playerDX)
    return ((-grappleForce*Math.sin(grappleAngle) + playerMass*gravAccel)/playerMass)*tStep + playerDY;
}

// outputs radians
function calculateGrappleAngle() {  
    let delX = mouseXPos - playerX;
    let delY = mouseYPos - playerY;

    console.log("delX; " + delX);
    console.log("delY " + delY);

    context.moveTo(playerX, playerY);
    context.lineTo(mouseXPos, mouseYPos);
    context.stroke();

    let angle = Math.acos(delX / Math.sqrt(Math.pow(delX, 2) + Math.pow(delY, 2))) * (180/Math.PI);

    console.log("if this doesn't say 3.927, cry " + angle);

    return 0; // Math.cos(delX/Math.sqrt(Math.pow(delY)+Math.pow(delX)));
}

function calculationManager() {
    grappleAngle = calculateGrappleAngle();

    let gravForce = playerMass * gravAccel;
    let delV = (tStep/playerMass) * Math.pow((Math.pow(grappleForce, 2) + gravForce * (gravForce - grappleForce * Math.sin(grappleAngle))), .5);

    playerDX = delV * Math.sin(grappleAngle);
    playerDY = delV * Math.cos(grappleAngle);

    checkCollision();

    // update position with velocity value
    playerX += playerDX;
    playerY += playerDY;

    // what is player input angle or grappling angle?
    // let grappleAngle = calculateGrappleAngle();

    // velocity calcs
    // playerDX = updateXVelocity(grappleAngle, );
    // playerDY = updateYVelocity(grappleAngle, );

    // update collision box
    playerLeft = playerX-charSize/2;
    playerRight = playerX+charSize/2;
    playerTop = playerY-charSize/2;
    playerBot = playerY+charSize/2;
         
}

async function getFunFact() {
    var factElement = document.getElementById("funFact");
    const response = await fetch('https://asli-fun-fact-api.herokuapp.com/');
    var responseJSON = await response.json();
    factElement.innerText = responseJSON.data.fact;
}

//-------------------------
// Run
//-------------------------
getFunFact();

setInterval(calculationManager, 20)

setInterval(draw, 20);
setInterval(updateDeveloperDisplay, 20);

// Used for testing purposes, shouldn't exist in code after I'm done. 
function updateDeveloperDisplay() {
    document.getElementById("x-coordinate").innerHTML = playerX;
    document.getElementById("y-coordinate").innerHTML = playerY;

}










