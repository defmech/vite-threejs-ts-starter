import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import vertexShader from './glsl/vertexShader.glsl?raw';
import fragmentShader from './glsl/fragmentShader.glsl?raw';

export default class Shader {
	private renderer!: THREE.WebGLRenderer;
	private scene!: THREE.Scene;
	private camera!: THREE.Camera;
	private clock!: THREE.Clock;

	private controls!: OrbitControls;
	private stats!: any;

	private plane!: THREE.Mesh;

	private uniforms!: any;

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
		this.clock = new THREE.Clock();

		this.camera = new THREE.Camera();
		this.camera.position.z = 2;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild(this.renderer.domElement);

		// Add a plane
		const geometryPlane = new THREE.PlaneBufferGeometry(2, 2, 1, 1);

		this.uniforms = {
			u_time: { type: 'f', value: 1.0 },
			u_resolution: { type: 'v2', value: new THREE.Vector2() },
			u_mouse: { type: 'v2', value: new THREE.Vector2() },
		};

		const materialPlane = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader,
			fragmentShader,
		});

		this.plane = new THREE.Mesh(geometryPlane, materialPlane);
		this.scene.add(this.plane);

		// Init animation
		this.animate();
	}

	initListeners() {
		this.onWindowResize();
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
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
		this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
	}

	animate() {
		requestAnimationFrame(() => {
			this.animate();
		});

		this.uniforms.u_time.value += this.clock.getDelta();

		if (this.stats) this.stats.update();

		if (this.controls) this.controls.update();

		this.renderer.render(this.scene, this.camera);
	}
}
