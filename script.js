
"use strict";
// const canvas = document.getElementById("tetris");
const canvas = document.createElement("canvas");

const meshWidth = 12, meshHeight = 20;

canvas.setAttribute("id","tetris");
canvas.setAttribute("width", meshWidth*20);
canvas.setAttribute("height",meshHeight*20);
document.querySelector(".canvas_wrap").prepend(canvas);

const context = canvas.getContext("2d");

const scaleWidth = 20, scaleHeight = 20;

context.scale(scaleWidth, scaleHeight);

function createMesh(width, height) {
    const mesh = [];
    while (height--) {
        mesh.push(new Array(width).fill(0));
    }
    return mesh;
}
function createPiece(type) {
    if (type === "t") {
        return [
            [0, 0, 0],
            [5, 5, 5],
            [0, 5, 0]
        ];
    } else if (type === "o") {
        return [
            [7, 7],
            [7, 7]
        ];
    } else if (type === "l") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [0, 4, 4]
        ];
    } else if (type === "j") {
        return [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ];
    } else if (type === "i") {
        return [
            [0, 2, 0, 0],
            [0, 2, 0, 0],
            [0, 2, 0, 0],
            [0, 2, 0, 0]
        ];
    } else if (type === "s") {
        return [
            [0, 3, 3],
            [3, 3, 0],
            [0, 0, 0]
        ];
    } else if (type === "z") {
        return [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0]
        ];
    }
}
function points() {
    var rowCount = 1;
    outer:for (var y = area.length - 1; y > 0; --y) {
        for (var x = 0; x < area[y].length; ++x) {
            if (area[y][x] === 0) {
                continue outer;
            }
        }
        const row = area.splice(y, 1)[0].fill(0);
        area.unshift(row);
        ++y;
        player.score += rowCount * 100;
        rowCount *= 2;
    }
}
function collide(area, player) {
    const [m, o] = [player.mesh, player.pos];
    for (var y = 0; y < m.length; ++y) {
        for (var x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (area[y + o.y] && area[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function drawMesh(mesh, offset) {
    mesh.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
function merge(area, player) {
    player.mesh.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                area[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
function rotate(mesh, dir) {
    for (var y = 0; y < mesh.length; ++y) {
        for (var x = 0; x < y; ++x) {
            [
                mesh[x][y],
                mesh[y][x]
            ] = [
                mesh[y][x],
                mesh[x][y],
            ]
        }
    }
    if (dir > 0) {
        mesh.forEach(row => row.reverse());
    } else {
        mesh.reverse();
    }
}
function playerReset() {
    const pieces = "ijlostz";
    player.mesh = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (Math.floor(area[0].length / 2)) - (Math.floor(player.mesh[0].length / 2)); //spawn shape in center
    if (collide(area, player)) {
        area.forEach(row => row.fill(0));
        player.score = 0;
        gameRun = false;
    }
}
function playerDrop() { //drops piece by 1 y coord
    player.pos.y++;
    if (collide(area, player)) {
        player.pos.y--;
        merge(area, player);
        points();
        playerReset();
        updateScore();
    }
}
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(area, player)) {
        player.pos.x -= dir;
    }
}
function playerRotate(dir) {
    const pos = player.pos.x;
    var offset = 1;
    rotate(player.mesh, dir);
    while (collide(area, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.mesh[0].length) {
            rotate(player.mesh, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#080808";
    context.fillRect(0, 0, canvas.width, canvas.height);
    updateScore();
    drawMesh(area, {x: 0, y: 0});
    drawMesh(player.mesh, player.pos);
}
var dropInterval = 100;
var time = 0;

function update() {
    time++;
    if (time >= dropInterval) {
        playerDrop();
        time = 0;
    }
    draw();
}
function updateScore() {
    context.font = "bold 1px Comic Sans MS";
    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("Score:" + player.score, 0.2, 0);
}
function gameOver() {
    clearInterval(gameLoop);
    context.font = "2px Comic Sans MS";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Game Over", (canvas.width / scaleWidth) / 2, (canvas.width / scaleHeight) / 2);
    document.getElementById("start_game").disabled = false;
}
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const area = createMesh(meshWidth, meshHeight);

const player = {
    pos: {
        x: 0,
        y: 0
    },
    mesh: null,
    score: 0
};

const move = 1;
var gameLoop;
var gameRun = false;
playerReset();
draw();
gameOver();
document.addEventListener('keydown', function (e) {
    if (e.keyCode === 37) { //move left
        playerMove(-move);
    } else if (e.keyCode === 39) { //move right
        playerMove(+move);
    } else if (e.keyCode === 40) { // drop by 1
        console.log(player.pos);
        if (gameRun) {
            playerDrop();
        }
    } else if (e.keyCode === 38) { //rotate shape
        playerRotate(-move);
    }
});

document.getElementById("start_game").onclick = function () {
    gameRun = true;
    playerReset();
    console.log(player.pos);
    gameLoop = setInterval(function () {
        if (gameRun) {
            update();
        } else {
            gameOver();
        }
    }, 10);
    this.disabled = true;
};