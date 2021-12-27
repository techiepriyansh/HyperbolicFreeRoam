const blueness = 0.6;

const waterColor = '#74ccf4';
const landColor = '#41980a';

const collisionColor = '#b00b69';

var randomColor = function () {
  return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
};

var perlinColor = (i, j) => {
  var color = noise(i,j);
  if(color >= blueness )
    return landColor;
  else
    return waterColor;
}

var sketch = function (canvas) {
  var keysDown = {};
  var keysUp = {};

  var ctx = canvas.getContext();
  var defaultProperties = {
    lineDash: [],
    lineJoin: 'round',
    lineWidth: 2,
    shadowBlur: 20,
    shadowColor: 'white',
    strokeStyle: '#DD4814',
    fillStyle: '#333333',
  };

  canvas.setContextProperties(defaultProperties);

  var heading = HyperbolicCanvas.Angle.random();
  var headingIncrement = Math.TAU / 100;
  var velocity = 0;
  var velocityIncrement = .002;
  var maxVelocity = .05;

  var wingAngle = Math.TAU / 3;

  var s = 0.1;

  var tileX;
  var tileY;

  var colors = [];
  for(var i=-(1/s)-1;i<=(1/s);i++){
    let color = [];
    for(var j=-(1/s)-1;j<=(1/s);j++){
      color.push(perlinColor(i+1/s+1,j+1/s+1));
    }
    colors.push(color);
  }
  
  var location = HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
    0.001,
    HyperbolicCanvas.Angle.opposite(heading)
  );
  var front;

  var drawShip = function () {
    front = location.hyperbolicDistantPoint(.1, heading);
    var left = location.hyperbolicDistantPoint(.05, heading + wingAngle);
    var right = location.hyperbolicDistantPoint(.05, heading - wingAngle);

    // draw heading line
    canvas.setContextProperties({
      lineDash: [5],
      lineWidth: 1,
      shadowBlur: 0,
      strokeStyle: 'white'
    });
    var path = canvas.pathForHyperbolic(
      HyperbolicCanvas.Line.givenTwoPoints(front.hyperbolicSubtract(location), location.hyperbolicDistantPoint(30).hyperbolicSubtract(location))
    );
    canvas.stroke(path);
    canvas.setContextProperties(defaultProperties);

    // draw ship
    path = canvas.pathForHyperbolic(HyperbolicCanvas.Polygon.givenVertices([
      front.hyperbolicSubtract(location),
      left.hyperbolicSubtract(location),
      // location.hyperbolicSubtract(location),
      right.hyperbolicSubtract(location),
    ]));
    canvas.fill(path);
  };

  var drawRectangle = function () {
    var path;
    for(var i=-(1/s)-1;i<=(1/s);i++){
      for(var j=-(1/s)-1;j<=(1/s);j++){
        var col = colors[i+(1/s)+1][j+(1/s)+1];
        if (i == tileX && j == tileY && col == landColor) {
          col = collisionColor;
        }
        var ur = HyperbolicCanvas.Point.givenCoordinates((2*i+1)*(s/2),(2*j+1)*(s/2));
        var ul = HyperbolicCanvas.Point.givenCoordinates((2*i-1)*(s/2),(2*j+1)*(s/2));
        var bl = HyperbolicCanvas.Point.givenCoordinates((2*i-1)*(s/2),(2*j-1)*(s/2));
        var br = HyperbolicCanvas.Point.givenCoordinates((2*i+1)*(s/2),(2*j-1)*(s/2));

        canvas.setContextProperties({ strokeStyle: col , fillStyle: col});
        path = canvas.pathForHyperbolic(HyperbolicCanvas.Polygon.givenVertices([
          ur.hyperbolicSubtract(location),
          ul.hyperbolicSubtract(location),
          bl.hyperbolicSubtract(location),
          br.hyperbolicSubtract(location),
        ]));
        canvas.fill(path);  
      }
    }
  };


  var checkCollision = function () {
    var x = location.getX();
    var y = location.getY();

    tileX = Math.floor((2*x/s + 1) / 2);
    tileY = Math.floor((2*y/s + 1) / 2);
  }

  var render = function (event) {
    canvas.clear();
    drawRectangle();
    drawShip();
  };

  var shouldRender = true;
  var fn = function () {
    if (shouldRender) {
      shouldRender ^= true;
      requestAnimationFrame(fn);
      return;
    }
    shouldRender ^= true;
    boost = 16 in keysDown ? 3 : 1;

    if (37 in keysDown || 65 in keysDown) {
      heading += headingIncrement * boost;
    }
    if (39 in keysDown || 68 in keysDown) {
      heading -= headingIncrement * boost;
    }

    if (38 in keysDown || 87 in keysDown) {
      if (velocity < maxVelocity) {
        velocity += velocityIncrement * boost;
      }
    }
    if (40 in keysDown || 83 in keysDown) {
      if (velocity > 0) {
        velocity -= velocityIncrement;
        if (velocity < 0) {
          velocity = 0;
        }
      }
    }

    location = location.hyperbolicDistantPoint(velocity, heading);
    heading = location.getDirection();
    velocity *= .99;

    checkCollision();
    
    render();
    requestAnimationFrame(fn);
  };

  fn();

  addEventListener('keydown', function (e) {
    keysDown[e.keyCode] = true;
  }, false);

  addEventListener('keyup', function (e) {
    delete keysDown[e.keyCode];
  }, false);
};

function setup() {
  noCanvas();
  var _canvas = HyperbolicCanvas.create('#hyperbolic-canvas');
  sketch(_canvas);
}
