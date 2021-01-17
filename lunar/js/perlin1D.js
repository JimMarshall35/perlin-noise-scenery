
function generateSeedArray1D(size) {
	let seedarray = [];
	for (var i = 0; i < size; i++) {
		seedarray.push(Math.random());
	}
	return seedarray;
}
function returnWorldSpacePoints(arr,width,ystart, magnitude){
	let rlist = [];
	for (var j = 0; j <2 ; j++) {
		for(let i=0; i<arr.length; i++){
			let fraction = i/arr.length;
			let x = j*width+(fraction * width);
			let y = ystart - arr[i]*magnitude;
			rlist.push({x : x,y : y});
		}
	}
	
	rlist.push({x:width*2, y:ystart});
	rlist.push({x:0, y:ystart});
	return rlist;
}
function generatePerlin1D(seed, max=1.0, bias=1.7){
	
	let perlin = {seed:[],octaves:[],scaledseed:[]}
	perlin.seed = seed;

	let perlinnoise = new Array(perlin.seed.length).fill(0);
	let octaves = [];
	let scalefactor = 1.0;
	let scalefactor_acc = 0;
	let samplingpitch = perlin.seed.length;
	while(samplingpitch>=1){
		scalefactor_acc += scalefactor;
		let octave = [];
		let samples = [];
		let index = 0;
		let prev_index = 0;
		let _break = false;
		while(true){	
			function lerp(v0,v1,t){
				return (1 - t) * v0 + t * v1;
			}			
			if(_break){
				break;
			}
			index += samplingpitch;
			if(index >= perlin.seed.length){
				index = 0;
				_break = true;
			}
			for(let i=0; i<samplingpitch;i++){
				let fraction = i/samplingpitch;
				octave.push(lerp(perlin.seed[prev_index],perlin.seed[index],fraction)*scalefactor);
			}
			prev_index = index;
		}
		
		samplingpitch /= 2;
		scalefactor /= bias;
		octaves.push(octave);
		//console.log(octave);
	}
	for (var i = 0; i < octaves.length; i++) {
		let octave = octaves[i];
		console.log(octave.length);
		for (var j = 0; j < octave.length; j++) {
			perlinnoise[j] += (octave[j] / scalefactor_acc)*max;

		}
		perlin.octaves.push(perlinnoise.slice());
	}
	//console.log(perlin);
	return perlin;
}
function drawPerlin1D(ctx,colour,arr,width,ystart, magnitude, scroll=0, filled = true) {
	ctx.strokeStyle = colour;
	ctx.fillStyle = colour;
	ctx.beginPath();
	
	for(let i=0; i<arr.length; i++){
		let fraction = i/arr.length;
		let x = scroll + (fraction * width);
		let y = ystart - arr[i]*magnitude;
		ctx.lineTo(x,y);
	}
	if(filled){
		ctx.lineTo(width+ scroll, ystart);
		ctx.lineTo(0 + scroll,ystart);
		ctx.closePath();
		ctx.fill();
	}
	ctx.stroke();
}
function drawSeedScaled(ctx,colour,arr,width,height, scalefactor){
	ctx.strokeStyle = colour;
	ctx.fillStyle = colour;
	ctx.beginPath();
	
	for(let i=0; i<arr.length; i++){
		let fraction = i/arr.length;
		let x = fraction * width;
		let y = (height/2) - arr[i] * scalefactor;
		ctx.lineTo(x,y);
	}
	ctx.stroke();
}