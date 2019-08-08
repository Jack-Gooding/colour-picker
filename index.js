// Get pixel color under the mouse.
var robot = require("robotjs");
const Database = require('better-sqlite3');

const Jimp = require('Jimp');

const db = new Database('mousePos.db', { verbose: console.log });

const createTable = db.prepare(`CREATE TABLE IF NOT EXISTS mousePos(
                    xPosition INTEGER NOT NULL,
                    yPosition INTEGER NOT NULL,
                    hexColour TEXT
)`);
createTable.run();

const insertData = db.prepare(`INSERT INTO mousePos(xPosition, yPosition, hexColour) VALUES (?, ?, ?)`);
const readData = db.prepare(`SELECT * FROM mousePOS`);
//console.log(readData.all())

var args = process.argv.slice(2);
var hex;
var mouse;
var prev = {x: 0, y:0};
var windowSize = robot.getScreenSize();
//var width = windowSize.width;
//var height = windowSize.height;
var width = 1440;
var height = 900;

var date;

let imageArrayData = [];
let heatmapData = [];

for (let i = 0; i < height; i++) {
  imageArrayData.push([]);
  heatmapData.push([]);
  for (let j = 0; j < width; j++) {
    imageArrayData[i].push([]);
    heatmapData[i].push([]);
  }
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


function averageColors(colorArray){
    var red = 0, green = 0, blue = 0;
    if (colorArray.length) {
      for (let i = 0; i < colorArray.length; i++ ){
          //rgb = Jimp.intToRGBA(0x00FF00FF);
          //console.log(hexToRgb("#0033ff").g);
          let rgb = hexToRgb(colorArray[i]);
          //console.log(rgb);
          red += rgb.r;
          green += rgb.g;
          blue += rgb.b;
      }

    //Average RGB
    red = Math.floor(red/colorArray.length);
    green = Math.floor(green/colorArray.length);
    blue = Math.floor(blue/colorArray.length);
    }

    //console.log(red + ", " + green + ", " + blue);
    //return rgbToHex(red, green, blue);
    return [red, green, blue];
}

let buildImage = function() {

  let dbData = readData.all();

  dbData.forEach(function(row) {
    imageArrayData[row.yPosition][row.xPosition].push(row.hexColour);
  });



  imageArrayData.forEach(function(row, i) {
    imageArrayData[i].forEach(function(col, j) {
      imageArrayData[i][j] = averageColors(imageArrayData[i][j]);
    })
  })


  let image = new Jimp(width, height, function (err, image) {
    if (err) throw err;


    imageArrayData.forEach((row, y) => {
      row.forEach((color, x) => {
        image.setPixelColor(Jimp.rgbaToInt(color[0],color[1],color[2],255), x, y);
        //console.log(color[0]);
      });
    });
    /*
    for (let y = 0; y < imageArrayData.length; y++) {
      for (let x = 0; x < imageArrayData[y].length; x++) {
        image.setPixelColor(Jimp.rgbaToInt(parseInt(imageArrayData[y][x].r),parseInt(imageArrayData[y][x].g),parseInt(imageArrayData[y][x].b),.5), x, y);
        console.log(imageArrayData[y][x].r,imageArrayData[y][x].g,imageArrayData[y][x].b,.5);
    }
  }
  */

  date = new Date();
  date.toISOString();

    image.write(`pictures/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.png`, (err) => {
      if (err) throw err;
    });
  });
  //console.log(imageArrayData);
}

if (args[0] === "build") {
buildImage();
}





while(args[0] != "build") {

// Get mouse position.
  let inBounds = true;
  mouse = robot.getMousePos();
  if (mouse.y >= height) {
    mouse.y = height;
    inBounds = false;
  }
  if (mouse.x >= width) {
    mouse.x = width;
    inBounds = false;
  }
  if (mouse.x === prev.x && mouse.y === prev.y) {
    inBounds = false;
  }

  if (inBounds) {
  // Get pixel color in hex format.
    hex = robot.getPixelColor(mouse.x, mouse.y);
    //console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
    insertData.run(mouse.x,mouse.y,`#${hex}`);
    prev.x = mouse.x;
    prev.y = mouse.y;
  }

};

/*
// get the average color of two hex colors.
function avgcolor(color1,color2){
    var avg  = function(a,b){ return (a+b)/2; },
        t16  = function(c){ return parseInt((''+c).replace('#',''),16) },
        hex  = function(c){ var t = (c>>0).toString(16);
                           return t.length == 2 ? t : '0' + t },
        hex1 = t16(color1),
        hex2 = t16(color2),
        r    = function(hex){ return hex >> 16 & 0xFF},
        g    = function(hex){ return hex >> 8 & 0xFF},
        b    = function(hex){ return hex & 0xFF},
        res  = '#' + hex(avg(r(hex1),r(hex2)))
                   + hex(avg(g(hex1),g(hex2)))
                   + hex(avg(b(hex1),b(hex2)));
    return res;
}

// e.g.
avgcolor('#ffffff','#000000'); */
