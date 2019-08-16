let sWidth = window.innerWidth;
let sHeight = window.innerHeight;


let primitives = ["Cross", "Polygon", "Circle", "Squiggle", "Star"];

let shapes = [];

let shape = function(x,y,r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vertex = Math.floor(Math.log2(Math.random()*33)+3);
  this.spin = Math.floor(Math.random()*360);
  this.show = function() {

    let yOffset = 0;
    let xOffset = 0;
    var step = 2*Math.PI / 120; // angle that will be increased each loop
    stroke(((theta)/(2*Math.PI))*240);
    strokeWeight(2);
    noFill();
    //ellipse(this.x,this.y,this.r*2);

    beginShape();

    yOffset = Math.sin((-this.spin/3.14)*Math.PI) * this.r*.8*2;
    xOffset = Math.cos((-this.spin/3.14)*Math.PI) * this.r*.8*2;

    for(var theta=2*Math.PI/2;  theta >= 0;  theta-=step) {
      var x = this.x - xOffset + this.r*.8*Math.cos(theta+this.spin);
      var y = this.y - yOffset- this.r*.8*Math.sin(theta+this.spin);
      stroke(((theta+Math.PI)/(2*Math.PI))*240);
      point(x,y);
      vertex(x,y);

    }
    yOffset = 0;
    xOffset = 0;
    for(var theta = 2*Math.PI/2;  theta <=2*Math.PI;  theta+=step) {
    //for(var theta = 2*Math.PI;  theta >=2*Math.PI/2;  theta-=step) {
      var x = this.x + this.r*.8*Math.cos(theta+this.spin);
      var y = this.y - this.r*.8*Math.sin(theta+this.spin);
      //vertex(x,y);

      point(x,y);
      vertex(x,y);
    }

    yOffset = Math.sin((-this.spin/3.14)*Math.PI) * this.r*.8*2 + yOffset;
    xOffset = Math.cos((-this.spin/3.14)*Math.PI) * this.r*.8*2 + xOffset;

    for(var theta=2*Math.PI/2;  theta >= 0;  theta-=step) {
      var x = this.x + xOffset + this.r*.8*Math.cos(theta+this.spin);
      var y = this.y + yOffset- this.r*.8*Math.sin(theta+this.spin);
      stroke(((theta+Math.PI)/(2*Math.PI))*240);
      point(x,y);
      vertex(x,y);

    }

    yOffset = Math.sin((-this.spin/3.14)*Math.PI) * this.r*.8*2 + yOffset;
    xOffset = Math.cos((-this.spin/3.14)*Math.PI) * this.r*.8*2 + xOffset;

    for(var theta= 2*Math.PI/2;  theta <=2*Math.PI;  theta+=step) {
      var x = this.x + xOffset + this.r*.8*Math.cos(theta+this.spin);
      var y = this.y + yOffset- this.r*.8*Math.sin(theta+this.spin);
      stroke(((theta)/(2*Math.PI))*240);
      point(x,y);
      vertex(x,y);

    }
    endShape();


    this.spin-=1/360;
  };
//Generate polygons by drawing a circle with a low vertex
/*
  this.show = function() {
    ellipse(this.x,this.y,this.r*2);
    var step = 2*Math.PI / this.vertex; // angle that will be increased each loop

    beginShape();
    for(var theta=0;  theta <= 2*Math.PI;  theta+=step) {
      var x = this.x + this.r*.8*Math.cos(theta+this.spin);
      var y = this.y - this.r*.8*Math.sin(theta+this.spin);
      vertex(x,y);
    }
    endShape();

    this.spin+=1/360;
  };
  */
/* //Sine Wave
  this.show = function() {
    ellipse(this.x,this.y,this.r*2);
    let a = 0.0;
    let inc = TWO_PI / 25.0;
    beginShape();
    push();
    rotate(this.spin*2);
    for (let i = 0; i < this.r*2; i++) {
      vertex(this.x-this.r+i * this.r/40,this.y + sin(a+this.spin) * this.r/4);
      a = a + inc;
    }
    pop();
    endShape();
    this.spin+=1/20;
  }
  */
/* //Generate polygons by drawing lines
  this.show = function() {
      ellipse(this.x,this.y,this.r*2);
      let r = this.r * (0.9**this.vertex);
      let yOffset = 0;
      let xOffset = 0;
      for (let i = 0; i < this.vertex; i++) {
        if (360*i/this.vertex < 180) {
          yOffset = Math.sin((this.spin+360*i/this.vertex)*Math.PI/180) * r + yOffset;
          xOffset = Math.cos((this.spin+360*i/this.vertex)*Math.PI/180) * r + xOffset;
        }
      }
      if (!(this.vertex % 2 === 0)) {
        xOffset-=r/2;
      }

      let x = this.x - xOffset/2;
      let y = this.y - yOffset/2;
      push();
      beginShape();
      for (let i = 0; i <= this.vertex; i++) {
        vertex(x, y);
        x = Math.cos((this.spin+360*i/this.vertex)*Math.PI/180) * r + x;
        y = Math.sin((this.spin+360*i/this.vertex)*Math.PI/180) * r + y;
      }
      endShape();
      pop();
      //console.log("show");
      this.spin++;
  }
  */
}

function placeShape() {
  let x = Math.floor(Math.random()*sWidth);
  let y = Math.floor(Math.random()*sHeight);
  let r = 40+Math.random()*20;
  return {x:x,y:y,r:r};
};

function setup() {
  createCanvas(sWidth, sHeight);
  let failedPlaces = 0;
  while (failedPlaces < 1) {
    let freeSpace = true;
    let place = placeShape();
    console.log(place);
    shapes.forEach(function(shape) {
      if (dist(place.x,place.y,shape.x,shape.y) < (place.r+shape.r)) {
        freeSpace = false;
      }
    })
    if (freeSpace) {

    let s = new shape(place.x,place.y,place.r);
    shapes.push(s);
    console.log(shapes.length);
    } else {
    failedPlaces++;
    };
};
};

function draw() {
  background(120);
  shapes.forEach(function(shape) {
    shape.show();
  })
};
