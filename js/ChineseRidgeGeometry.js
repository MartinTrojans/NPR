"use strict";
/*Chinese Ridege Geometry*/
THREE.ChineseRidgeGeometry = function(geometry, creaseAngle){
	"use strict";


	console.assert(geometry.vertices !== undefined);
	var originVertices = geometry.vertices;

	console.assert(geometry.faces !== undefined);
	var originFaces = geometry.faces;

	var segementNum = 5;

	THREE.BufferGeometry.call(this);

	this.type = 'ChineseRidgeGeometry';

	var MAX_WIDTH = 2.0;

	var prevertices = [];
	var prenormals = [];
	var pretangents = [];
	
	var vertices = [];
	var normals = [];
	var tangents = [];
	
	var ridge = [];

	//linked vertex to index
	var linkVer = [];
	var linkVerFlag = [];
	//the linked normal, 1 link - 2 normals
	var linkNormal = [];
	var linkSecondNormal = [];
	//initialize linkVer, linkNormal, linkSecondNormal
	for (var i=0; i<originVertices.length; i++){
		var linkedV = [];
		linkVer.push(linkedV);

		var linkedN = [];
		linkNormal.push(linkedN);

		var linkedN2 = [];
		linkSecondNormal.push(linkedN2);
	}
	
	function insertAttribute(v, normal, tangent) {
		normal.normalize();
		prenormals[v] = normal;

		tangent.normalize();
		pretangents[v] = tangent;


	}

	function pushLinkVertex(face, va, fia, vb, fib) {
		var laV = linkVer[va];
		var ib = laV.indexOf(vb);
		if (ib == -1) {
			laV.push(vb);
			linkNormal[va].push(face.vertexNormals[fia]);
		}
		else {
			//a - normal
			var n1 = linkNormal[va][ib];
			//b - normal
			var n2 = n1;
			//a - tangent
			var t1 = face.vertexNormals[fib];
			//b - tangent
			var t2 = t1;
			insertAttribute(va, n1, t1);
			insertAttribute(vb, n2, t2);
		}

	}
	
	function headHasLinkSeg(linkedList){
		var head = linkedList.getHead().getValue();
		var next = linkedList.getHead().getNext().getValue();
		var vec1 = new THREE.Vector3();
		var vec2 = new THREE.Vector3();
		var point = new THREE.Vector3();
		var temp = 0;
		vec1.subVectors(originVertices[next], originVertices[head]);
		vec1.normalize();
		for (var i = 0; i<linkVer[head].length; i++){
			if (linkVerFlag[head][i] == 0){
				temp = linkVer[head][i];
				point = originVertices[temp];
				vec2.subVectors(point, originVertices[head]);
				vec2.normalize();
				if (vec1.dot(vec2) < -0.5){
					var node = new THREE.LinkedListNode(temp);
					linkVerFlag[head][i] = 1;
					//var otherpoint = linkVer[head][i];
					//var ihead = linkVer[otherpoint].indexOf(head);
					//linkVerFlag[otherpoint][ihead] = 1;
					linkedList.appendHead(node);
					return true;
				}
			}
		}
		return false;
	}
	
	function tailHasLinkSeg(linkedList){
		var tail = linkedList.getTail().getValue();
		var prev = linkedList.getTail().getPrev().getValue();
		var vec1 = new THREE.Vector3();
		var vec2 = new THREE.Vector3();
		var point = new THREE.Vector3();
		var temp = 0;
		vec1.subVectors(originVertices[prev], originVertices[tail]);
		vec1.normalize();
		for (var i = 0; i<linkVer[tail].length; i++){
			if (linkVerFlag[tail][i] == 0){
				temp = linkVer[tail][i];
				point = originVertices[temp];
				vec2.subVectors(point, originVertices[tail]);
				vec2.normalize();
				if (vec1.dot(vec2) < -0.5){
					var node = new THREE.LinkedListNode(temp);
					linkVerFlag[tail][i] = 1;
					//var otherpoint = linkVer[tail][i];
					//var itail = linkVer[otherpoint].indexOf(tail);
					//linkVerFlag[otherpoint][itail] = 1;
					linkedList.appendTail(node);
					return true;
				}
			}
		}
		return false;
	}
	
	function groupEdge(linkedListArray, edgeArray){
		for (var i = 0; i<linkedListArray.length; i++){
				var p1 = linkedListArray[i].getHead();
				var p2 = linkedListArray[i].getTail();
				var num = linkedListArray[i].getLength();
				var step = Math.floor(num / segementNum / 2);
				if (step < 1){
					step = 1; 
				}
				var indexOfEdge = 0;
				while (p1 != p2){
					for (var j = 0; j<step; j++){
						if (p1.getNext() == p2){
							edgeArray[indexOfEdge].push(p1.getValue());
							edgeArray[indexOfEdge].push(p2.getValue());
							p1 = p2;
							break;
						}
						edgeArray[indexOfEdge].push(p1.getValue());
						edgeArray[indexOfEdge].push(p1.getNext().getValue());
						edgeArray[indexOfEdge].push(p2.getValue());
						edgeArray[indexOfEdge].push(p2.getPrev().getValue());
						
						p1 = p1.getNext();
						p2 = p2.getPrev();
						if (p1 == p2){
							break;
						}
					}
					indexOfEdge++;
					if (indexOfEdge >= segementNum){
						indexOfEdge = segementNum - 1;
					}
				}
		}
	}

	function insertVertexNormalTangent(vertex, normal, tangent){
		//vertex
		vertices.push(vertex.x);
		vertices.push(vertex.y);
		vertices.push(vertex.z);
		//normal
		normals.push(normal.x);
		normals.push(normal.y);
		normals.push(normal.z);
		//tangent
		tangents.push(tangent.x);
		tangents.push(tangent.y);
		tangents.push(tangent.z);

		var dihedralAngle = normal.dot(tangent);
		//console.log(VNdotN * VNdotT);
		if (dihedralAngle <creaseAngle) {
			ridge.push(1.0);
		} else {
			ridge.push(0.0);
		}
	}

	function insertFace(p1, p2, offset1, n1, n2, t1, t2) {
		var p3 = new THREE.Vector3();
		p3.addVectors(p1, offset1);

		insertVertexNormalTangent(p1, n1, t1);
		insertVertexNormalTangent(p2, n2, t2);
		insertVertexNormalTangent(p3, n1, t1);
	}
	
	function insertTri(v1, v2, w1, w2) {
		//Vector3 -- vertex
		var p1 = originVertices[v1];
		var p2 = originVertices[v2];

		//Vector3 -- normal
		console.assert(v1 < prenormals.length);
		var n1 = prenormals[v1];
		if (! (n1 instanceof THREE.Vector3)) {
			return ;
		}

		console.assert(v2 < prenormals.length);
		var n2 = prenormals[v2];
		if (! (n2 instanceof THREE.Vector3)) {
			return ;
		}
		//Vector -- tangent
		var t1 = pretangents[v1];
		var t2 = pretangents[v2];

		var offset1 = n1.clone();
		offset1.setLength(w1);
		var newP1 = new THREE.Vector3();
		newP1.addVectors(p1, offset1);

		var offset2 = n2.clone();
		offset2.setLength(w2);

		insertFace(p1, p2, offset1, n1, n2, t1, t2);
		insertFace(p2, newP1, offset2, n2, n1, t2, t1);

		offset1.negate();

		newP1.addVectors(p1, offset1);

		offset2.negate();

		insertFace(p1, p2, offset1, n1, n2, t1, t2);
		insertFace(p2, newP1, offset2, n2, n1, t2, t1);

	}

	function strokeBuild(linkedListArray){
		for (var i = 0; i<linkedListArray.length; i++){

			var p1 = linkedListArray[i].getHead();
			var p2 = linkedListArray[i].getTail();
			var step = linkedListArray[i].getLength();

			var strokewidth = 0.03;
			var lastStrokewidth = 0.0;
			while (p1 !== p2){
				if (p1.getNext() === p2){
					p1 = p2;
					break;
				}

				var h1 = p1.getValue();
				var t1 = p1.getNext().getValue();
				
				insertTri(h1, t1, lastStrokewidth, strokewidth);

				var h2 = p2.getValue();
				var t2 = p2.getPrev().getValue();
				insertTri(h2, t2, strokewidth, lastStrokewidth);

				
				p1 = p1.getNext();
				p2 = p2.getPrev();
				if (p1 === p2){
					break;
				}
				lastStrokewidth = strokewidth;
				strokewidth += 0.006;
				strokewidth = strokewidth > MAX_WIDTH ? MAX_WIDTH : strokewidth;
			}
		}
	}
	
	var vertCount = 0;
	var numFaces = originFaces.length;
	for (var i = 0; i<numFaces; i++) {
		var face = originFaces[i];
		console.assert(face instanceof THREE.Face3);

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
	
	for (var i = 0; i<originVertices.length; i++){
		var Flag = new Array(linkVer[i].length)
		for (var j = 0; j<linkVer[i].length; j++){
			Flag[j] = 0;
		}
		linkVerFlag.push(Flag);
	}

	var linkedListArray = [];
	for (var i = 0; i<originVertices.length; i++){
		for (var j = 0; j<linkVer[i].length; j++){	
			var linkedList = new THREE.LinkedList();
			if (linkVerFlag[i][j] == 0){
				var node1 = new THREE.LinkedListNode(i);
				var node2 = new THREE.LinkedListNode(linkVer[i][j]);
				linkedList.appendHead(node1);
				linkedList.appendHead(node2);
				linkVerFlag[i][j] = 1;
				while (tailHasLinkSeg(linkedList));
				while (headHasLinkSeg(linkedList));
				linkedListArray.push(linkedList);
			}
		}
	}

	strokeBuild(linkedListArray);
	
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

THREE.ChineseRidgeGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.ChineseRidgeGeometry.prototype.constructor = THREE.ChineseRidgeGeometry;