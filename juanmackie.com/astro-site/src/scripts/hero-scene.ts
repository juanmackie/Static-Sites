const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionScale = reduceMotion ? 0 : 1;
const maxDpr = 1.75;

type ThreeModule = typeof import('three');

let threePromise: Promise<ThreeModule> | undefined;

const loadThree = () => {
  threePromise ??= import('three');
  return threePromise;
};

const getColor = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const setRendererSize = (
  renderer: import('three').WebGLRenderer,
  canvas: HTMLCanvasElement,
  camera: import('three').PerspectiveCamera,
) => {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const createTimer = () => {
  let start = performance.now();
  let previous = start;

  return {
    restart() {
      start = performance.now();
      previous = start;
    },
    elapsed() {
      return (performance.now() - start) / 1000;
    },
    delta() {
      const current = performance.now();
      const value = (current - previous) / 1000;
      previous = current;
      return value;
    },
  };
};

const initWirefield = async (host: HTMLElement) => {
  const canvas = host.querySelector<HTMLCanvasElement>('[data-hero-wirefield-canvas]');
  if (!canvas || host.dataset.initialized === 'true' || reduceMotion) return;
  host.dataset.initialized = 'true';

  const THREE = await loadThree();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 5.2, 9.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  host.dataset.ready = 'true';
  renderer.setClearColor(0x000000, 0);

  const geometry = new THREE.PlaneGeometry(16, 10, 28, 18);
  geometry.rotateX(-Math.PI * 0.48);
  const positions = geometry.attributes.position;
  const baseY = new Float32Array(positions.count);

  for (let i = 0; i < positions.count; i += 1) {
    baseY[i] = positions.getY(i);
  }

  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(getColor('--accent', '#ff6a21')),
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0.4, -1.9, -1.4);
  scene.add(mesh);

  let frameId = 0;
  let running = false;
  let inView = false;
  let pageVisible = !document.hidden;
  const timer = createTimer();

  const renderFrame = () => {
    const elapsed = timer.elapsed();

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const wave = Math.sin((x * 0.42) + (elapsed * 0.22 * motionScale)) * 0.045 * motionScale
        + Math.cos((z * 0.38) - (elapsed * 0.16 * motionScale)) * 0.035 * motionScale;
      positions.setY(i, baseY[i] + wave);
    }

    positions.needsUpdate = true;
    mesh.rotation.z = Math.sin(elapsed * 0.14 * motionScale) * 0.012 * motionScale;

    renderer.render(scene, camera);

    if (running) frameId = window.requestAnimationFrame(renderFrame);
  };

  const resize = () => {
    setRendererSize(renderer, canvas, camera);
    if (!running) renderer.render(scene, camera);
  };

  const start = () => {
    if (running || !inView || !pageVisible) return;
    running = true;
    timer.restart();
    renderFrame();
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frameId);
  };

  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const visibilityObserver = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    if (inView && pageVisible) start(); else stop();
  });
  visibilityObserver.observe(host);

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (pageVisible && inView) start(); else stop();
  });
};

const initOrb = async (host: HTMLElement) => {
  const canvas = host.querySelector<HTMLCanvasElement>('[data-hero-orb-canvas]');
  if (!canvas || host.dataset.initialized === 'true' || reduceMotion) return;
  host.dataset.initialized = 'true';

  const THREE = await loadThree();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 20);
  camera.position.z = 5.3;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  host.dataset.ready = 'true';
  renderer.setClearColor(0x000000, 0);

  const geometry = new THREE.OctahedronGeometry(1.25, 1);
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
    color: new THREE.Color(getColor('--signal', '#c7ff3b')),
    transparent: true,
    opacity: 1,
  }));
  line.rotation.set(0.38, 0.2, 0.12);
  scene.add(line);

  let frameId = 0;
  let running = false;
  let inView = false;
  let pageVisible = !document.hidden;
  const timer = createTimer();

  const renderFrame = () => {
    const delta = Math.min(timer.delta(), 0.05);

    line.rotation.y += delta * 0.42 * motionScale;
    line.rotation.x += delta * 0.14 * motionScale;

    renderer.render(scene, camera);
    if (running) frameId = window.requestAnimationFrame(renderFrame);
  };

  const resize = () => {
    setRendererSize(renderer, canvas, camera);
    if (!running) renderer.render(scene, camera);
  };

  const start = () => {
    if (running || !inView || !pageVisible) return;
    running = true;
    timer.restart();
    renderFrame();
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frameId);
  };

  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const visibilityObserver = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    if (inView && pageVisible) start(); else stop();
  });
  visibilityObserver.observe(host);

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (pageVisible && inView) start(); else stop();
  });
};

const initHeroScenes = () => {
  if (reduceMotion) return;
  const hosts = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-wirefield], [data-hero-orb]'));
  if (hosts.length === 0) return;

  const initialize = (host: HTMLElement) => {
    if (host.hasAttribute('data-hero-wirefield')) void initWirefield(host);
    else void initOrb(host);
  };

  if (!('IntersectionObserver' in window)) {
    hosts.forEach(initialize);
    return;
  }

  const loaderObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) return;
      loaderObserver.unobserve(entry.target);
      initialize(entry.target);
    });
  }, { rootMargin: '120px' });
  hosts.forEach((host) => loaderObserver.observe(host));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroScenes, { once: true });
} else {
  initHeroScenes();
}
