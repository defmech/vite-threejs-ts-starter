import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Demo {
	private renderer!: THREE.WebGLRenderer;
	private scene!: THREE.Scene;
	private camera!: THREE.PerspectiveCamera;

	private lightAmbient!: THREE.AmbientLight;
	private lightPoint!: THREE.PointLight;

	private controls!: OrbitControls;
	private stats!: any;

	private cube!: THREE.Mesh;
	private plane!: THREE.Mesh;

	constructor() {
		this.initScene();
		this.initStats();
		this.initListeners();
	}

	initStats() {
		this.stats = new (Stats as any)();
		document.body.appendChild(this.stats.dom);
	}

	initScene() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.z = 5;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.lightAmbient = new THREE.AmbientLight(0x404040);
		this.scene.add(this.lightAmbient);

		// Add a point light to add shadows
		// https://github.com/mrdoob/three.js/pull/14087#issuecomment-431003830
		const shadowIntensity = 0.25;

		this.lightPoint = new THREE.PointLight(0xffffff);
		this.lightPoint.position.set(-0.5, 0.5, 4);
		this.lightPoint.castShadow = true;
		this.lightPoint.intensity = shadowIntensity;
		this.scene.add(this.lightPoint);

		const lightPoint2 = this.lightPoint.clone();
		lightPoint2.intensity = 1 - shadowIntensity;
		lightPoint2.castShadow = false;
		this.scene.add(lightPoint2);

		const mapSize = 1024; // Default 512
		const cameraNear = 0.5; // Default 0.5
		const cameraFar = 500; // Default 500
		this.lightPoint.shadow.mapSize.width = mapSize;
		this.lightPoint.shadow.mapSize.height = mapSize;
		this.lightPoint.shadow.camera.near = cameraNear;
		this.lightPoint.shadow.camera.far = cameraFar;

		// Add a cube
		const geometryBox = new THREE.BoxGeometry();
		const materialBox = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
		this.cube = new THREE.Mesh(geometryBox, materialBox);
		this.cube.castShadow = true;
		this.scene.add(this.cube);

		// Add a plane
		const geometryPlane = new THREE.PlaneBufferGeometry(6, 6, 1, 1);
		const materialPlane = new THREE.MeshPhongMaterial({ color: 0x666666 });

		this.plane = new THREE.Mesh(geometryPlane, materialPlane);
		this.plane.position.z = -2;
		this.plane.receiveShadow = true;
		this.scene.add(this.plane);

		// Init animation
		this.animate();
	}

	initListeners() {
		window.addEventListener('resize', this.onWindowResize.bind(this), false);

		window.addEventListener('keydown', (event) => {
			const { key } = event;

			switch (key) {
				case 'e':
					const win = window.open('', 'Canvas Image');

					const { domElement } = this.renderer;

					// Makse sure scene is rendered.
					this.renderer.render(this.scene, this.camera);

					const src = domElement.toDataURL();

					if (!win) return;

					win.document.write(`<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`);
					break;

				default:
					break;
			}
		});
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	animate() {
		requestAnimationFrame(() => {
			this.animate();
		});

		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;

		if (this.stats) this.stats.update();

		if (this.controls) this.controls.update();

		this.renderer.render(this.scene, this.camera);
	}
}
