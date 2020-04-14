// Required by Webpack - do not touch
require.context('../', true, /\.(html|json|txt|dat)$/i)
require.context('../images/', true, /\.(gif|jpg|png|svg|eot|ttf|woff|woff2)$/i)
require.context('../stylesheets/', true, /\.(css|scss)$/i)

// JavaScript
import 'bootstrap'
console.log('loading javascript...')

// insert the navigation bar into the header
function insertHeader() {
  let header = document.querySelector('header')
  header.innerHTML = (`
  <nav class="navbar navbar-expand-sm navbar-dark bg-dark text-light">
    <a class="navbar-brand" href="index.html">Pretty Screen</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item active">
          <a class="nav-link" href="index.html">Home</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Screensavers
          </a>
          <div class="dropdown-menu bg-secondary" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="orbs.html">Orbs</a>
            <a class="dropdown-item" href="matrix.html">Matrix</a>
            <a class="dropdown-item" href="floating-text.html">Floating Text</a>
            <a class="dropdown-item" href="scene.html">Scene</a>
          </div>
        </li>
      </ul>
    </div>
  </nav>
  `)
  console.log('inserted header navbar element')
}


// functions that we will use for the canvas...
let updateCanvasSize = function(cvs) {
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight - 200; 
}
let resetCanvas = function(cvs, context, style) {
  // reset canvas
  context.clearRect(0, 0, cvs.width, cvs.height)
  context.beginPath()
  context.fillStyle = style;
  context.fillRect(0, 0, cvs.width, cvs.height)
}
//////////////
// PAINTERS //
//////////////

/////////////////////
//// ORB PAINTER ////
/////////////////////
let numOrbs = 10 
let randomColors = true 
let darkTheme = true 
let orbs = []
// useful methods
let randomColor = function() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}
let makeOrb = function(cvs) {
  let orbR = Math.floor(10 + Math.random()*30)
  let orbX = orbR + Math.floor(Math.random() * (cvs.width - orbR * 2))
  let orbY = orbR + Math.floor(Math.random() * (cvs.height - orbR * 2))
  let orbVX = 2 - Math.random() * 4
  let orbVY = 2 - Math.random() * 4
  var orbColor = randomColor()
  return { r: orbR, x: orbX, y: orbY, vX: orbVX, vY: orbVY, c: orbColor }
}
let drawOrb = function(cvs, ctx, orb) {
  // set the orb color and shadow color
  if(randomColors) ctx.fillStyle = orb.c
  else if(darkTheme) ctx.fillStyle = 'white'
  else ctx.fillStyle = 'black'
  ctx.shadowBlur = 20
  ctx.shadowColor = ctx.fillStyle
  // draw the orb
  ctx.beginPath()
  ctx.moveTo(orb.x, orb.y)
  ctx.arc(orb.x, orb.y, orb.r, 0, 2 * Math.PI)
  ctx.fill()
}
let updateBallVelocity = function(cvs, ctx, orb) {
  let vel = orb.vX * orb.vX + orb.vY + orb.vY
  let ratio = 1.000
  const min = 0.001
  const max = 2.0
  if(vel < Math.pow(min, 2)) {
    ratio = 1.001
  } else if(vel > Math.pow(max, 2)) {
    ratio = 0.99
  }
  orb.vX *= ratio
  orb.vY *= ratio
}
let updateWallCollisions = function(cvs, ctx, orb) {
  if((orb.x + orb.r > cvs.width && orb.vX > 0) || (orb.x - orb.r < 0 && orb.vX < 0)) {
    // horizontal wall collision
    orb.vX *= -1 
  }
  if((orb.y + orb.r > cvs.height && orb.vY > 0) || (orb.y - orb.r < 0 && orb.vY < 0)) {
    // vertical wall collision
    orb.vY *= -1;
  }
}
let updateBallCollisions = function(cvs, ctx, orb1, orb2) {
  let dx = orb1.x - orb2.x;
  let dy = orb1.y - orb2.y;
  var dis = dx * dx + dy * dy;
  // if there is a collision...
  if (dis < Math.pow(orb1.r + orb2.r, 2)) {
    // update ONE of the orb's velocity
    // proportional to the size difference
    // (the other orb will update later)
    // note: I was completely guessing with this math
    // and I'm surprised it even works
    let ratio = 0.015 * (orb2.r / orb1.r)
    orb1.vX += (orb1.x - orb2.x) * ratio
    orb1.vY += (orb1.y - orb2.y) * ratio
  }
}

// the actual orb painter
let orbPainter = {
  prepare: function(cvs, ctx) {
    resetCanvas(cvs, ctx, darkTheme ? '#222' : '#eee')
    numOrbs = document.getElementById('orb-count').value
    randomColors = document.getElementById('orb-colors').checked
    darkTheme = document.getElementById('orb-dark-mode').checked
    // generate random orbs
    orbs = []
    for(let i = 0; i < numOrbs; i++) {
      orbs.push(makeOrb(cvs))
    }
  },
  tick: function(cvs, ctx) {
    resetCanvas(cvs, ctx, darkTheme ? '#222' : '#eee')
    if(orbs.length > 0) {
      // check for collisions for each orb
      for(let j in orbs) {
        updateWallCollisions(cvs, ctx, orbs[j])
        for(let k in orbs) {
          if(j != k) {
            updateBallCollisions(cvs, ctx, orbs[j], orbs[k])
          }
        }  
      }
      // update positions and draw orbs
      for(let m in orbs) {
        let orb = orbs[m]
        // apply friction
        updateBallVelocity(cvs, ctx, orb)
        // update positions
        orb.x += orb.vX
        orb.y += orb.vY
        drawOrb(cvs, ctx, orb)
      }
    }
  },
  onFormChange: function(event) {
    // add or remove orbs based on new form input
    let nextNumOrbs = document.getElementById('orb-count').value
    let diffNumOrbs = Math.abs(nextNumOrbs - numOrbs)
    while(numOrbs != nextNumOrbs) {
      if(nextNumOrbs > numOrbs) {
        orbs.push(makeOrb(cvs))
        numOrbs++
      } else if(nextNumOrbs < numOrbs) {
        orbs.pop()
        numOrbs--
      }
    }
    // update colors and theme based on form input
    randomColors = document.getElementById('orb-colors').checked
    darkTheme = document.getElementById('orb-dark-mode').checked
  }
}

////////////////////////
//// MATRIX PAINTER ////
////////////////////////
let matrices = []
let matrixBGColor = '#222'
let matrixTextColor = '#66ff66'
const textSize = 11
const textStartY = -500
const numChangeChance = 0.1
const newMatrixChance = 0.08
// functions we need
let makeMatrix = function(cvs, ctx, atTop) {
  // determine values
  let posX = Math.floor(Math.random() * cvs.width)
  let posY = atTop ? textStartY : Math.floor(Math.random() * (cvs.height - textStartY)) + textStartY
  let depth = 1+ Math.floor(Math.random() * 3)
  let len = 4 + Math.ceil(Math.random() * 12)
  let contents = ''
  for(let i = 0; i < len; i++) {
    contents += Math.round(Math.random())
  }
  // build the matrix object
  return { x: posX, y: posY, d: depth, t: contents, l: len }
}

let drawMatrix = function(cvs, ctx, m) {
  let fontSize = Math.ceil(textSize * m.d)
  ctx.font = fontSize + 'px Courier'
  ctx.shadowColor = matrixTextColor
  ctx.shadowBlur = m.d * 5
  // go through each character and randomly change some of them
  let newText = ''
  for(let i = 0; i < m.l; i++) {
    newText += Math.random() < numChangeChance ? Math.round(Math.random()) : m.t.charAt(i)
  }
  m.t = newText
  // draw each character
  for(let j = 0; j < m.l - 1; j++) {
    let alpha = Math.ceil((j + 2) * 13)
    ctx.fillStyle = matrixTextColor + alpha.toString(16)
    ctx.fillText(m.t.charAt(j), m.x, m.y + (fontSize * j))
  }
  // draw the last character slightly different
  ctx.font = 'bold ' + ctx.font
  ctx.fillStyle = matrixTextColor
  ctx.shadowBlur = m.d * 10
  ctx.fillText(m.t.charAt(m.l - 1), m.x, m.y + (fontSize * (m.l - 1)))
}

// the actual matrix painter
let matrixPainter = {
  prepare: function(cvs, ctx) {
    resetCanvas(cvs, ctx, '#222')
    // add a random number of matrices to begin with
    let numMatrices = 20 + Math.floor(Math.random() * 10)
    for(let i = 0; i < numMatrices; i++) {
      matrices.push(makeMatrix(cvs, ctx, false))
    }
  },
  tick: function(cvs, ctx) {
    resetCanvas(cvs, ctx, '#222')
    // move and draw all matrices
    for(let i in matrices) {
      let m = matrices[i]
      m.y += m.d
      drawMatrix(cvs, ctx, m)
    }
    // remove any that are too far down
    for(let j in matrices) {
      if(matrices[j].y > cvs.height + 10) {
        matrices.splice(j, 1)
      }
    }
    // every few seconds, add a new one
    if(Math.random() < newMatrixChance) {
      matrices.push(makeMatrix(cvs, ctx, true))
    }
  },
  onFormChange: function(event) {
    // TODO
  }
}





///////////////////////
//// SCENE PAINTER ////
///////////////////////
let skyColors = [ '#87CEFA', '#F0F8FF' ]
let groundColors = [ '#6E441F', '#422A15' ]
let trees = []
let numTrees = 24 // TODO link to form
let numTreeLayers = 5 // TODO link to form
let groundHeight = 0
let clouds = []
const cloudW = 50
const cloudH = 20
const cloudChance = 0.004
let cloudSpeed = 0.1
let birds = []
const birdW = 2
const birdSpeed = 0.6
const birdChance = 0.005 // TODO link to form

// functions we will use
let drawSky = function(cvs, ctx) {
  let c = ctx.createLinearGradient(0, 0, 0, cvs.height)
  c.addColorStop(0, skyColors[0])
  c.addColorStop(1, skyColors[1])
  ctx.fillStyle = c
  ctx.fillRect(0, 0, cvs.width, cvs.height)
}
let drawGround = function(cvs, ctx) {
  let c = ctx.createLinearGradient(0, 0, 0, cvs.height)
  c.addColorStop(0, groundColors[0])
  c.addColorStop(1, groundColors[1])
  ctx.fillStyle = c
  ctx.fillRect(0, cvs.height - groundHeight, cvs.width, groundHeight)
}
let drawTree = function(cvs, ctx, x, y, bg) {
  let tw = 20 // trunk width
  let th = 20 // trunk height
  let lw = 40 // leaf width
  let lh = 80 // leaf height
  let lx = ((lw - tw) / 2) // bottom left x
  // draw trunk
  ctx.fillStyle = '#5e4026'
  ctx.fillRect(x, y - th, tw, th)
  ctx.fillStyle = bg ? 'forestgreen' : 'darkgreen'
  ctx.beginPath();
  ctx.moveTo(x - lx, y - th);
  ctx.lineTo(x + tw / 2, y - th - lh);
  ctx.lineTo(x + tw + lx, y - th);
  ctx.fill();
}
let drawTrees = function(cvs, ctx) {
  for(let h = 0; h < numTreeLayers; h++) {
    for(let i = 0; i < numTrees; i++) {
      let sectionHeight = (groundHeight + 50) / numTreeLayers
      let x = (cvs.width / (numTrees - 3 * (h % 3))) * i
      let y = (cvs.height - groundHeight + sectionHeight * h) + (trees[h][i] % sectionHeight)
      drawTree(cvs, ctx, x, y, h % 2 == 1)
    }
  }
}
let makeBird = function(cvs) {
  let posY = 1000 * Math.random()
  return { x: 0, y: posY }
}
let drawBird = function(cvs, ctx, b) {
  let by = 10 + b.y % Math.floor(cvs.height - groundHeight - 100)
  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(b.x, by)
  ctx.arc(b.x, by, birdW, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  const wingSpeed = 0.6
  const wingSpan = birdW * 2.5
  let wingY = by + Math.sin(b.x * wingSpeed) * wingSpan
  ctx.moveTo(b.x - wingSpan, wingY)
  ctx.lineTo(b.x, by)
  ctx.lineTo(b.x + wingSpan, wingY)
  ctx.stroke()
}
let drawBirds = function(cvs, ctx) {
  for(let i in birds) {
    birds[i].x += birdSpeed
    // remove birds that are no longer on the screen
    if(birds[i].x + birdW > cvs.width) {
      birds.splice(i, 1)
    }
  }
  for(let i in birds) {
    drawBird(cvs, ctx, birds[i])
  }
}
let makeCloud = function(cvs, atRight) {
  let width = cloudW + Math.floor(20 * Math.random())
  let height = cloudH + Math.floor(30 * Math.random())
  let posX = atRight ? cvs.width + width : Math.floor(Math.random() * cvs.width)
  let posY = 1000 * Math.random()
  // build the cloud object
  return { x: posX, y: posY, w: width, h: height }
}
let drawCloud = function(cvs, ctx, cl) {
  ctx.fillStyle = '#ffffffaa'
  ctx.beginPath()
  ctx.moveTo(cl.x, cl.y)
  ctx.ellipse(cl.x, cl.y % (cvs.height - groundHeight - cloudH), cl.w, cl.h, 0, 0, 2 * Math.PI)
  ctx.fill()
}
let drawClouds = function(cvs, ctx) {
  for(let i in clouds) {
    clouds[i].x -= (cloudSpeed * (1 + clouds[i].y % 3))
    // remove clouds that are no longer on the screen
    if(clouds[i].x + clouds[i].w * 2 < 0) {
      clouds.splice(i, 1)
    }
  }
  for(let i in clouds) {
    drawCloud(cvs, ctx, clouds[i])
  }
}



// the actual painter
let scenePainter = {
  prepare: function(cvs, ctx) {
    resetCanvas(cvs, ctx, 'white')
    // add trees
    for(let i = 0; i < numTreeLayers; i++) {
      let tarray = []
      for(let j = 0; j < numTrees; j++) {
        let y = 1000 * Math.random()
        tarray.push(y)
      }
      trees.push(tarray)
    }
    // add clouds
    for(let i = 0; i < 8; i++) {
      clouds.push(makeCloud(cvs, false))
    }
    birds.push(makeBird(cvs))
  },
  tick: function(cvs, ctx) {
    resetCanvas(cvs, ctx, 'white')
    // update how much space is taken up by the ground
    groundHeight = (cvs.height * 1) / 3
    drawSky(cvs, ctx)
    // move and draw clouds
    drawClouds(cvs, ctx)
    // move and draw birds
    drawBirds(cvs, ctx)
    // draw ground and trees
    drawGround(cvs, ctx)
    drawTrees(cvs, ctx)
    // occasionally add clouds
    if(Math.random() < cloudChance) {
      clouds.push(makeCloud(cvs, true))
    }
    // occasionally add birds
    if(Math.random() < birdChance) {
      birds.push(makeBird(cvs))
    }
  },
  onFormChange: function(event) {
    // TODO
  }
}

///////////////////////
//// CANVAS LOADER ////
///////////////////////
let painter = null
let intervalVar = null
const timer = 40
// attempt to load a screensaver
console.log('attempting to load canvas...')
let cvs = document.querySelector("canvas")
if(cvs != null && cvs.hasAttribute('id')) {
  console.log('loaded canvas successfully')
  console.log('attempting to load painter...')
  // determine which painter to use
  if(cvs.getAttribute('id') == "canvas-orbs") {
    painter = orbPainter;
    console.log('loaded orb painter')
  }
  if(cvs.getAttribute('id') == "canvas-matrix") {
    painter = matrixPainter;
    console.log('loaded matrix painter')
  }
  if(cvs.getAttribute('id') == "canvas-scene") {
    painter = scenePainter;
    console.log('loaded scene painter')
  }

  // if this screen has a painter, load and register interval
  if(painter != null && cvs.getContext("2d")) {
    let ctx = cvs.getContext("2d")
    ctx.save()
    // update canvas size
    updateCanvasSize(cvs)
    // prepare the current painter
    painter.prepare(cvs, ctx)
    // schedule update to the painter every 40 ms
    intervalVar = window.setInterval(function() {
      painter.tick(cvs, ctx)
    }, timer);
    // listen for window resizing
    document.body.onresize = function() {
       updateCanvasSize(cvs)
    }
  }
} else {
  console.log('no canvas element found, skipping')
}

// stop the current interval
let resetInterval = function() {
  clearInterval(intervalVar)
  ctx.restore()
}

//////////////////////////
// ALWAYS RUN THIS CODE //
//////////////////////////

////////////
// HEADER //
////////////
insertHeader()
document.body.classList.add('bg-dark')

///////////
// FORMS //
///////////
function reloadOnChange(ids) {
  for(let e of ids) {
    let formInput = document.getElementById(e)
    if(formInput) {
      formInput.onchange = painter.onFormChange
    }
  }
}

// ORBS //
reloadOnChange(['orb-count', 'orb-colors', 'orb-dark-mode'])
