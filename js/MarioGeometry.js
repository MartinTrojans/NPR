THREE.MarioGeometry = function (jsonGeo) {
	"use strict";
	console.assert(jsonGeo instanceof THREE.Geometry, "Unexpected type of parameters");

	jsonGeo.normalize();
	jsonGeo.scale(6,6,6);
	jsonGeo.lookAt(new THREE.Vector3(0, 1, 0));
	jsonGeo.rotateY(270.0/180.0*3.14);
	jsonGeo.translate(0, 1, 0);

	this.parameters = {
		
	};

	
	THREE.Geometry.call( this );

	this.type = 'MarioGeometry';

	this.computeFaceNormals();
	this.computeVertexNormals();

	this.mergeVertices();

	return jsonGeo.clone();
};

THREE.MarioGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.MarioGeometry.prototype.constructor = THREE.MarioGeometry;

THREE.MarioGeometry.prototype.clone = function () {
	return new this.constructor().copy(this);
};