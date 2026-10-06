import * as THREE from 'three';

export class ThreeBackdrop {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 100);
  private group = new THREE.Group();
  private raf = 0;

  constructor(host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.domElement.className = 'three-backdrop';
    host.prepend(this.renderer.domElement);
    this.camera.position.z = 8;
    this.scene.add(this.group);

    const geometry = new THREE.IcosahedronGeometry(0.16, 1);
    const cyan = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 });

    for (let i = 0; i < 42; i += 1) {
      const mesh = new THREE.Mesh(geometry, i % 4 === 0 ? amber : cyan);
      mesh.position.set(
        THREE.MathUtils.randFloatSpread(13),
        THREE.MathUtils.randFloatSpread(7),
        THREE.MathUtils.randFloat(-3, 2),
      );
      mesh.scale.setScalar(THREE.MathUtils.randFloat(0.5, 1.8));
      this.group.add(mesh);
    }

    window.addEventListener('resize', this.resize);
    this.resize();
    this.tick();
  }

  private resize = () => {
    const el = this.renderer.domElement.parentElement;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  };

  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    const t = performance.now() * 0.00035;
    this.group.rotation.z = Math.sin(t) * 0.08;
    this.group.rotation.y = t * 0.35;
    for (let i = 0; i < this.group.children.length; i += 1) {
      const obj = this.group.children[i];
      obj.position.y += Math.sin(t * 3 + i) * 0.0018;
      obj.rotation.x += 0.003;
      obj.rotation.y += 0.004;
    }
    this.renderer.render(this.scene, this.camera);
  };

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
