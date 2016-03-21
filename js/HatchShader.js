"use strict"; 

THREE.HatchShader = {

	uniforms: {

        "uDirLightPos":	{ type: "v3", value: new THREE.Vector3(1.0,0.3,0.7) },
		    "uDirLightColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
        "uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },
        
		    "uMaterialColor": { type: "c", value: new THREE.Color( 0x050505 ) },
        "uSpecularColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
    	
    	uKd: {
		    type: "f",
		    value: 0.51
    	},
    	uKs: {
    		type: "f",
    		value: 0.63
    	},
    	shininess: {
    		type: "f",
    		value: 100.0
    	},
        
        "hatch0" : {type: "t", value: new THREE.Texture()},
        "hatch1" : {type: "t", value: new THREE.Texture()},
        "hatch2" : {type: "t", value: new THREE.Texture()},
        "hatch3" : {type: "t", value: new THREE.Texture()},
        "hatch4" : {type: "t", value: new THREE.Texture()},
        "hatch5" : {type: "t", value: new THREE.Texture()},
        "bakedshadow" : {type: "t", value: new THREE.Texture()},
    },

	vertexShader: [

"       varying vec2 vv;",
"       varying vec3 vNormal;",
"       varying vec3 vViewPosition;",

//"        attribute vec4 gl_MultiTexCoord0;",
"       void main() {",
"           gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
"           vNormal = normalize( normalMatrix * normal );",
"           vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
"           vViewPosition = -mvPosition.xyz;",
"			      vv=uv;",


//"       vv = gl_MultiTexCoord0;",
"		}"

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
                     "uniform sampler2D hatch0;",
                     "uniform sampler2D hatch1;",
                     "uniform sampler2D hatch2;",
                     "uniform sampler2D hatch3;",
                     "uniform sampler2D hatch4;",
                     "uniform sampler2D hatch5;",
                     "uniform sampler2D bakedshadow;",
"",
"		                 varying vec2 vv;",
                     
      "float shade(const in float shading,const in vec2 uv) {",
                     "float shadingFactor;",
                     "float stepSize = 1.0 / 6.0;",
                     
                     "float alpha = 0.0;",
                     "float scaleWhite = 0.0;",
                     "float scaleHatch0 = 0.0;",
                     "float scaleHatch1 = 0.0;",
                     "float scaleHatch2 = 0.0;",
                     "float scaleHatch3 = 0.0;",
                     "float scaleHatch4 = 0.0;",
                     "float scaleHatch5 = 0.0;",
                     
                     
                     "if (shading <= stepSize) {",
                     "alpha = 6.0 * shading;",
                     "scaleHatch4 = alpha;",
                     "scaleHatch5 = 1.0 - alpha;",
                     "}",
                     "else if (shading > stepSize && shading <= 2.0 * stepSize) {",
                     "alpha = 6.0 * (shading - stepSize);",
                     "scaleHatch3 = alpha;",
                     "scaleHatch4 = 1.0 - alpha;",
                     "}",
                     "else if (shading > 2.0 * stepSize && shading <= 3.0 * stepSize) {",
                     "alpha = 6.0 * (shading - 2.0 * stepSize);",
                     "scaleHatch2 = alpha;",
                     "scaleHatch3 = 1.0 - alpha;",
                     "}",
                     "else if (shading > 3.0 * stepSize && shading <= 4.0 * stepSize) {",
                     "alpha = 6.0 * (shading - 3.0 * stepSize);",
                     "scaleHatch1 = alpha;",
                     "scaleHatch2 = 1.0 - alpha;",
                     "}",
                     "else if (shading > 4.0 * stepSize && shading <= 5.0 * stepSize) {",
                     "alpha = 6.0 * (shading - 4.0 * stepSize);",
                     "scaleHatch0 = alpha;",
                     "scaleHatch1 = 1.0 - alpha;",
                     "}",
                     "else if (shading > 5.0 * stepSize) {",
                     "alpha = 6.0 * (shading - 5.0 * stepSize);",
                     "scaleWhite = alpha;",
                     "scaleHatch0 = 1.0 - alpha;",
                     "}",
                     
                    "shadingFactor = scaleWhite + scaleHatch0 * texture2D(hatch0, uv).r + scaleHatch1 * texture2D(hatch1, uv).r +scaleHatch2 * texture2D(hatch2, uv).r+ scaleHatch3 * texture2D(hatch3, uv).r + scaleHatch4 * texture2D(hatch4, uv).r +scaleHatch5 * texture2D(hatch5, uv).r;",
                     
                     "return shadingFactor;",
      "}",
                     
"",
"		void main() {",
                     // ambient
                     "vec3 hatchMaterialColor = vec3(1.0, 1.0, 1.0);",
                     "gl_FragColor = vec4( uAmbientLightColor * hatchMaterialColor, 1.0 );",
                     
                     "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                     "vec3 lVector = normalize( lDirection.xyz );",
                     
                     // diffuse: N * L. Normal must be normalized, since it's interpolated.
                     "vec3 normal = normalize( vNormal );",
                     "float diffuse = max( dot( normal, lVector ), 0.0);",
                     
                     "gl_FragColor.xyz += uKd * hatchMaterialColor * uDirLightColor * diffuse;",
                     
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
                     
                     //"gl_FragColor.xyz += uDirLightColor * uSpecularColor * specular;",
                     
                     "vec2 uv = vv;",
                     "vec2 uv2 = vv.yx;",

                     "float shading = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b)/3.0 ;",
                     //"float shading = texture2D(bakedshadow, vv).r + 0.1;",
                     "float crossedShading = shade(shading, uv);",
                     //"gl_FragColor = crossedShading;",
                     //"gl_FragColor = texture2D(hatch0, vv);",
                     
                     //           ");"
                     //"float shadee=texture2D(hatch0,vv).r;",
                     //"gl_FragColor = vec4( 1.0, 0, 0, 0);",
                     "gl_FragColor = vec4(vec3(crossedShading), 1.0);",
                     //"gl_FragColor = vec4(gl_FragColor.xy, 0.0, 1.0);",

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

	var texture = loader.load(
		'textures/hatch_0.jpg',
		function (texture) {

		},
		function (xhr) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (xhr) {
			console.log( 'Load texture Error.');
		}
		);

	this.uniforms.hatch0.value = texture;
    
     texture = loader.load(
                              'textures/hatch_1.jpg',
                              function (texture) {
                           texture.magFilter = THREE.LinearFilter;
                           texture.minFilter = THREE.LinearMipMapLinearFilter;
                           texture.anisotropy=16;
                           },
                              function (xhr) {
                              console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
                              },
                              function (xhr) {
                              console.log( 'Load texture Error.');
                              }
                              );
    this.uniforms.hatch1.value = texture;

    texture = loader.load(
                          'textures/hatch_2.jpg',
                          function (texture) {
                          texture.anisotropy=16;
                                                  },
                          function (xhr) {
                          console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
                          },
                          function (xhr) {
                          console.log( 'Load texture Error.');
                          }
                          );
    this.uniforms.hatch2.value = texture;

    texture = loader.load(
                          'textures/room_baked.png',
                          function (texture) {
                          texture.anisotropy=16;
                                                 },
                          function (xhr) {
                          console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
                          },
                          function (xhr) {
                          console.log( 'Load texture Error.');
                          }
                          );
    this.uniforms.bakedshadow.value = texture;

    texture = loader.load(
                          'textures/hatch_3.jpg',
                          function (texture) {
                          texture.anisotropy=16;
                                                   },
                          function (xhr) {
                          console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
                          },
                          function (xhr) {
                          console.log( 'Load texture Error.');
                          }
                          );
    this.uniforms.hatch3.value = texture;
    
    texture = loader.load(
                          'textures/hatch_4.jpg',
                          function (texture) {
                          texture.anisotropy=16;
                                                   },
                          function (xhr) {
                          console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
                          },
                          function (xhr) {
                          console.log( 'Load texture Error.');
                          }
                          );
    this.uniforms.hatch4.value = texture;


    texture = loader.load(
                          'textures/hatch_5.jpg',
                          function (texture) {
                          texture.anisotropy=16;
                                                   },
                          function (xhr) {
                          console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
                          },
                          function (xhr) {
                          console.log( 'Load texture Error.');
                          }
                          );
    this.uniforms.hatch5.value = texture;

	var vs = shader.vertexShader;
	this.vertexShader = vs;

	var fs = shader.fragmentShader;
	this.fragmentShader = fs;
}

THREE.HatchShaderMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.HatchShaderMaterial.prototype.constructor = THREE.HatchShaderMaterial;



