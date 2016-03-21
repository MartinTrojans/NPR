THREE.ToonOutline = {

	uniforms: {  
	    outlineWidth: {
	    type: "f",
	    value: 100.0
	    }, 
    },
	vertexShader: [
		"uniform float outlineWidth;",
		"varying vec3 vColor;",
		"varying vec3 vNormal;",

		"void main() {",
			"vec3 newposition = position;",
			"newposition = position +  vNormal * outlineWidth / 100.0; ",
    		"gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1.0 );",

		"}",

	].join("\n"),

	fragmentShader: [
		"varying vec3 vColor;",

		"void main() {",
			"	gl_FragColor.xyz = vColor;",

		"}",



	].join("\n")
	
};