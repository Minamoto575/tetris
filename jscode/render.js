
//传递个gpu参数
var points = [];
var colors = [];

//canvas与格子的宽高
var W = 600, H = 800;
var gridSize = W / COLS;
//线的宽度
var lineWidth = 1;
//颜色
var COLOR1 = vec3(0, 0, 1);
var COLOR2 = vec3(0, 1, 0);
var COLOR3 = vec3(1, 0, 0);
var COLOR4 = vec3(0, 1, 1);
var COLOR5 = vec3(1, 0, 1);
var COLOR6 = vec3(1, 1, 0);
var COLOR7 = vec3(0, 0.5, 0.5);
var BLACK = vec3(0, 0, 0);

var colorArray = [ COLOR1, COLOR2, COLOR3, COLOR4, COLOR5, COLOR6, COLOR7 ];


//画一个三角形
function drawTriangle(A, B, C, color) {
    colors.push(color);
    points.push(A);
    colors.push(color);
    points.push(B);
    colors.push(color);
    points.push(C);
}

//将坐标转换到canvas的坐标系下
function changeCoordinate(x, y) {
    var newX = 2 * x / W - 1;
    var newY = 2 * y / H - 1;
    return vec2(newX, newY);
}

//画一个小方块
function drawBlock(x, y, color) {

    //先将坐标原点转换到左下角
    y = H / gridSize - y - 1;

    //求小方块的对角坐标
    var sx = x * gridSize,
        sy = y * gridSize;
    var tx = sx + gridSize,
        ty = sy + gridSize;

    //画一个矩形
    drawRectangle(sx, sy, tx, ty, color);
}

//画一个矩形
function drawRectangle(sx, sy, tx, ty, color) {
    var A = changeCoordinate(sx, sy);
    var B = changeCoordinate(sx, ty);
    var C = changeCoordinate(tx, ty);
    var D = changeCoordinate(tx, sy);
    drawTriangle(A, B, C, color);
    drawTriangle(A, D, C, color);
}

//画格子图
function drawGrids() {
    
    for (var i = 0; i < COLS; i++) {
        var x = i * gridSize;
        drawRectangle(x - lineWidth, 0, x + lineWidth, H, BLACK);
    }

    for (var i = 0; i < ROWS; i++) {
        var y = i * gridSize;
        drawRectangle(0, y - lineWidth, W, y + lineWidth, BLACK);
    }
}


function render() {
    //清空数据
    colors = [];
    points = [];

    //画全局
    for (var x = 0; x < COLS; ++x) {
        for (var y = 0; y < ROWS; ++y) {
            if (board[y][x]) {
                drawBlock(x, y, colorArray[board[y][x] - 1]);
            }
        }
    }

    //画移动的块
    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (currBlock[y][x]) {
                drawBlock(currX + x, currY + y, colorArray[currBlock[y][x] - 1]);
            }
        }
    }

    drawGrids();

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    //点缓冲区
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //颜色缓冲区
    var bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}