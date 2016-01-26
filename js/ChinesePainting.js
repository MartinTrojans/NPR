"use strict";
/*global THREE */
THREE.ChinesePatchShader = {

	uniforms: {

        "uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
		"uDirLightColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

		"uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },

		"uMaterialColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
		"uSpecularColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

		uKd: {
			type: "f",
			value: 0.7
		},
		uKs: {
			type: "f",
			value: 0.3
		},
		shininess: {
			type: "f",
			value: 100.0
		}
	},

	vertexShader: [

		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"vNormal = normalize( normalMatrix * normal );",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vViewPosition = -mvPosition.xyz;",

		"}"

	].join("\n"),

	fragmentShader: [
		"uniform vec3 uMaterialColor;",
		"uniform vec3 uSpecularColor;",

		"uniform vec3 uDirLightPos;",
		"uniform vec3 uDirLightColor;",
		"uniform vec3 uAmbientLightColor;",

		"uniform float uKd;",
		"uniform float uKs;",
		"uniform float shininess;",

		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",

		"void main() {",

			// ambient
			"gl_FragColor = vec4( uAmbientLightColor * uMaterialColor, 1.0 );",

			"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
			"vec3 lVector = normalize( lDirection.xyz );",

			// diffuse: N * L. Normal must be normalized, since it's interpolated.
			"vec3 normal = normalize( vNormal );",
			"float diffuse = max( dot( normal, lVector ), 0.0);",

			"gl_FragColor.xyz += uKd * uMaterialColor * uDirLightColor * diffuse;",

			// specular: N * H to a power. H is light vector + view vector
			"vec3 viewPosition = normalize( vViewPosition );",
			"vec3 pointHalfVector = normalize( lVector + viewPosition );",
			"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
			"float specular = uKs * pow( pointDotNormalHalf, shininess );",
			// however, if N * L is < 0, the light is below the horizon and should not affect the surface
			// This can give a hard termination to the highlight, but it's better than some weird sparkle.
			"if (diffuse <= 0.0) {",
				"specular = 0.0;",
			"}",
			
			"float light = (gl_FragColor.x + gl_FragColor.y + gl_FragColor.z) / 3.0;",
			"if (light <= 0.4) {",
				"light = 0.4;",
			"}",
			"else if (light <= 0.6){",
				"light = 0.6;",
			"}",
			"else if (light <= 0.9){",
				"light = 0.9;",
			"}",
			"else{",
				"light = 1.0;",
			"}",
			"gl_FragColor.x = light;",
			"gl_FragColor.y = light;",
			"gl_FragColor.z = light;",

		"}"

	].join("\n")
	
};

THREE.ChineseMaterial = function(ambientLight) {
	var shader = THREE.ChinesePatchShader;

	THREE.ShaderMaterial.call(this);

	this.type = 'ChineseMaterial';

	var u = THREE.UniformsUtils.clone(shader.uniforms);
	this.uniforms = u;

	//increase contrast ratio
	this.uniforms.uAmbientLightColor.value = ambientLight.color;
	this.uniforms.uAmbientLightColor.value.r /= 1.3;
	this.uniforms.uAmbientLightColor.value.g /= 1.3;
	this.uniforms.uAmbientLightColor.value.b /= 1.3;
	this.uniforms.uKd.value *= 1.3;
	if (this.uniforms.uKd.value > 1){
		this.uniforms.uKd.value = 1;
	}
	this.uniforms.uKs.value *= 1.3;
	if (this.uniforms.uKs.value > 1){
		this.uniforms.uKs.value = 1;
	}

	var vs = shader.vertexShader;
	this.vertexShader = vs;


	var fs = shader.fragmentShader;
	this.fragmentShader = fs;
}

THREE.ChineseMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.ChineseMaterial.prototype.constructor = THREE.ChineseMaterial;
