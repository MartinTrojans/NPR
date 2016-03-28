/*global THREE */
THREE.RidgeShader = {

	vertexShader: [
"		attribute vec3 tangent;",
"		attribute float ridge;",

"",
"		varying vec3 vColor;",
"		varying float visible;",
"		",
"		void main() {",
"			vec3 vNormal = normalize( normalMatrix * normal );",
"			vec3 vTangent = normalize(normalMatrix * tangent);",
"			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
"			vec3 vViewPosition = normalize(-mvPosition.xyz);",
"			float EdotN = dot(vViewPosition, vNormal);",
"			float EdotT = dot(vViewPosition, vTangent);",
"			float extend = 0.5*(length(vViewPosition)/75.0);",
"			vec3 newposition = position;", 
"			if ( (EdotN * EdotT) < 0.01 ) ",
"			{",
"				visible = 1.0;",
"			}",
"			else ",
"			{",
"				visible = ridge;",
"			}",
"			if (EdotN > 0.01) ",
"			{",
"				newposition = position - vNormal * extend; ",
"			}",
"			vColor = vec3(0.0, 0.0, 0.0);",

"			gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1.0 );",
"		}",

	].join("\n"),

	fragmentShader: [

"		varying vec3 vColor;",
"		varying float visible;",

"",
"		void main() {",
"		// specular: N * H to a power. H is light vector + view vect",
"			if (visible < 0.9) ",
"			//if (visible > 0.01 || visible < -0.01)",
"				discard;",
"			gl_FragColor.xyz = vColor;",
"		}",

].join("\n")

};


THREE.SimpleRidgeGeometry = function(geometry, creaseAngle){
	"use strict";

	var originVertices = geometry.vertices;
	var originFaces = geometry.faces;

	THREE.BufferGeometry.call(this);

	this.type = 'SimpleRidgeGeometry';

	var vertices = [];
	var normals = [];
	var tangents = [];
	var ridge = [];

	//linked vertex to index
	var linkVer = [];
	//the linked normal, 1 link - 2 normals
	var linkNormal = [];
	for (var i=0; i<originVertices.length; i++){
		var linkedV = [];
		linkVer.push(linkedV);

		var linkedN = [];
		linkNormal.push(linkedN);

		var linkedN2 = [];
	}

	function insertAttribute(position, normal, tangent, vertexNormal) {
		vertices.push(position.x);
		vertices.push(position.y);
		vertices.push(position.z);

		normal.normalize();
		normals.push(normal.x);
		normals.push(normal.y);
		normals.push(normal.z);

		tangent.normalize();
		tangents.push(tangent.x);
		tangents.push(tangent.y);
		tangents.push(tangent.z);

		vertexNormal.normalize();

		var dihedralAngle = normal.dot(tangent);

		//console.log(VNdotN * VNdotT);
		if (dihedralAngle <creaseAngle) {
			//console.log(dihedralAngle);
			ridge.push(1.0);
		} else {
			ridge.push(0.0);
		}
	}

	function pushLinkVertex(face, va, fia, vb, fib) {
		var laV = linkVer[va];
		var ib = laV.indexOf(vb);
		if (ib == -1) {

			laV.push(vb);
			//linkNormal[va].push(face.normal);
			linkNormal[va].push(face.vertexNormals[fia]);
		}
		else {
			//console.log(va+' '+vb);
			//a - normal
			var n1 = linkNormal[va][ib];
			//b - normal
			var n2 = n1;
			//a - tangent
			var t1 = face.vertexNormals[fib];
			//var t1 = face.normal;
			//b - tangent
			var t2 = t1;
			insertAttribute(originVertices[va], n1, t1, face.vertexNormals[fia]);
			insertAttribute(originVertices[vb], n2, t2, face.vertexNormals[fib]);
		}

	}

	var vertCount = 0;
	var numFaces = originFaces.length;
	for (var i = 0; i<numFaces; i++) {
		var face = originFaces[i];

		var normalIndices = [];
		normalIndices[face.a] = 0;
		normalIndices[face.b] = 1;
		normalIndices[face.c] = 2;

		var vs = [face.a, face.b, face.c];
		vs.sort(function(a, b) {return (a - b)});
		var va = vs[0];
		var vb = vs[1];	
		var vc = vs[2];
		
		pushLinkVertex(face, va, normalIndices[va], vb, normalIndices[vb]);
		pushLinkVertex(face, va, normalIndices[va], vc, normalIndices[vc]);
		pushLinkVertex(face, vb, normalIndices[vb], vc, normalIndices[vc]);

	}

  	var f32Vertices = new Float32Array(vertices);	
	var attrPosition = new THREE.BufferAttribute(f32Vertices, 3);
	this.addAttribute('position', attrPosition);

	var f32Normals = new Float32Array(normals);
	var attrNormal = new THREE.BufferAttribute(f32Normals, 3);
	this.addAttribute('normal', attrNormal);

	var f32Tan = new Float32Array(tangents);
	var attrTan = new THREE.BufferAttribute(f32Tan, 3);
	this.addAttribute('tangent', attrTan);

	var f32Ridge = new Float32Array(ridge);
	var attrRidge = new THREE.BufferAttribute(f32Ridge, 1);
	this.addAttribute('ridge', attrRidge);
};

THREE.SimpleRidgeGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.SimpleRidgeGeometry.prototype.constructor = THREE.SimpleRidgeGeometry;