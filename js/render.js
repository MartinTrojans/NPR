var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, camera, scene, renderer, stats;
var cameraRT; //render target camera
var sceneRT; // render target scene
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
var m_chairGeo;

var m_textureRepeat = 1.0;

var m_MarioGeo;

var m_creaseAngle = 0.8;

var m_teapotGeo;

var ambientLight, light;
var wireframeMaterial, phongMaterial;
var hatchShaderMaterial;
var chineseShaderMaterial;

var ToonShaderMaterial;

// material rendering on the teapot
var nowMaterial;

var solidGround, ground;
var ToonOffset;
var toonOutlineWidth;

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
	light.position.set(5, 39, 90);

	// RENDERER

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	renderer.setClearColor(0xffffff, 1.0);
   // console.log(renderer.getMaxAnisotropy()); //for the mipmap texture

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

	wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x0000FF, wireframe: true } ) ;

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
	ToonShaderMaterial = createShaderMaterial(
		"ToonShading",
		light,
		ambientLight,
		materialColor,
		effectController.cull);
	ToonOutlineMaterial = createShaderMaterial(
		"Outline",
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
	var material;
	if (id == "ChineseShading") {
		material = new THREE.ChineseMaterial(ambientLight);
	}
	else if (id == "phong") {
		shader = THREE.ShaderTypes[id];
		var u = THREE.UniformsUtils.clone(shader.uniforms);

		var vs = shader.vertexShader;
		var fs = shader.fragmentShader;

		material = new THREE.ShaderMaterial({
			uniforms: u,
			vertexShader: vs,
			fragmentShader: fs });

	}
	else if (id == "HatchShader") {

		//material = new THREE.HatchShaderMaterial();
		material = new THREE.MipmapShaderMaterial();
	}
	else if (id == "ToonShading") {
		shader = THREE.ToonShader;

		var u = THREE.UniformsUtils.clone(shader.uniforms);

		var vs = shader.vertexShader;
		var fs = shader.fragmentShader;

		material = new THREE.ShaderMaterial({
			uniforms: u,
			vertexShader: vs,
			fragmentShader: fs });
		material.uniforms.uAmbientLightColor.value = ambientLight.color;
	}
	else if (id == "Outline") {
		shader = THREE.ToonOutline;

		var u = THREE.UniformsUtils.clone(shader.uniforms);

		var vs = shader.vertexShader;
		var fs = shader.fragmentShader;

		material = new THREE.ShaderMaterial({
			uniforms: u,
			vertexShader: vs,
			fragmentShader: fs });
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

		ka: 1.0,
		kd: 1.0,
		ks: 0.5,

		red: 0.8,
		green: 0.2,
		blue: 0.2,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: 0.0,
		ly: 0.3,
		lz: 1.0,

		ground: false,
		xzgrid: false,

		style: "HatchShader",

		edge: true,

		edgewidth: 5,
		creaseAngle: 0.6,

		toonOffset : 0.5,
		toonOutlineWidth : 3.0,

		model: "Teapot",
	};

	var h;

	var gui = new dat.GUI();

	// model
	gui.add( effectController, "model", ["Sphere", "Teapot", "Chair", "Bunny"]).name("Model");
	// style
	gui.add( effectController, "style", ["Wireframe","Phong", "ToonShading", "HatchShader", "ChineseShading"] ).name("Style");


	// edge attributes
	h = gui.addFolder("Silhouette Edge Control");
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

	// toon Shading setting
	h = gui.addFolder("ToonShading");

	h.add( effectController, "toonOffset", 0.0, 1.0, 0.01).name("Offset");
	h.add( effectController, "toonOutlineWidth", 1.0, 8.0, 1.0).name("Outline Width");

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
		toonOffset = effectController.toonOffset;

		console.log('call redraw from update');
		if ( sStyle === "Wireframe" ) {
			nowMaterial = wireframeMaterial;

		} else if ( sStyle === "Phong" ) {

			nowMaterial = phongMaterial;

		} else if ( sStyle === "ChineseShading") {

			nowMaterial = chineseShaderMaterial;

		} else if ( sStyle === "HatchShader") {

			nowMaterial = hatchShaderMaterial;

		} else if ( sStyle === "ToonShading") {

			nowMaterial = ToonShaderMaterial;


		} else {

			console.error("Unknown style: " + sStyle);

		}

		fillScene();

		reDraw();
	}

	if (nowMaterial.uniforms != undefined) {
		if (nowMaterial.uniforms.uKd != undefined) {
			nowMaterial.uniforms.uKd.value = effectController.kd;
		}

		if (nowMaterial.uniforms.uKs != undefined) {
			nowMaterial.uniforms.uKs.value = effectController.ks;
		}

		if (nowMaterial.uniforms.uMaterialColor !== undefined) {
			var materialColor = new THREE.Color();

			materialColor.setRGB( effectController.red, effectController.green, effectController.blue );

			nowMaterial.uniforms.uMaterialColor.value.copy(materialColor);
		}

		if(nowMaterial.uniforms.offset !== undefined){
			nowMaterial.uniforms.offset.value = effectController.toonOffset;
		}

		if (nowMaterial.uniforms.repeat !== undefined) {
			nowMaterial.uniforms.repeat.value = m_textureRepeat;
		}

	}



	solidGround.visible = effectController.ground;
	ground.visible = effectController.xzgrid;

	ambientLight.color.setHSL(0.0, 0.0, effectController.ka);

	light.position.set(effectController.lx, effectController.ly, effectController.lz);
	light.position.normalize();

	renderer.render(scene, camera);

}

function reDraw() {


	m_textureRepeat = 1.0;
	if (m_model == 'Bunny') {
		geometry = m_jsonGeo;
		m_textureRepeat = 8.0;
	}
	else  if (m_model == 'Teapot')
	{
		geometry = m_teapotGeo;
	}
	else if (m_model == 'Sphere')
	{
		geometry = new THREE.SphereGeometry(5, 32, 32);
		m_modelSize = 3;
		m_textureRepeat = 2.0;

	}
	else if (m_model == 'Mario') {
		geometry = m_MarioGeo;
	}
	else if (m_model == 'Chair') {
		geometry = m_chairGeo;
		m_textureRepeat = 6.0;
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
				var line = new THREE.ChineseRidgeGeometry(geometry, m_creaseAngle);
				var chinesePainting = new THREE.Mesh(line, ridgeMaterial);
				chinesePainting.position.y = m_modelSize;

				scene.add(chinesePainting);
			}
			else {
				var ridgeGeo = new THREE.SimpleRidgeGeometry(geometry, m_creaseAngle);

				ridgeMaterial.linewidth = sStyle === "HatchShader" ? 2.0 : edgewidth;
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

	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load("js/bunny-geo.json", function (geometry, materials) {
		m_jsonGeo =  new THREE.BunnyGeometry("Bunny", geometry);

		console.assert(m_jsonGeo !== undefined, "BunnyGeometry failed to load.");
		this.reDraw();
	})

	jsonLoader.load("js/chair.json", function (geometry, materials) {
		m_chairGeo =  new THREE.BunnyGeometry("Chair", geometry);

		console.assert(m_chairGeo !== undefined, "ChairGeometry failed to load.");
		this.reDraw();
	})

	if ((id !== "Bunny") || (id != "Chair")){ // or other json object
		console.log("call redraw from create model");
		reDraw();
	}

}

function fillScene() {
	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog(0x808080, 8*teapotSize, 16*teapotSize);

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
