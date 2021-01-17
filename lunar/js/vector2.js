class Vector2{

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	subtract(v) {
		return new Vector2(this.x - v.x, this.y - v.y);
	}

	add(v) {
		return new Vector2(this.x + v.x, this.y + v.y);
	}
	multiplyByScalar(s){
		return new Vector2(this.x*s, this.y*s);
	}
	rotate(angle) {
		let x1 = this.x;
		let y1 = this.y;
		let x = Math.cos(angle) * x1 - Math.sin(angle) * y1;
		let y = Math.sin(angle) * x1 + Math.cos(angle) * y1;
		return new Vector2(x, y);
	}
	getMagnitude() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}

	getNormal() {
		let magnitude = this.getMagnitude();
		return new Vector2(this.x / magnitude, this.y / magnitude);
	}
	Lerp(v,t){
		var retx = this.x * (1 - t) + v.x*t;
		var rety = this.y * (1 - t) + v.y*t;
		return new Vector2(retx, rety);
	}
	getSignedAngle(v){
		return Math.atan2(this.det(v), this.dot(v));
	}
	getUnsignedAngle(v){
		return Math.acos((this.dot(v)) / (this.getMagnitude()*v.getMagnitude()));
	}
	dot(v){
		return this.x * v.x + this.y * v.y;
	}
	det(v){
		return this.x * v.y - this.y * v.x;
	}

}