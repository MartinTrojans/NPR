"use strict"; 

THREE.HatchShader = {

	uniforms: {

        "uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
		"uDirLightColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
        "uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },
        
		"uMaterialColor": { type: "c", value: new THREE.Color( 0x050505 ) },
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
    	},
        
        "hatch0" : {type: "t", value: new THREE.Texture(0xffFF000)},
    },

	vertexShader: [

"		varying vec2 vv;",
//"        attribute vec4 gl_MultiTexCoord0;",
"		void main() {",
"			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
"			vv=uv;",
"			vv=vec2(0.2,0.5);",

//"       vv = gl_MultiTexCoord0;",
"		}"

	].join("\n"),

	fragmentShader: [
		"uniform vec3 uAmbientLightColor;",
        "uniform vec3 uMaterialColor;",
"		uniform sampler2D hatch0;",
"		uniform sampler2D map;",
"",
"		varying vec2 vv;",
"",
"		void main() {",
                     
                      //           ");"
                     //"float shadee=texture2D(hatch0,vv).r;",
                     //"gl_FragColor = vec4( 1.0, 0, 0, 0);",
                    // "gl_FragColor = vec4(vec3(shadee), 1.0);",
                    //////
                    // "		  vec2 uv = vv * 15.0;",
                    // "vec2 uv2 = vv.yx * 10.0;",
                     // "console.log("aaa");",
//                     "  sampler2D texture = THREE.ImageUtils.loadTexture( "textures/mu.jpg" );",
                    "gl_FragColor = texture2D(hatch0, vv);",
                     //"vec4 color=vec4(vv.x,vv.y,1.0,1.0);",
                    // "float crossedShading = shade(shading, uv) * shade(shading, uv2) * 0.6 + 0.4;",
                    // "gl_FragColor = color;",
                    //////
"		}"

].join("\n")

};

THREE.HatchShaderMaterial = function(){
	var shader = THREE.HatchShader;

	THREE.ShaderMaterial.call(this);

	this.type = 'HatchShaderMaterial';

	var u = THREE.UniformsUtils.clone(shader.uniforms);
	this.uniforms = u;

	// load texture
	var loader = new THREE.TextureLoader();

	this.uniforms.map = loader.load(
		'textures/pure.jpg',
		function (texture) {
		},
		function (xhr) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (xhr) {
			console.log( 'Load texture Error.');
		}
		).clone();


	var vs = shader.vertexShader;
	this.vertexShader = vs;

	var fs = shader.fragmentShader;
	this.fragmentShader = fs;
}

THREE.HatchShaderMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.HatchShaderMaterial.prototype.constructor = THREE.HatchShaderMaterial;



