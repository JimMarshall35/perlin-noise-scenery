var floorArray, ceilingArray;
var floorColliderArray, ceilingColliderArray;
const seedsize = 1024;
var canvas, ctx;
var scroll = 0;
var last, delta;
var ceilingLastOctave, ceilingColliderLastOctave;
var floorLastOctave, floorColliderLastOctave;
var heightMagnitude = 2.1;
var octaveOffset = 2;
var Engine,World,Bodies;
var engine;

var circlebody, floorbody, ceilingbody, floorinitialposition, ceilinginitialposition;
var scrollspeed = 100;
var isMouseDown = false;

const circleradius = 30;
var ball2Mouse = null;

const maxUILength = 150;
const maxForceMagnitude = 0.25;

document.body.onload = function() {
	init();
	loop = function(){
		update();
		draw();
		window.requestAnimationFrame(loop);
	}
	last = new Date().getTime();
	loop();
	
}
function scrollMap(amount){	
	scroll += amount;
}
function update(){
	now = new Date().getTime();
	delta = (now - last)/1000;
	last = now;
	Engine.update(engine,(now - last));
	if(circlebody.position.x > canvas.width){
		Matter.Body.setVelocity(circlebody, {x:circlebody.velocity.x*-1, y:circlebody.velocity.y} );
	}

	scrollMap(-delta*scrollspeed);
}

function draw() {
	drawScrolledBackground();
	//let pos = Matter.Vector.add(circlebody.position,circlebody.velocity);
	let pos = circlebody.position;
	ctx.fillStyle = "grey";
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
	
	ctx.fill();
	drawTerrainBodyWireFrame(ceilingbody);
	drawTerrainBodyWireFrame(floorbody);
	if(ball2Mouse != null && isMouseDown){
		ctx.strokeStyle = "red";
		ctx.beginPath();
		let circlepos = new Vector2(circlebody.position.x,circlebody.position.y);
		let mousepos = circlepos.add(ball2Mouse);
		ctx.moveTo(circlepos.x,circlepos.y);
		ctx.lineTo(mousepos.x,mousepos.y);
		ctx.stroke();
	}

}
function init() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	canvas.addEventListener("mousemove",onMouseMove );
	canvas.addEventListener("mousedown", onMouseDown);
	canvas.addEventListener("mouseup", onMouseUp);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	

	let floorSeed = generateSeedArray1D(seedsize);
	let floorSeed_lowres = downsampleArray(floorSeed,8);

	let ceilingSeed = generateSeedArray1D(seedsize);
	let ceilingSeed_lowres = downsampleArray(ceilingSeed,8);

	floorArray = generatePerlin1D(floorSeed);
	floorColliderArray = generatePerlin1D(floorSeed_lowres);

	ceilingArray = generatePerlin1D(ceilingSeed);
	ceilingColliderArray = generatePerlin1D(ceilingSeed_lowres);


	floorLastOctave = floorArray.octaves[floorArray.octaves.length-1-octaveOffset];
	floorColliderLastOctave = floorColliderArray.octaves[floorColliderArray.octaves.length - 1];

	ceilingLastOctave = ceilingArray.octaves[ceilingArray.octaves.length-1-octaveOffset];
	ceilingColliderLastOctave = ceilingColliderArray.octaves[ceilingColliderArray.octaves.length-1];

	drawFloorAndCeiling("black",0);
	matterInit();
	//document.addEventListener('keydown', keyDownHandler);
}
function onMouseDown(e) {
	let mousevec = new Vector2(e.offsetX,e.offsetY);
	let mouse2ball = mousevec.subtract(circlebody.position);
	let distance = mouse2ball.getMagnitude();
	if(distance < circleradius){
		isMouseDown = true;
		console.log("mousedown");
	}
}
function onMouseUp(e) {
	isMouseDown = false;
	let magnitude = (ball2Mouse.getMagnitude()/maxUILength)*maxForceMagnitude;
	let ball2Mouse_normalized = ball2Mouse.getNormal();

	let position = new Vector2(circlebody.position.x,circlebody.position.y).add(ball2Mouse_normalized.multiplyByScalar(circleradius));
	Matter.Body.applyForce(circlebody, position, ball2Mouse_normalized.multiplyByScalar(-1 *magnitude));
	console.log("mouseup");
}
function onMouseMove(e) {
	if(isMouseDown){
		let raw_ball2mouse = new Vector2(e.offsetX,e.offsetY).subtract(circlebody.position);
		if(raw_ball2mouse.getMagnitude() > maxUILength){
			raw_ball2mouse = raw_ball2mouse.getNormal().multiplyByScalar(maxUILength);
		}
		ball2Mouse = raw_ball2mouse;
		console.log(ball2Mouse);

	}
	else{
		ball2Mouse = null;
	}

}
function matterInit(){
	Engine = Matter.Engine;
    World = Matter.World;
    Bodies = Matter.Bodies;

	engine = Engine.create();

	circlebody = Matter.Bodies.circle(canvas.width/2, canvas.height/2, circleradius);

	World.add(engine.world,circlebody)
	floorbody = generateTerrainBody(floorColliderLastOctave,canvas.width,canvas.height, canvas.height/heightMagnitude);
	floorinitialposition = {x:floorbody.position.x,y:floorbody.position.y};

	ceilingbody = generateTerrainBody(ceilingColliderLastOctave,canvas.width,0, -canvas.height/heightMagnitude);
	ceilinginitialposition = {x:ceilingbody.position.x,y:ceilingbody.position.y};
}
function generateTerrainBody(arr,width,ystart, magnitude) {
	let vertices = returnWorldSpacePoints(arr,width,ystart, magnitude);
	let center = Matter.Vertices.centre(vertices);

	console.log(vertices);
	console.log(center);
	let body;
	if(magnitude > 0){ // floor
		body = Bodies.fromVertices(center.x,center.y  -(canvas.height-center.y),vertices,{isStatic:true});
	}
	else{ // ceiling
		body = Bodies.fromVertices(center.x,center.y ,vertices,{isStatic:true});
	}
	console.log(body);

	
	World.add(engine.world, body);
	let bounds = body.bounds;
	if(magnitude > 0){ // floor
		Matter.Body.translate(body, {x:-bounds.min.x, y:ystart-bounds.max.y});
	}
	else{ // ceiling
		Matter.Body.translate(body, {x:-bounds.min.x, y:ystart-bounds.max.y});
		Matter.Body.translate(body,{x:0,y:bounds.max.y-bounds.min.y});
	}
	return body;	
}
function drawTerrainBodyWireFrame(body){
	
	ctx.strokeStyle = "green";
	for (var i = 0; i < body.parts.length; i++) {
		let part = body.parts[i];
		ctx.beginPath();
		ctx.moveTo(part.vertices[0].x,part.vertices[0].y);
		for(var j=1; j<part.vertices.length; j++){
			ctx.lineTo(part.vertices[j].x,part.vertices[j].y);
		}
		ctx.closePath();
		ctx.stroke();
	}
}
function downsampleArray(array, factor) {
	let returnarray = [];
	for (var i = 0; i < array.length; i+=factor) {
		returnarray.push(array[i]);
	}
	return returnarray;
}
function drawFloorAndCeiling(colour,xscroll){
	drawPerlin1D(
		ctx,
		colour,
		floorLastOctave,
		canvas.width,
		canvas.height,
		canvas.height/heightMagnitude,
		xscroll
	);
	drawPerlin1D(
		ctx,
		colour,
		ceilingLastOctave,
		canvas.width,
		0,
		-canvas.height/heightMagnitude,
		xscroll
	);
}
function drawScrolledBackground(){
	//console.log("scroll "+scroll);
	Matter.Body.setPosition(floorbody,{x:floorinitialposition.x+scroll,y:floorinitialposition.y});
	Matter.Body.setPosition(ceilingbody,{x:ceilinginitialposition.x+scroll,y:ceilinginitialposition.y});
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawFloorAndCeiling("black",scroll);
	
	if(scroll<0){
		drawFloorAndCeiling("black",canvas.width + scroll - 1)
	}
	else if(scroll > 0){
		drawFloorAndCeiling("black",-canvas.width +scroll + 1)
	}
	if(scroll < -canvas.width || scroll > canvas.width){
		scroll = 0;
	}

}
function keyDownHandler(e) {
	console.log(e.code);
	let change;
    switch(e.code){
    	case "KeyA":
    		scrollMap(delta*scrollspeed);
    		break;
    	case "KeyD":
    		scrollMap(-delta*scrollspeed);
    		break;
    }
} 