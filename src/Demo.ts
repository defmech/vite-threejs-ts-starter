import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ////////////////////////////////////////////////////////////////////

const lightingAmbientConfig: any = {
	color: 0x404040,
	intensity: 1,
};

const lightPointConfig: any = {
	color: 0xffffff,
	shadowIntensity: 0.25,
};

const configHero: THREE.MeshPhysicalMaterialParameters = {
	color: 0x00ff00,
	roughness: 0.5,
	metalness: 0.5,
	reflectivity: 0.5,
	clearcoat: 0,
	clearcoatRoughness: 0,
};

// ////////////////////////////////////////////////////////////////////

export default class Demo {
	private renderer!: THREE.WebGLRenderer;
	private scene!: THREE.Scene;
	private camera!: THREE.PerspectiveCamera;

	private lightAmbient!: THREE.AmbientLight;
	private lightPoint!: THREE.PointLight;
	private lightPoint2!: THREE.PointLight;

	private controls!: OrbitControls;
	private stats!: any;

	private hero!: THREE.Mesh;
	private plane!: THREE.Mesh;

	private gui!: GUI;

	private clock: THREE.Clock = new THREE.Clock();

	constructor() {
		this.initScene();

		this.initControls();
		this.initLighting();
		this.initSceneContent();
		this.initStats();
		this.initListeners();

		this.initGUI();
		// Start animation
		this.animate();
	}

	initGUI() {
		this.gui = new GUI();

		// Lighting

		const lighting = this.gui.addFolder('Lighting');

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		const lightingAmbient = lighting.addFolder('Ambient');

		lightingAmbient.addColor(lightingAmbientConfig, 'color').onChange((value: number) => {
			this.lightAmbient.color.set(value);
		});

		lightingAmbient
			.add(lightingAmbientConfig, 'intensity')
			.onChange((value: number) => {
				this.lightAmbient.intensity = value;
			})
			.min(0.1)
			.max(10);

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		// Point

		const lightingPoint = lighting.addFolder('Point');

		lightingPoint.addColor(lightPointConfig, 'color').onChange((value: number) => {
			this.lightPoint.color.set(value);
			this.lightPoint2.color.set(value);
		});

		lightingPoint
			.add(lightPointConfig, 'shadowIntensity')
			.min(0)
			.max(1)
			.onChange((value: number) => {
				this.lightPoint.intensity = value;
				this.lightPoint2.intensity = 1 - value;
			});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		// Cube Material

		const cubeFolder = this.gui.addFolder('Cube');

		const cubeMaterial = cubeFolder.addFolder('Material');

		cubeMaterial.addColor(configHero, 'color').onChange((value: number) => {
			const material = this.hero.material as THREE.MeshPhysicalMaterial;
			material.color.set(value);
		});

		cubeMaterial
			.add(configHero, 'roughness')
			.min(0)
			.max(1)
			.onChange((value: number) => {
				const material = this.hero.material as THREE.MeshPhysicalMaterial;
				material.roughness = value;
			});
		cubeMaterial
			.add(configHero, 'metalness')
			.min(0)
			.max(1)
			.onChange((value: number) => {
				const material = this.hero.material as THREE.MeshPhysicalMaterial;
				material.metalness = value;
			});
		cubeMaterial
			.add(configHero, 'reflectivity')
			.min(0)
			.max(1)
			.onChange((value: number) => {
				const material = this.hero.material as THREE.MeshPhysicalMaterial;
				material.reflectivity = value;
			});
		cubeMaterial
			.add(configHero, 'clearcoat')
			.min(0)
			.max(1)
			.onChange((value: number) => {
				const material = this.hero.material as THREE.MeshPhysicalMaterial;
				material.clearcoat = value;
			});
		cubeMaterial
			.add(configHero, 'clearcoatRoughness')
			.min(0)
			.max(1)
			.onChange((value: number) => {
				const material = this.hero.material as THREE.MeshPhysicalMaterial;
				material.clearcoatRoughness = value;
			});

		/**
			 *
clearcoat
clearcoatRoughness
			 */
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
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// Limit to a max devicePixelRatio of 2 for performance.
		// Possible for some devices to have 3 or more but almost no visible difference.
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild(this.renderer.domElement);
	}

	initControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	}

	initLighting() {
		this.lightAmbient = new THREE.AmbientLight(lightingAmbientConfig.color, lightingAmbientConfig.intensity);
		this.scene.add(this.lightAmbient);

		// Add a point light to add shadows
		// https://github.com/mrdoob/three.js/pull/14087#issuecomment-431003830

		this.lightPoint = new THREE.PointLight(lightPointConfig.color);
		this.lightPoint.position.set(-0.5, 0.5, 4);
		this.lightPoint.castShadow = true;
		this.lightPoint.intensity = lightPointConfig.shadowIntensity;
		this.scene.add(this.lightPoint);

		this.lightPoint2 = this.lightPoint.clone();
		this.lightPoint2.intensity = 1 - lightPointConfig.shadowIntensity;
		this.lightPoint2.castShadow = false;
		this.scene.add(this.lightPoint2);

		const mapSize = 512; // Default 512
		const cameraNear = 0.5; // Default 0.5
		const cameraFar = 500; // Default 500
		this.lightPoint.shadow.mapSize.width = mapSize;
		this.lightPoint.shadow.mapSize.height = mapSize;
		this.lightPoint.shadow.camera.near = cameraNear;
		this.lightPoint.shadow.camera.far = cameraFar;
	}

	initSceneContent() {
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		// Add a cube

		const geometryHero = new THREE.TorusKnotGeometry(0.75, 0.25, 100, 16);
		const materialHero = new THREE.MeshPhysicalMaterial(configHero);

		materialHero.color.convertSRGBToLinear();

		this.hero = new THREE.Mesh(geometryHero, materialHero);
		this.hero.castShadow = true;
		this.scene.add(this.hero);

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		// Add a plane

		const textureName = 'Concrete_Blocks_011';

		const textureDifusse = new THREE.TextureLoader().load(`./textures/${textureName}_SD/${textureName}_basecolor.jpg`);

		const textureHeight = new THREE.TextureLoader().load(`./textures/${textureName}_SD/${textureName}_height.png`); // !!! PNG

		const textureNormal = new THREE.TextureLoader().load(`./textures/${textureName}_SD/${textureName}_normal.jpg`);

		const textureRoughness = new THREE.TextureLoader().load(`./textures/${textureName}_SD/${textureName}_roughness.jpg`);

		const textureAO = new THREE.TextureLoader().load(`./textures/${textureName}_SD/${textureName}_ambientOcclusion.jpg`);

		const geometryPlane = new THREE.PlaneBufferGeometry(6, 6, 1, 1);
		const materialPlane = new THREE.MeshPhysicalMaterial({
			color: 0x666666,
			map: textureDifusse,
			bumpMap: textureHeight,
			normalMap: textureNormal,
			roughnessMap: textureRoughness,
			aoMap: textureAO,
		});
		materialPlane.color.convertSRGBToLinear();

		this.plane = new THREE.Mesh(geometryPlane, materialPlane);
		this.plane.position.z = -2;
		this.plane.receiveShadow = true;
		this.scene.add(this.plane);
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

		const delta = this.clock.getDelta();

		this.hero.rotation.x += 0.6 * delta;
		this.hero.rotation.y += 0.6 * delta;

		if (this.stats) this.stats.update();

		if (this.controls) this.controls.update();

		this.renderer.render(this.scene, this.camera);
	}
}
