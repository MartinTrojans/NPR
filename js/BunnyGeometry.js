THREE.BunnyGeometry = function (id, jsonGeo) {
	"use strict";

	console.assert(jsonGeo instanceof THREE.Geometry, "Unexpected type of parameters");

	if (id === "Bunny") {
		jsonGeo.normalize();
		jsonGeo.scale(6,6,6);
		jsonGeo.lookAt(new THREE.Vector3(0, 1, 0));
		jsonGeo.rotateY(270.0/180.0*3.14);
		jsonGeo.translate(0, 1, 0);
	} else if (id === "Chair") {
		var m = new THREE.Matrix4();
		m.set(-0.188,0,0,0,0,-0.188,-0,0,0,-0,-0.188,0,-0.0131,0.0135,-0.0068,1);
		jsonGeo.applyMatrix(m);
		jsonGeo.translate(0, -3, 0);
	}

	this.parameters = {
		
	};

	
	THREE.Geometry.call( this );

	this.type = 'BunnyGeometry';

	this.computeFaceNormals();
	this.computeVertexNormals();

	this.mergeVertices();

	return jsonGeo.clone();
};

THREE.BunnyGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.BunnyGeometry.prototype.constructor = THREE.BunnyGeometry;

THREE.BunnyGeometry.prototype.clone = function () {
	return new this.constructor().copy(this);
};