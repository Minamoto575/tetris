
var COLS = 15, ROWS = 20;//游戏界面20*10个格子

var board = [];//游戏面板，二维数组

var iflose;//是否输了

var intervalMove;//块位置更新间隔

var intervalRender;//绘图间隔

var currBlock;//当前块的位置 4*4数组

var currX, currY; //当前移动的距离

var freezed; //当前移动的块是否固定

var score = 0;//玩家得分

//七种形状的块
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];


//随机生成某种形状的块
function newShape() {

    //随机生成一个整数id
    var id = Math.floor(Math.random() * shapes.length);
    //某个形状的块
    var shape = shapes[ id ]; 

    currBlock = [];
    for ( var y = 0; y < 4; ++y ) {
        currBlock[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;

            //4*4数组记录的形状号，以及对应的颜色号
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                currBlock[ y ][ x ] = id + 1;
            }
            else {
                currBlock[ y ][ x ] = 0;
            }

        }
    }
    
    //初始不固定
    freezed = false;
    // 出发点
    currX = 5;
    currY = 0;
}

//初始化，清空游戏板面
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

//保持块的下移
function move() {
    //没触碰到边界则下移
    if ( valid( 0, 1 ) ) {
        ++currY;
    }
    // 触碰到边界
    else {

        //固定
        freeze();
        valid(0, 1);
        clearLines();

        if (iflose) {
            clearAllIntervals();
            alert("game over!");
            return false;
        }
        newShape();
    }
}

//停止块的移动并固定
function freeze() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( currBlock[ y ][ x ] ) {
                board[ y + currY ][ x + currX ] = currBlock[ y ][ x ];
            }
        }
    }
    freezed = true;
}

//旋转变换
function rotate( currBlock ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = currBlock[ 3 - x ][ y ];
        }
    }
    return newCurrent;
}

//清除一行填满的格子
function clearLines() {

    for (var y = ROWS - 1; y >= 0; --y) {

        //是否有行填满
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        //填满则下降一行
        if ( rowFilled ) {
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            score += 10;
            ++y;
        }
    }
    document.getElementById("score").innerText = score;
}

//键盘操作
function keyPressed( key ) {
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) )  currX--; 
            break;
        case 'right':
            if ( valid( 1 ) )  currX++;
            break;
        case 'down':
            if ( valid( 0, 1 ) )  currY++;
            break;
        case 'rotate':
            var rotated = rotate( currBlock );
            if ( valid( 0, 0, rotated ) ) currBlock = rotated;
            break;
    }
}

//开始按钮
function startButtonClicked() {
    newGame();
    document.getElementById("startButton").disabled = true;
}


//停止间隔执行
function clearAllIntervals(){
    clearInterval( intervalMove );
    clearInterval( intervalRender );
}

//新游戏
function newGame() {
    clearAllIntervals();
    score = 0;
    document.getElementById("score").innerText = score;

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    intervalRender = setInterval(render, 50);
    intervalMove = setInterval(move, 500);
    init();
    newShape();
    iflose = false;
}

//检测移动变化是否合法
function valid(xChanged, yChanged, newCurrent) {

    xChanged = xChanged || 0;
    yChanged = yChanged || 0;

    //新的坐标变化
    xChanged = currX + xChanged;
    yChanged = currY + yChanged;
    newCurrent = newCurrent || currBlock;

    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (newCurrent[y][x]) {
                if (typeof board[y + yChanged] == 'undefined'
                    || typeof board[y + yChanged][x + xChanged] == 'undefined'
                    || board[y + yChanged][x + xChanged]
                    || x + xChanged < 0
                    || y + yChanged >= ROWS
                    || x + xChanged >= COLS) {

                    //固定在最上一行就输了
                    if (yChanged == 1 && freezed) {
                        iflose = true;
                        document.getElementById('startButton').disabled = false;
                    }
                    return false;
                }
            }
        }
    }
    return true;
}
//键盘控制
document.onkeypress = function (e) {

    var keys = {
        "w": "rotate",
        "a": "left",
        "s": "down",
        "d": "right"
    };
    var keyCode = e.key;
    if ( typeof keys[keyCode] != 'undefined') {
        keyPressed(keys[keyCode]);
        //键盘按一次则应该重新绘图
        render();
    }
}
