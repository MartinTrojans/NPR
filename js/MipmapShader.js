"use strict"; 
THREE.MipmapShader = {
	uniforms: {
		"uDirLightPos": { type: "v3", value: new THREE.Vector3(1.0, 0.3, 0.7) },
		"uDirLightColor": { type: "c", value: new THREE.Color(0xFFFFFF) },
		"uAmbientLightColor": { type: "c", value: new THREE.Color(0xFFFFFF) },
		"uKd" : { type: "f", value: 0.5 },
		"repeat" : { type: "f", value: 1.0},

		'testtex' : { type: "t", value: new THREE.Texture() }, 
		'hatch0' : { type: "t", value: new THREE.Texture() }, 
		'hatch1' : { type: "t", value: new THREE.Texture() }, 
		'hatch2' : { type: "t", value: new THREE.Texture() }, 
		'hatch3' : { type: "t", value: new THREE.Texture() }, 
		'hatch4' : { type: "t", value: new THREE.Texture() }, 
		'hatch5' : { type: "t", value: new THREE.Texture() }, 

	},
	vertexShader: [

"	uniform float repeat;",

"	varying vec3 pNormal;",
"	varying float depth;",
"	varying vec3 pPosition;",

"	varying vec2 pUV; ",
"	void main() {",
"		pNormal = normalize( normalMatrix * normal );",
"		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
"		pPosition = mvPosition.xyz; ", 
"		gl_Position = projectionMatrix * mvPosition;",
"		pUV = uv * repeat; ",
"	}",
	].join("\n"),

	fragmentShader: [

"	uniform vec3 uDirLightPos;",
"	uniform vec3 uDirLightColor;",
"	uniform vec3 uAmbientLightColor;",
"	uniform float uKd;",
"	uniform sampler2D testtex;",
"	uniform sampler2D hatch0;",
"	uniform sampler2D hatch1;",
"	uniform sampler2D hatch2;",
"	uniform sampler2D hatch3;",
"	uniform sampler2D hatch4;",
"	uniform sampler2D hatch5;",
"",
"	varying vec3 pNormal;",
"	varying vec2 pUV; ",
"",
"	void main() {",
"		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); ",
"		vec4 lDir = viewMatrix * vec4( uDirLightPos, 0.0 );",
"		vec3 lVec = normalize( lDir.xyz );",
"		float diffuse = max( dot( normalize(pNormal), lVec ), 0.0);",
"", 
"		vec4 c;",
"		float step = 1. / 6.;",
"		if (diffuse <= step) {",
"			c = mix(texture2D( hatch5, pUV), texture2D( hatch4, pUV), 6. * diffuse);",
"		}",
"		else if ( diffuse <= 2. * step ) {",
"			c = mix(texture2D( hatch4, pUV), texture2D( hatch3, pUV), 6. * (diffuse - step));",
"		}",
"		else if ( diffuse <= 3. * step ) {",
"			c = mix(texture2D( hatch3, pUV), texture2D( hatch2, pUV), 6. * (diffuse - 2. * step));",
"		}",
"		else if ( diffuse <= 4. * step ) {",
"			c = mix(texture2D( hatch2, pUV), texture2D( hatch1, pUV), 6. * (diffuse - 3. * step));",
"		}",
"		else if ( diffuse <= 5. * step ) {",
"			c = mix(texture2D( hatch1, pUV), texture2D( hatch0, pUV), 6. * (diffuse - 4. * step));",
"		}",
"		else {",
"			c = mix(texture2D( hatch0, pUV), vec4(1. ), 6. * (diffuse - 5. * step));",
"		}",
"		//gl_FragColor = texture2D( testtex, pUV); ",
"		gl_FragColor = c;",
"	}",


	].join("\n"),
};


THREE.MipmapShaderMaterial = function() {
	var shader = THREE.MipmapShader;

	THREE.ShaderMaterial.call(this);
	this.type = "MipmapShaderMaterial";

	function mipmap( size, color ) {
		var imageCanvas = document.createElement( "canvas" )
		var context = imageCanvas.getContext( "2d" );

		imageCanvas.width = imageCanvas.height = size;

		context.fillStyle = color;
		context.fillRect( 0, 0, size, size);
		return imageCanvas;
	}

	function loadTOM(url) {
		var loader = new THREE.TextureLoader();

		var texture = loader.load(
			url,
			function (texture) {
			},
			function (xhr) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
			},
			function (xhr) {
				console.error( 'Load texture Error.');
			}		
		);

		return texture;
	}

	function loadImage(url) {
		var loader = new THREE.ImageLoader();
		var image = loader.load(
			url,
			function (image) {
			},
			function (xhr) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
			},
			function (xhr) {
				console.error( 'Load texture Error.');
			}		
			);

		return image;
	}

	var u = THREE.UniformsUtils.clone(shader.uniforms);
	this.uniforms = u;

	var hatchTexture;
	var maxPow = 8;
	for (var i = 0; i < 6; i++) {
		var texurl = 'textures/hatch_' + i + '.jpg';
		hatchTexture = loadTOM(texurl);
		hatchTexture.wrapS = hatchTexture.wrapT = THREE.RepeatWrapping;

		var key = 'hatch' + i;
		u[key].value = hatchTexture;	
	}

	u.testtex.value = loadTOM('textures/mu.jpg');

	var vs = shader.vertexShader;
	this.vertexShader = vs;

	var fs = shader.fragmentShader;
	this.fragmentShader = fs;
}

THREE.MipmapShaderMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.MipmapShaderMaterial.prototype.constructor = THREE.MipmapShaderMaterial;