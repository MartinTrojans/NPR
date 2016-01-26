var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, camera, scene, renderer, stats;

var cameraControls;

var effectController;

var clock = new THREE.Clock();

// settings here don't really matter, as they'll be forced to match those
// in fillScene - go set defaults there

var sStyle; // not initialize, force a refresh

var teapotSize = 3.15;	// the original size

var tess = 24;	// -1 forces a refresh

var edge = true;
var edgewidth = 5.0;

var m_modelSize;
var m_model = "Teapot";
var m_mesh;
var m_jsonObject;

var m_jsonGeo;
var m_creaseAngle = 0.8;

var m_teapotGeo;

var ambientLight, light;
var wireframeMaterial, phongMaterial;
var hatchShaderMaterial;
var chineseShaderMaterial;

var NPR_ShaderMaterial1;

// material rendering on the teapot
var nowMaterial;

var solidGround, ground;

init();
animate();

function init() {
	container = document.createElement('div');
	document.body.appendChild(container);

	// CAMERA

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1*teapotSize, 1000 * teapotSize);
	camera.position.set(-2.5*teapotSize, 6*teapotSize, 2*teapotSize);

	// LIGHTS

	ambientLight = new THREE.AmbientLight(0xefefef); // 0.2

	light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(32, 39, 70);

	// RENDERER

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	renderer.setClearColor(0x808080, 1.0);

	container.appendChild(renderer.domElement);

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// STATS JavaScript Performance Monitor
	stats = new Stats();
	stats.setMode(0); // 0:fps

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";

	// EVENTS

	window.addEventListener('resize', onWindowResize, false);

	// CONTROLS
	// // TODO
	// cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
	// cameraControls.target.set(0, teapotSize, 0);
	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement);
	cameraControls.target.set(0, 0, 0);
	// GUI

	setupGui();
	
	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var materialColor = new THREE.Color();
	materialColor.setRGB(1, 1, 1);
	
	wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0xFFCC99, wireframe: true } ) ;

	phongMaterial = createShaderMaterial(
		"phong", 
		light, 
		ambientLight, 
		materialColor, 
		effectController.cull);

	chineseShaderMaterial = createShaderMaterial(
		"ChineseShading", 
		light, 
		ambientLight, 
		materialColor,
		effectController.cull);

	hatchShaderMaterial = createShaderMaterial(
		"HatchShader",
		light,
		ambientLight,
		materialColor,
		effectController.cull);

	nowMaterial = wireframeMaterial;
	fillScene();

	createModel(m_model);

}

function createShaderMaterial(id, light, ambientLight, materialColor, cull) {
	var shader;
	var u;

	var material;
	if (id == "ChineseShading") {
		material = new THREE.ChineseMaterial(ambientLight);
	}
	else if (id == "phong") {
		shader = THREE.ShaderTypes[id];
		u = THREE.UniformsUtils.clone(shader.uniforms);

		var vs = shader.vertexShader;
		var fs = shader.fragmentShader;

		material = new THREE.ShaderMaterial({ 
			uniforms: u, 
			vertexShader: vs, 
			fragmentShader: fs });

	}
	else if (id == "HatchShader") {

		material = new THREE.HatchShaderMaterial();

	}
	else {
		console.error("Unexpected type of ShaderMaterial: "+id);
	}

	if (material.uniforms.uDirLightPos !== undefined) {
		material.uniforms.uDirLightPos.value = light.position;
	}

	if (material.uniforms.uDirLightColor !== undefined) {
		material.uniforms.uDirLightColor.value = light.color;
	}

	if (material.uniforms.uMaterialColor !== undefined) {
		material.uniforms.uMaterialColor.value.copy(materialColor);
	}

	material.side = THREE.DoubleSide;

	return material;

}

// EVENT HANDLERS

function onWindowResize() {

	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

}

function setupGui() {

	effectController = {

		ka: 0.2,
		kd: 0.5,
		ks: 0.7,

		red: 0.6,
		green: 0.8,
		blue: 0.7,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: 0.32,
		ly: 0.39,
		lz: 0.7,
				
		ground: true,
		xzgrid: true,

		style: "HatchShader",

		edge: true,

		edgewidth: 5,
		creaseAngle: 0.8, 

		model: "Bunny",

	};

	var h;

	var gui = new dat.GUI();

	// model
	gui.add( effectController, "model", ["Sphere", "Teapot", "Bunny"]).name("Model");
	// style
	gui.add( effectController, "style", ["Wireframe","Phong", "NPR_Shader1", "HatchShader", "ChineseShading"] ).name("Style");


	// edge attributes
	h = gui.addFolder("Sihouette Edge Control");
	h.add( effectController, "edge", "edge").name("Edge");
	h.add( effectController, "edgewidth", [2, 3, 5, 8]).name("Line Width");
	h.add( effectController, "creaseAngle", 0.4, 1.0, 0.05).name("Crease Angle");

	// material (attributes)

	h = gui.addFolder("Material control");

	h.add(effectController, "ka", 0.0, 1.0, 0.025).name("Ka");
	h.add(effectController, "kd", 0.0, 1.0, 0.025).name("Kd");
	h.add(effectController, "ks", 0.0, 1.0, 0.025).name("Ks");

	// material (color)

	h = gui.addFolder("Material color");

	h.add(effectController, "red", 0.0, 1.0, 0.025).name("Red");
	h.add(effectController, "green", 0.0, 1.0, 0.025).name("Green");
	h.add(effectController, "blue", 0.0, 1.0, 0.025).name("Blue");

	// light (directional)

	h = gui.addFolder("Light direction");

	h.add(effectController, "lx", -1.0, 1.0, 0.025).name("x");
	h.add(effectController, "ly", -1.0, 1.0, 0.025).name("y");
	h.add(effectController, "lz", -1.0, 1.0, 0.025).name("z");


	// grid

	h = gui.addFolder("Grids");

	h.add(effectController, "ground").name("ground plane");
	h.add(effectController, "xzgrid").name("ground grid");
}

//

function animate() {

	window.requestAnimationFrame(animate);
	render();

}

function render() {

	var delta = clock.getDelta();

	cameraControls.update(delta);

	stats.update();


	if (effectController.style !== sStyle ||
		effectController.edge !== edge ||
		effectController.edgewidth !== edgewidth ||
		effectController.model !== m_model ||
		effectController.creaseAngle !== m_creaseAngle
	) {
		m_creaseAngle = effectController.creaseAngle;
		sStyle = effectController.style;
		edge = effectController.edge;
		edgewidth = effectController.edgewidth;

		m_model = effectController.model;

		console.log('call redraw from update');	
		if ( sStyle === "Wireframe" ) {

			nowMaterial = wireframeMaterial;

		} else if ( sStyle === "Phong" ) {

			nowMaterial = phongMaterial;

		} else if ( sStyle === "ChineseShading") {

			nowMaterial = chineseShaderMaterial;

		} else if ( sStyle === "HatchShader") {

			nowMaterial = hatchShaderMaterial;

		} else {
			console.error("Unknown style: " + sStyle);
		}

		fillScene();

		reDraw();
	}

	if (nowMaterial.uniforms !== undefined) {

		nowMaterial.uniforms.uKd.value = effectController.kd;
		nowMaterial.uniforms.uKs.value = effectController.ks;

		var materialColor = new THREE.Color();

		materialColor.setRGB( effectController.red, effectController.green, effectController.blue );

		nowMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	}




	solidGround.visible = effectController.ground;
	ground.visible = effectController.xzgrid;

	ambientLight.color.setHSL(0.0, 0.0, effectController.ka);

	light.position.set(effectController.lx, effectController.ly, effectController.lz);
	light.position.normalize();

	renderer.render(scene, camera);

}

function reDraw() {


	if (m_model == 'Bunny') {
		geometry = m_jsonGeo;
	} 
	else  if (m_model == 'Teapot') 
	{
		geometry = m_teapotGeo;
	}
	else if (m_model == 'Sphere')
	{
		geometry = new THREE.SphereGeometry(5, 4, 10);
	}
	else
	{
		console.error("Unknown model type: " + m_model);
	}


	if (geometry !== undefined) {
		m_mesh = new THREE.Mesh( geometry, nowMaterial );
		m_mesh.position.y = m_modelSize;

		var ridgeShader = THREE.RidgeShader;
		var ridge_vs = ridgeShader.vertexShader;
		var ridge_fs = ridgeShader.fragmentShader;

		var ridgeMaterial = new THREE.ShaderMaterial({ 
				vertexShader: ridge_vs, 
				fragmentShader: ridge_fs });

		ridgeMaterial.side = THREE.DoubleSide;

		if (edge){
			if (sStyle == "ChineseShading") {
				var line = new THREE.ChineseRidgeGeometry(geometry);
				var chinesePainting = new THREE.Mesh(line, ridgeMaterial);
				chinesePainting.position.y = m_modelSize;

				scene.add(chinesePainting);
			} 
			else {
				var ridgeGeo = new THREE.SimpleRidgeGeometry(geometry, m_creaseAngle);

				ridgeMaterial.linewidth = edgewidth;
				ridge = new THREE.LineSegments(ridgeGeo, ridgeMaterial);
				ridge.position.y = m_modelSize;	

				scene.add(ridge);
			}

		}
		scene.add(m_mesh);
	} else {
		console.log('undefined geo');
	}
}

function loadJsonObject(filepath) {
	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load(filepath, function (geometry, materials) {
		geometry.normalize();
		geometry.scale(6,6,6);
		geometry.lookAt(new THREE.Vector3(0, 1, 0));

		console.log("call reDraw from load json ");
		geometry.rotateY(270.0/180.0*3.14);
		geometry.translate(0, 1, 0);
		m_jsonGeo = geometry;
		
		this.reDraw();

	})
}

function createModel(id) {
	var geometry;

	//create teapot
	m_modelSize = teapotSize;
	m_teapotGeo = new THREE.TeapotGeometry(
	teapotSize, // size
	12, // tess-segments
	true, // bottom
	true, // lid
	true, // body
	false, //fitlid
	true ); // blinn

	//create bunny
	loadJsonObject("js/bunny-geo.json");

	if (id !== "Bunny") { // or other json object
		console.log("call redraw from create model");
		reDraw();
	} 

}

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x808080, 8*teapotSize, 16*teapotSize);
	
	scene.add(camera);
	
	// LIGHTS
	
	scene.add(ambientLight);
	scene.add(light);
	
	// GROUND and GRIDS
	
	// put grid lines every 1 unit
	solidGround = new THREE.Mesh(
		new THREE.PlaneGeometry( 100, 100, 100, 100 ),
		new THREE.MeshLambertMaterial( { color: 0xffffff } ) );
	solidGround.rotation.x = - Math.PI / 2;
	// cheat: offset by a small amount so grid is on top
	// TODO: better way in three.js? Polygon offset is used in WebGL.
	solidGround.position.y = -0.01;
	
	ground = new THREE.Mesh(
		new THREE.PlaneGeometry( 100, 100, 100, 100 ),
		new THREE.MeshBasicMaterial( { color: 0x0, wireframe: true } ) );
	ground.rotation.x = - Math.PI / 2;
	
	scene.add( solidGround );
	
	scene.add( ground );

}
