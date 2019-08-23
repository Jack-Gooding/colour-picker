// Get pixel color under the mouse.
var robot = require("robotjs");
const Database = require('better-sqlite3');

const Jimp = require('Jimp');

const db = new Database('mousePos.db'); // ,{ verbose: console.log }

const createTable = db.prepare(`CREATE TABLE IF NOT EXISTS mousePos(
                    xPosition INTEGER NOT NULL,
                    yPosition INTEGER NOT NULL,
                    hexColour TEXT
)`);
createTable.run();

let updates = 0;

const insertData = db.prepare(`INSERT INTO mousePos(xPosition, yPosition, hexColour) VALUES (?, ?, ?)`);
const readData = db.prepare(`SELECT * FROM mousePOS`);
const insertMany = db.transaction((data) => {
  for (const row of data) {
    insertData.run(row.xPosition, row.yPosition, row.hexColour);
  }
  updates++;
  console.log(`Database updated: ${updates}`)
});
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

let dataStore = [];

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

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function averageColors(colorArray){
    var red = 0, green = 0, blue = 0;
    if (colorArray.length) {
      for (let i = 0; i < colorArray.length; i++ ){

          let rgb = hexToRgb(colorArray[i]);

          red += rgb.r;
          green += rgb.g;
          blue += rgb.b;
      }

    //Average RGB
    red = Math.floor(red/colorArray.length);
    green = Math.floor(green/colorArray.length);
    blue = Math.floor(blue/colorArray.length);
    }

    return [red, green, blue];
}

let buildImage = function() {

  let dbData = readData.all();
  console.log(`Database Rows: ${dbData.length}`);
  dbData.forEach(function(row) {
    imageArrayData[row.yPosition][row.xPosition].push(row.hexColour);
  });



  imageArrayData.forEach(function(row, i) {
    imageArrayData[i].forEach(function(col, j) {
      heatmapData[i][j] = imageArrayData[i][j].length;
      imageArrayData[i][j] = averageColors(imageArrayData[i][j]);
    })
  })


  let image = new Jimp(width, height, function (err, image) {
    if (err) throw err;


    imageArrayData.forEach((row, y) => {
      row.forEach((color, x) => {
        image.setPixelColor(Jimp.rgbaToInt(color[0],color[1],color[2],255), x, y);
      });
    });


  date = new Date();
  date.toISOString();

    image.write(`pictures/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}_colourmap.png`, (err) => {
      if (err) throw err;
    });
  });


  let heatmap = new Jimp(width, height, function (err, image) {
    if (err) throw err;

    let mostHits = 0;

    heatmapData.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color > mostHits) {
          mostHits = color;
        }
      });
    });

    console.log(`Most Active Pixel: ${mostHits}`);

    heatmapData.forEach((row, y) => {
      row.forEach((color, x) => {
        let percent = scale(color, 0, mostHits, 0, 255);
        percent = scale(Math.sqrt(percent), 0 , Math.sqrt(percent)+1, 0, 255);
        image.setPixelColor(Jimp.rgbaToInt(255,255-percent,255-percent,255), x, y);
      });
    });


  date = new Date();
  date.toISOString();

    image.write(`pictures/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}_heatmap.png`, (err) => {
      if (err) throw err;
    });
  });

}






let recordMouse = function() {
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
      prev.x = mouse.x;
      prev.y = mouse.y;

      dataStore.push({xPosition: mouse.x,
                      yPosition: mouse.y,
                      hexColour: `#${hex}`
                    });

      if (dataStore.length > 50) {
        insertMany(dataStore);
        dataStore = [];
      };
    }

};

if (args[0] === "build") {
  buildImage();
} else {
  setInterval(function() {
    recordMouse();
  },20);
}
