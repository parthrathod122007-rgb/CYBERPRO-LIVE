/**
 * CYBERPRO — ULTIMATE ANTI-GRAVITY 3D WEBGL UNIVERSE ENGINE
 * Stack: Three.js r150 + Custom GLSL Shaders + EffectComposer/UnrealBloomPass
 *        + InstancedMesh + Points + GSAP ScrollTrigger + Lenis Smooth Scroll
 * Zero HTML occlusion: canvas is fixed pointer-events: none behind transparent #landing-page
 */
import * as THREE from 'three';
import { EffectComposer } from '/assets/three/EffectComposer.js';
import { RenderPass } from '/assets/three/RenderPass.js';
import { UnrealBloomPass } from '/assets/three/UnrealBloomPass.js';

(function () {
  'use strict';

  const landingEl = document.getElementById('landing-page');
  if (!landingEl) return;

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vw = window.innerWidth || 1280;
  const isMobile = vw <= 640;
  const isTablet = vw > 640 && vw <= 1024;
  const devMem = Number(navigator.deviceMemory) || 8;
  const hwCores = Number(navigator.hardwareConcurrency) || 8;
  const isCoarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const isLowTier = prefersReducedMotion || isMobile || isCoarsePointer || devMem <= 4 || hwCores <= 4;

  const PARTICLE_COUNT = prefersReducedMotion ? 1200 : isLowTier ? 1600 : isTablet ? 4600 : 7600;
  const DUST_COUNT = prefersReducedMotion ? 180 : isLowTier ? 260 : isTablet ? 750 : 1100;
  const NODE_INSTANCE_COUNT = isLowTier ? 14 : isTablet ? 28 : 36;

  // ---------------------------------------------------------------------------
  // 1. Mount Global Fixed WebGL Container
  // ---------------------------------------------------------------------------
  let rootEl = document.getElementById('cyberpro-webgl-root');
  if (!rootEl) {
    rootEl = document.createElement('div');
    rootEl.id = 'cyberpro-webgl-root';
    rootEl.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(rootEl, document.body.firstChild);
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'cyberpro-webgl-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  rootEl.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('[CYBERPRO WebGL] WebGL unavailable, falling back cleanly:', err);
    return;
  }

  const dpr = isLowTier ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030604, 0.022);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 140);
  camera.position.set(0, 0, isMobile ? 22 : 18.5);

  const ambientLight = new THREE.AmbientLight(0x0d2b16, 1.4);
  const keyLight = new THREE.PointLight(0x00ff41, 2.2, 48);
  keyLight.position.set(8, 7, 12);
  const rimLight = new THREE.PointLight(0x39ff14, 1.4, 42);
  rimLight.position.set(-9, -6, 8);
  scene.add(ambientLight, keyLight, rimLight);

  // ---------------------------------------------------------------------------
  // 2. EffectComposer + UnrealBloomPass Post-Processing
  // ---------------------------------------------------------------------------
  let composer = null;
  let bloomPass = null;
  let bloomEnabled = false;

  if (!isLowTier) {
    try {
      // Half-res bloom FBO cuts GPU fillrate ~70% while keeping identical atmospheric glow
      const bloomScale = 0.55;
      const rt = new THREE.WebGLRenderTarget(
        Math.max(2, Math.floor(window.innerWidth * dpr * bloomScale)),
        Math.max(2, Math.floor(window.innerHeight * dpr * bloomScale)),
        { type: THREE.HalfFloatType, format: THREE.RGBAFormat }
      );
      composer = new EffectComposer(renderer, rt);
      const renderPass = new RenderPass(scene, camera);
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(Math.max(2, Math.floor(window.innerWidth * bloomScale)), Math.max(2, Math.floor(window.innerHeight * bloomScale))),
        0.34,
        0.56,
        0.34
      );
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      bloomEnabled = true;
    } catch (e) {
      console.warn('[CYBERPRO WebGL] Bloom composer fallback active:', e);
      composer = null;
      bloomEnabled = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Procedural 3D Scene Targets Generator (Head, Earth, Organic Void)
  // ---------------------------------------------------------------------------
  function hashRand(i, salt) {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  // Build Scene 1: Volumetric 3D Cybernetic Robot Head + Visor + Jaw + Shoulders
  function generateCyberRobotHead(count) {
    const pos = new Float32Array(count * 3);
    const role = new Float32Array(count); // 1.0 = eye/core highlight, 0.6 = armor, 0.25 = shoulder/tube

    for (let i = 0; i < count; i++) {
      const r1 = hashRand(i, 1.1);
      const r2 = hashRand(i, 2.3);
      const r3 = hashRand(i, 3.7);
      const bucket = hashRand(i, 4.9);
      let x = 0, y = 0, z = 0, w = 0.55;

      if (bucket < 0.38) {
        // Upper Sculpted Cranium & Brow Armor Dome
        const theta = (r1 * 2 - 1) * Math.PI * 0.92;
        const phi = r2 * Math.PI * 0.54;
        const radX = 2.75 * Math.sin(phi);
        const radZ = 3.05 * Math.sin(phi);
        x = radX * Math.sin(theta);
        y = 1.1 + 2.65 * Math.cos(phi) + (r3 - 0.5) * 0.08;
        z = radZ * Math.cos(theta) - 0.35;
        // Faceted cybernetic center crest ridge
        if (Math.abs(x) < 0.36 && z > 0.2) {
          y += 0.26 * (1 - Math.abs(x) / 0.36);
          w = 0.85;
        } else {
          w = 0.58;
        }
      } else if (bucket < 0.56) {
        // Angular Cheekplates & Armored Jaw / Chin
        const side = r1 < 0.5 ? -1 : 1;
        const t = r2; // vertical 0 (cheek) -> 1 (chin)
        const angle = (r3 * 0.85) * side;
        const widthAtY = 2.55 - t * 1.45;
        const depthAtY = 2.45 - t * 0.65;
        x = Math.sin(angle) * widthAtY;
        y = 0.45 - t * 2.55;
        z = Math.cos(angle) * depthAtY - 0.15;
        // Jaw mechanical panel ridge accent
        w = Math.abs(t - 0.65) < 0.08 ? 0.82 : 0.5;
      } else if (bucket < 0.71) {
        // Twin Iconic Glowing Neon-Green Optical Goggles / Visor Rings
        const side = r1 < 0.5 ? -1 : 1;
        const ringT = r2 * Math.PI * 2;
        const isRim = r3 > 0.35;
        const lensR = isRim ? 0.62 + (r3 - 0.35) * 0.18 : 0.45 * Math.sqrt(r3 / 0.35);
        x = side * 0.96 + Math.cos(ringT) * lensR * 0.96;
        y = 0.52 + Math.sin(ringT) * lensR * 0.72;
        z = 2.28 + Math.cos(ringT) * 0.14 - Math.abs(side * 0.15);
        w = 1.0; // Intense bright neon green bloom core!
      } else if (bucket < 0.84) {
        // Cranial Neural Pipes / Conduits Arching Upward from Crown
        const tubeIdx = Math.floor(r1 * 4); // 4 cables (-1.5, -0.5, 0.5, 1.5)
        const spreadX = [-1.45, -0.55, 0.55, 1.45][tubeIdx];
        const t = r2; // 0 (crown) -> 1 (top)
        const circ = r3 * Math.PI * 2;
        const cableR = 0.22;
        x = spreadX * (1 + t * 0.65) + Math.cos(circ) * cableR;
        y = 3.15 + t * 2.85;
        z = -0.35 - t * t * 1.35 + Math.sin(circ) * cableR;
        w = t < 0.25 ? 0.85 : 0.42;
      } else {
        // Neck Hydraulics & Collar / Broad Cyber Shoulders
        const isNeck = r1 < 0.38;
        if (isNeck) {
          const ang = (r2 * 2 - 1) * Math.PI * 0.75;
          x = Math.sin(ang) * 1.25;
          y = -1.9 - r3 * 1.45;
          z = Math.cos(ang) * 1.25 - 0.35;
          w = 0.36;
        } else {
          const sx = (r2 * 2 - 1) * 4.9;
          const arch = Math.pow(Math.abs(sx) / 4.9, 1.45);
          x = sx;
          y = -3.15 - arch * 1.15 + (r3 - 0.5) * 0.35;
          z = (r3 - 0.5) * 2.1 - arch * 0.75 - 0.2;
          w = 0.34;
        }
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      role[i] = w;
    }

    return { pos, role };
  }

  // Build Scene 3: Holographic Earth Initial Spherical Shells + Real Continent Map Sampler
  function latLonToVec3(latDeg, lonDeg, radius) {
    const phi = (90 - latDeg) * (Math.PI / 180);
    const theta = (lonDeg + 180) * (Math.PI / 180);
    return [
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ];
  }

  function generateFibonacciGlobe(count, radius) {
    const pos = new Float32Array(count * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const yNorm = 1 - (i / Math.max(1, count - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
      const theta = goldenAngle * i;
      const r = radius + (hashRand(i, 9.1) > 0.92 ? 0.35 : 0);
      pos[i * 3] = Math.cos(theta) * rAtY * r;
      pos[i * 3 + 1] = yNorm * r;
      pos[i * 3 + 2] = Math.sin(theta) * rAtY * r;
    }
    return pos;
  }

  // Build Scene 4: Organic Digital Void Energy Core (Trefoil Harmonic Core + Floating Cloud)
  function generateDigitalVoidCore(count) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r1 = hashRand(i, 5.2);
      const r2 = hashRand(i, 6.4);
      const r3 = hashRand(i, 7.8);
      let x = 0, y = 0, z = 0;

      if (i < count * 0.42) {
        // Dense Flowing Torus-Knot Harmonic Nucleus
        const u = r1 * Math.PI * 2;
        const v = r2 * Math.PI * 2;
        const p = 2, q = 3;
        const coreR = 2.65 + 0.95 * Math.cos(q * u);
        const tubeR = 0.52 + r3 * 0.45;
        const cx = coreR * Math.cos(p * u);
        const cy = coreR * Math.sin(p * u);
        const cz = 1.25 * Math.sin(q * u);
        x = cx + Math.cos(v) * tubeR;
        y = cz + Math.sin(v) * tubeR;
        z = cy + Math.sin(u + v) * tubeR * 0.7;
      } else if (i < count * 0.74) {
        // Multi-Lobed Organic Spherical Harmonic Shell
        const u = r1 * Math.PI * 2;
        const phi = Math.acos(2 * r2 - 1);
        const wave = 4.2 + 1.25 * Math.sin(3 * phi) * Math.cos(4 * u) + (r3 - 0.5) * 0.5;
        x = wave * Math.sin(phi) * Math.cos(u);
        y = wave * Math.cos(phi) * 0.85;
        z = wave * Math.sin(phi) * Math.sin(u);
      } else {
        // Swirling Outer Cyber Nebula Halo
        const u = r1 * Math.PI * 2;
        const phi = Math.acos(2 * r2 - 1);
        const rad = 5.5 + Math.pow(r3, 0.7) * 5.8;
        x = rad * Math.sin(phi) * Math.cos(u);
        y = rad * Math.cos(phi) * 0.72;
        z = rad * Math.sin(phi) * Math.sin(u);
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }

  // ---------------------------------------------------------------------------
  // 4. Primary GPU Morphing Particle System + Custom GLSL Shaders
  // ---------------------------------------------------------------------------
  const headData = generateCyberRobotHead(PARTICLE_COUNT);
  const earthFallbackPos = generateFibonacciGlobe(PARTICLE_COUNT, 5.4);
  const voidPos = generateDigitalVoidCore(PARTICLE_COUNT);

  const seedAttr = new Float32Array(PARTICLE_COUNT * 4);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    seedAttr[i * 4] = hashRand(i, 10.1);        // phase [0..1]
    seedAttr[i * 4 + 1] = hashRand(i, 11.3);    // speed / radial variance
    seedAttr[i * 4 + 2] = hashRand(i, 12.7);    // upward float factor
    seedAttr[i * 4 + 3] = hashRand(i, 14.2);    // size variance
  }

  const morphGeo = new THREE.BufferGeometry();
  // 'position' attribute stays bound so Three.js uses valid vertices; shaders morph seamlessly
  morphGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(headData.pos), 3));
  morphGeo.setAttribute('aPosHead', new THREE.BufferAttribute(headData.pos, 3));
  morphGeo.setAttribute('aPosEarth', new THREE.BufferAttribute(earthFallbackPos, 3));
  morphGeo.setAttribute('aPosVoid', new THREE.BufferAttribute(voidPos, 3));
  morphGeo.setAttribute('aRole', new THREE.BufferAttribute(headData.role, 1));
  morphGeo.setAttribute('aSeed', new THREE.BufferAttribute(seedAttr, 4));
  morphGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 42);

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: dpr },
    uPointScale: { value: isLowTier ? 34.0 : 34.0 },
    uS1: { value: 1.0 },          // Scene 1: Robot Head Awakening
    uDisperse: { value: 0.0 },    // Scene 2: Anti-Gravity Dispersion Peak
    uS3: { value: 0.0 },          // Scene 3: Holographic Earth
    uS4: { value: 0.0 },          // Scene 4: Organic Digital Void
    uEarthRotY: { value: 2.55 },
    uScanY: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uOffsetX: { value: isMobile ? 0.0 : -0.55 },
    uReducedMotion: { value: prefersReducedMotion ? 1.0 : 0.0 },
    uMasterFade: { value: isMobile ? 0.38 : 0.46 }
  };

  const vertexShader = /* glsl */ `
    attribute vec3 aPosHead;
    attribute vec3 aPosEarth;
    attribute vec3 aPosVoid;
    attribute float aRole;
    attribute vec4 aSeed;

    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uPointScale;
    uniform float uS1;
    uniform float uDisperse;
    uniform float uS3;
    uniform float uS4;
    uniform float uEarthRotY;
    uniform float uScanY;
    uniform vec2 uMouse;
    uniform float uOffsetX;
    uniform float uReducedMotion;

    varying float vIntensity;
    varying float vScanBoost;
    varying float vDisperse;
    varying float vAlpha;

    mat3 rotY(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
    }

    mat3 rotX(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
    }

    void main() {
      float motion = 1.0 - uReducedMotion;
      float t = uTime * motion;

      // 1. Scene 1 Head with organic cursor parallax rotation & holographic breath
      vec3 headP = aPosHead;
      headP = rotY(uMouse.x * 0.28 + sin(t * 0.55) * 0.06) * rotX(-uMouse.y * 0.14) * headP;
      headP.x += uOffsetX;
      headP.y += sin(t * 1.4 + aSeed.x * 6.283) * 0.06;

      // 2. Scene 3 Rotating Digital Earth
      vec3 earthP = rotX(0.22) * rotY(uEarthRotY + t * 0.16 + uMouse.x * 0.25) * aPosEarth;
      earthP.x += uOffsetX * 0.35;

      // 3. Scene 4 Undulating Organic Digital Void Core
      vec3 voidBase = aPosVoid;
      float pulse = 1.0 + 0.09 * sin(t * 1.3 + length(voidBase) * 0.75 + aSeed.x * 4.0);
      vec3 voidP = rotY(t * 0.12 - uMouse.x * 0.22) * rotX(sin(t * 0.3) * 0.18) * (voidBase * pulse);
      voidP.y += sin(t * 0.9 + voidP.x * 0.6) * 0.32;

      // Normalize shape weights for seamless blending
      float wSum = max(0.0001, uS1 + uS3 + uS4);
      vec3 morphed = (headP * uS1 + earthP * uS3 + voidP * uS4) / wSum;

      // Scene 2: Anti-Gravity Particle Dispersion & Swirling Universe Vortex
      if (uDisperse > 0.001) {
        float ang = aSeed.x * 6.28318 + uDisperse * (3.6 + aSeed.y * 3.8) + t * (0.35 + aSeed.y * 0.45);
        float outRad = 3.2 + aSeed.y * 10.5;
        vec3 vortex = vec3(
          cos(ang) * outRad,
          (aSeed.z - 0.35) * 11.5 + sin(t * 1.1 + aSeed.x * 9.0) * 1.1,
          sin(ang) * outRad * 0.85
        );
        // Curl-style anti-gravity upward drift wave
        morphed = mix(morphed, vortex, clamp(uDisperse, 0.0, 1.0));
        morphed.y += uDisperse * (1.2 * aSeed.z + 0.45 * sin(t * 1.8 + morphed.x * 0.5));
      }

      // Holographic vertical scanline boost (peaks prominently during Robot & Earth)
      float scanDist = abs(morphed.y - uScanY);
      float scanWave = exp(-scanDist * scanDist * 2.8) * (uS1 * 0.95 + uS3 * 0.55);

      // Interactive pointer micro-turbulence
      vec2 deltaM = morphed.xy - vec2(uMouse.x * 5.0, uMouse.y * 3.5);
      float mDist = length(deltaM);
      morphed.xy += normalize(deltaM + 0.0001) * exp(-mDist * 0.45) * 0.28 * (uDisperse + 0.25);

      vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float sizeBase = mix(1.0, 2.35, aSeed.w);
      float roleSize = mix(0.85, 1.45, aRole) * uS1 + (1.0 - uS1) * 1.05;
      float disperseSize = 1.0 + uDisperse * 0.55;
      float scanSize = 1.0 + scanWave * 0.75;

      float pSize = (sizeBase * roleSize * disperseSize * scanSize * uPointScale * uPixelRatio) / max(1.5, -mvPosition.z);
      gl_PointSize = clamp(pSize, 1.2, 10.5);

      vIntensity = clamp(mix(0.32, 0.92, aRole) * uS1 + uS3 * 0.78 + uS4 * 0.65 + uDisperse * 0.35, 0.2, 1.05);
      vScanBoost = scanWave;
      vDisperse = uDisperse;
      vAlpha = clamp((1.0 - smoothstep(22.0, 38.0, -mvPosition.z)) * (0.26 + 0.26 * aSeed.w + scanWave * 0.22), 0.06, 0.56);
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform float uMasterFade;
    varying float vIntensity;
    varying float vScanBoost;
    varying float vDisperse;
    varying float vAlpha;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;

      // Soft circular Gaussian mist core
      float core = exp(-d * d * 16.0);
      float halo = smoothstep(0.5, 0.04, d) * 0.42;
      float energy = core + halo;

      // Strict CyberPro #00FF41 Green Neon Palette (ghostly veil)
      vec3 emeraldDeep = vec3(0.0, 0.62, 0.18);
      vec3 neonGreen = vec3(0.0, 1.0, 0.255);      // Exact #00FF41
      vec3 hotCore = vec3(0.45, 0.95, 0.58);       // Soft muted core so text stays readable

      vec3 col = mix(emeraldDeep, neonGreen, clamp(vIntensity, 0.0, 1.0));
      col = mix(col, hotCore, core * clamp(0.14 + vScanBoost * 0.28 + vDisperse * 0.12, 0.0, 0.38));

      float alpha = energy * vAlpha * clamp(0.42 + vScanBoost * 0.25, 0.25, 0.72) * uMasterFade;
      gl_FragColor = vec4(col * (0.72 + vScanBoost * 0.28), alpha);
    }
  `;

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const mainParticles = new THREE.Points(morphGeo, particleMaterial);
  scene.add(mainParticles);

  // ---------------------------------------------------------------------------
  // 5. Persistent Ambient Anti-Gravity Space Spores (Parallax Dust Layer)
  // ---------------------------------------------------------------------------
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustSeeds = new Float32Array(DUST_COUNT * 2);
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3] = (hashRand(i, 21.1) - 0.5) * 32;
    dustPositions[i * 3 + 1] = (hashRand(i, 22.3) - 0.5) * 24;
    dustPositions[i * 3 + 2] = (hashRand(i, 23.7) - 0.5) * 20 - 4;
    dustSeeds[i * 2] = 0.4 + hashRand(i, 24.9) * 1.4;
    dustSeeds[i * 2 + 1] = hashRand(i, 25.5) * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('aDustSeed', new THREE.BufferAttribute(dustSeeds, 2));

  const dustMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uPixelRatio: uniforms.uPixelRatio,
      uReducedMotion: uniforms.uReducedMotion,
      uMasterFade: uniforms.uMasterFade
    },
    vertexShader: /* glsl */ `
      attribute vec2 aDustSeed;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uReducedMotion;
      varying float vA;
      void main() {
        float t = uTime * (1.0 - uReducedMotion);
        vec3 p = position;
        // Continuous anti-gravity upward drift wrap
        p.y = mod(p.y + 12.0 + t * 0.35 * aDustSeed.x, 24.0) - 12.0;
        p.x += sin(t * 0.45 + aDustSeed.y) * 0.45;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((13.0 * uPixelRatio) / max(2.0, -mv.z), 1.0, 4.2);
        vA = 0.14 + 0.09 * sin(t * 1.6 + aDustSeed.y);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uMasterFade;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float g = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(0.0, 1.0, 0.255, g * vA * uMasterFade);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  // ---------------------------------------------------------------------------
  // 6. Sub-Scene Holographic Structure Rigs (Scan Rings, Earth Radar/Arcs/InstancedMesh, Void Cage)
  // ---------------------------------------------------------------------------

  // A) Scene 1 Hero Holographic Scan Halo
  const heroRig = new THREE.Group();
  const heroScanRingGeo = new THREE.RingGeometry(2.9, 3.04, 64);
  const heroScanRingMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const heroScanRing = new THREE.Mesh(heroScanRingGeo, heroScanRingMat);
  heroScanRing.rotation.x = Math.PI / 2;
  heroRig.position.x = uniforms.uOffsetX.value;
  heroRig.add(heroScanRing);
  scene.add(heroRig);

  // B) Scene 3 Holographic Earth Shell, Orbital Radar Rings, Data Arcs & InstancedMesh Nodes
  const earthRig = new THREE.Group();
  earthRig.position.x = uniforms.uOffsetX.value * 0.35;
  earthRig.rotation.x = 0.22;

  const earthCoreMat = new THREE.MeshBasicMaterial({
    color: 0x021208,
    transparent: true,
    opacity: 0.0
  });
  const earthCore = new THREE.Mesh(new THREE.SphereGeometry(5.26, 40, 28), earthCoreMat);
  earthRig.add(earthCore);

  const earthWireMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const earthWire = new THREE.Mesh(new THREE.SphereGeometry(5.38, 28, 18), earthWireMat);
  earthRig.add(earthWire);

  // Orbital Radar Rings
  const earthOrbitRings = [];
  [
    { r: 6.45, rx: 1.15, ry: 0.25, spd: 0.24 },
    { r: 7.25, rx: 0.72, ry: -0.68, spd: -0.18 },
    { r: 8.05, rx: 1.48, ry: 0.42, spd: 0.14 }
  ].forEach((cfg) => {
    const pts = [];
    for (let s = 0; s <= 96; s++) {
      const a = (s / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * cfg.r, 0, Math.sin(a) * cfg.r));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const line = new THREE.LineLoop(g, m);
    line.rotation.set(cfg.rx, cfg.ry, 0);
    earthRig.add(line);
    earthOrbitRings.push({ mesh: line, mat: m, speed: cfg.spd });
  });

  // Rotating Radar Sweep Disc
  const radarSweepGeo = new THREE.RingGeometry(5.45, 7.3, 40, 1, 0, Math.PI * 0.35);
  const radarSweepMat = new THREE.MeshBasicMaterial({
    color: 0x39ff14,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const radarSweep = new THREE.Mesh(radarSweepGeo, radarSweepMat);
  radarSweep.rotation.x = Math.PI / 2;
  earthRig.add(radarSweep);

  // Data Transmission Arcs linking global cyber nodes (India <-> Hubs)
  const hubCoords = [
    [21.7, 82.8],   // India Center
    [51.5, -0.1],   // London
    [40.7, -74.0],  // New York
    [35.6, 139.7],  // Tokyo
    [1.35, 103.8],  // Singapore
    [52.5, 13.4],   // Berlin
    [-33.8, 151.2]  // Sydney
  ];
  const arcMaterials = [];
  for (let h = 1; h < hubCoords.length; h++) {
    const startV = new THREE.Vector3(...latLonToVec3(hubCoords[0][0], hubCoords[0][1], 5.45));
    const endV = new THREE.Vector3(...latLonToVec3(hubCoords[h][0], hubCoords[h][1], 5.45));
    const midV = startV.clone().add(endV).multiplyScalar(0.5).normalize().multiplyScalar(7.65);
    const curve = new THREE.QuadraticBezierCurve3(startV, midV, endV);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
    const arcMat = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    earthRig.add(new THREE.Line(arcGeo, arcMat));
    arcMaterials.push(arcMat);
  }

  // InstancedMesh: Repeated Orbital Data Beacons & Network Satellites (ONE draw call)
  const beaconGeom = new THREE.OctahedronGeometry(0.11, 0);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x39ff14,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const instancedBeacons = new THREE.InstancedMesh(beaconGeom, beaconMat, NODE_INSTANCE_COUNT);
  const dummy = new THREE.Object3D();
  const beaconData = [];
  for (let i = 0; i < NODE_INSTANCE_COUNT; i++) {
    const rOrbit = i < 16 ? 5.52 : 6.4 + (i % 3) * 0.85;
    const phi = Math.acos(2 * hashRand(i, 31.4) - 1);
    const theta = hashRand(i, 32.8) * Math.PI * 2;
    beaconData.push({
      radius: rOrbit,
      phi: phi,
      theta: theta,
      speed: (i < 16 ? 0.05 : 0.25 + hashRand(i, 33.1) * 0.35) * (i % 2 === 0 ? 1 : -1),
      pulseOffset: hashRand(i, 34.6) * Math.PI * 2
    });
  }
  earthRig.add(instancedBeacons);
  scene.add(earthRig);

  // C) Scene 4 Digital Void Counter-Rotating Wireframe Core Cages
  const voidRig = new THREE.Group();
  const voidInnerMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const voidOuterMat = new THREE.MeshBasicMaterial({
    color: 0x00d977,
    wireframe: true,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const voidInnerMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(2.75, 1), voidInnerMat);
  const voidOuterMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(4.4, 1), voidOuterMat);
  voidRig.add(voidInnerMesh, voidOuterMesh);
  scene.add(voidRig);

  // ---------------------------------------------------------------------------
  // 7. Upgrade Scene 3 Earth Continents from Real Cyber World Map Texture
  // ---------------------------------------------------------------------------
  function refineEarthContinentsFromTexture() {
    const img = new Image();
    img.src = '/assets/cyber-world-map.png';
    img.onload = function () {
      try {
        const w = 420;
        const h = 210;
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const ctx = off.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const px = ctx.getImageData(0, 0, w, h).data;

        const landCoords = [];
        for (let py = 0; py < h; py++) {
          for (let pxX = 0; pxX < w; pxX++) {
            const idx = (py * w + pxX) * 4;
            const r = px[idx];
            const g = px[idx + 1];
            const b = px[idx + 2];
            // Landmass/dot-matrix pixels in cyber-world-map.png are luminous cyan/green
            if (g + b > 140 || (g > 95 && r < 220)) {
              const lon = (pxX / w) * 360 - 180;
              const lat = 90 - (py / h) * 180;
              landCoords.push([lat, lon]);
            }
          }
        }

        if (landCoords.length < 300) return;

        const earthBuf = morphGeo.getAttribute('aPosEarth');
        const arr = earthBuf.array;
        const shellCount = Math.floor(PARTICLE_COUNT * 0.86);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (i < shellCount) {
            const pick = landCoords[Math.floor(hashRand(i, 41.7) * landCoords.length)];
            const jitLat = pick[0] + (hashRand(i, 42.3) - 0.5) * 0.7;
            const jitLon = pick[1] + (hashRand(i, 43.1) - 0.5) * 0.7;
            const v = latLonToVec3(jitLat, jitLon, 5.42 + hashRand(i, 44.5) * 0.08);
            arr[i * 3] = v[0];
            arr[i * 3 + 1] = v[1];
            arr[i * 3 + 2] = v[2];
          } else {
            // Outer orbital data belt around Earth
            const a = hashRand(i, 45.2) * Math.PI * 2;
            const ringR = 6.3 + hashRand(i, 46.8) * 1.9;
            const tilt = (hashRand(i, 47.1) - 0.5) * 0.55;
            arr[i * 3] = Math.cos(a) * ringR;
            arr[i * 3 + 1] = Math.sin(a) * ringR * tilt;
            arr[i * 3 + 2] = Math.sin(a) * ringR;
          }
        }
        earthBuf.needsUpdate = true;
      } catch (err) {
        console.warn('[CYBERPRO WebGL] World map texture sampling fallback kept:', err);
      }
    };
  }
  refineEarthContinentsFromTexture();

  // ---------------------------------------------------------------------------
  // 8. Lenis Smooth Scrolling + GSAP ScrollTrigger 4-Scene Choreography
  // ---------------------------------------------------------------------------
  const scrollState = {
    progress: 0,
    s1: 1.0,
    disperse: 0.0,
    s3: 0.0,
    s4: 0.0,
    masterFade: isMobile ? 0.38 : 0.46,
    camZ: isMobile ? 22 : 18.5,
    camY: 0.0
  };

  let lenis = null;

  function computeWeightsFromProgress(p) {
    // 4 Continuous Morphing Scenes along scroll progress [0.0 .. 1.0]
    // Scene 1 (Hero):        0.00 -> 0.14
    // Scene 2 (Dispersion):  0.10 -> 0.38 (peaks ~0.24)
    // Scene 3 (DigitalEarth):0.34 -> 0.74 (peaks across Journey/Tracks/Why/Courses/CCCE/Support)
    // Scene 4 (Digital Void):0.70 -> 1.00 (gradually dissolves into ghost mist at bottom)
    let s1 = 1.0 - THREE.MathUtils.smoothstep(p, 0.08, 0.24);
    let disperseA = Math.sin(THREE.MathUtils.clamp((p - 0.09) / 0.27, 0.0, 1.0) * Math.PI);
    let disperseB = Math.sin(THREE.MathUtils.clamp((p - 0.67) / 0.15, 0.0, 1.0) * Math.PI) * 0.42;
    let disperse = Math.max(disperseA, disperseB);

    let s3In = THREE.MathUtils.smoothstep(p, 0.26, 0.40);
    let s3Out = 1.0 - THREE.MathUtils.smoothstep(p, 0.68, 0.80);
    let s3 = Math.max(0.0, s3In * s3Out);

    let s4 = THREE.MathUtils.smoothstep(p, 0.70, 0.86);

    // Ghostly "seen & unseen" veil across Hero/Mid, fading away toward bottom footer
    const baseFade = isMobile ? 0.38 : 0.46;
    let masterFade = baseFade * (1.0 - THREE.MathUtils.smoothstep(p, 0.72, 0.96) * 0.88);

    // Subtle scroll-driven camera depth choreography
    const baseZ = isMobile ? 22.0 : 18.5;
    const camZ = baseZ + disperseA * 3.8 - s3 * 1.1 + s4 * 0.8;
    const camY = Math.sin(p * Math.PI * 2) * 0.45;

    return { s1, disperse, s3, s4, masterFade, camZ, camY };
  }

  function initScrollChoreography() {
    if (!isLowTier && typeof window.Lenis === 'function' && !prefersReducedMotion) {
      try {
        lenis = new window.Lenis({
          wrapper: landingEl,
          content: landingEl,
          smoothWheel: true,
          lerp: 0.085,
          wheelMultiplier: 0.92,
          autoRaf: false,
          prevent: (node) =>
            Boolean(
              node &&
                node.closest &&
                node.closest('#cyber-chatbot-window, #login-view, #admissions-modal, #email-inquiry-modal, textarea, select')
            )
        });
      } catch (e) {
        console.warn('[CYBERPRO WebGL] Lenis custom wrapper fallback:', e);
        lenis = null;
      }
    }

    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.defaults({ scroller: landingEl });

      if (lenis) {
        lenis.on('scroll', window.ScrollTrigger.update);
      }

      // Single continuous ScrollTrigger tracking #landing-page full height
      window.ScrollTrigger.create({
        scroller: landingEl,
        trigger: landingEl,
        start: 0,
        end: () => Math.max(100, landingEl.scrollHeight - landingEl.clientHeight),
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        }
      });

      // Subtle HTML glassmorphic parallax depth on watermark & flagship card (zero click interference)
      if (!prefersReducedMotion && !isMobile) {
        const whyWatermark = landingEl.querySelector('#section-why h2.font-black');
        if (whyWatermark) {
          window.gsap.to(whyWatermark, {
            y: -36,
            ease: 'none',
            scrollTrigger: {
              scroller: landingEl,
              trigger: '#section-why',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        }
      }
    }

    // Also update scrollProgress cleanly on programmatic scrolls
    landingEl.addEventListener(
      'scroll',
      () => {
        const maxS = Math.max(1, landingEl.scrollHeight - landingEl.clientHeight);
        scrollState.progress = THREE.MathUtils.clamp(landingEl.scrollTop / maxS, 0, 1);
      },
      { passive: true }
    );
  }
  initScrollChoreography();

  // ---------------------------------------------------------------------------
  // 9. Interactive Mouse & Touch Parallax + Resize
  // ---------------------------------------------------------------------------
  const pointerTarget = { x: 0, y: 0 };
  const pointerSmooth = { x: 0, y: 0 };

  if (!prefersReducedMotion) {
    window.addEventListener(
      'mousemove',
      (e) => {
        pointerTarget.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        pointerTarget.y = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      },
      { passive: true }
    );
  }

  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const curDpr = isLowTier ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(curDpr);
    renderer.setSize(w, h, false);
    uniforms.uPixelRatio.value = curDpr;
    uniforms.uOffsetX.value = w <= 640 ? 0.0 : -0.55;
    heroRig.position.x = uniforms.uOffsetX.value;
    earthRig.position.x = uniforms.uOffsetX.value * 0.35;
    if (composer) composer.setSize(Math.max(2, Math.floor(w * 0.55)), Math.max(2, Math.floor(h * 0.55)));
    if (bloomPass) bloomPass.resolution.set(Math.max(2, Math.floor(w * 0.55)), Math.max(2, Math.floor(h * 0.55)));
    if (lenis && typeof lenis.resize === 'function') lenis.resize();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('pagehide', () => {
    try {
      if (composer && composer.dispose) composer.dispose();
      renderer.dispose();
    } catch (e) {}
  });

  // ---------------------------------------------------------------------------
  // 10. Unified Animation Loop (Single Ticker — Lenis + Three.js + Bloom)
  // ---------------------------------------------------------------------------
  const startTime = performance.now();
  let lastRenderTimeSec = -1;
  const minFrameIntervalSec = isLowTier ? 0.032 : 0.0;

  function renderTick(timeSec) {
    if (document.hidden) return;
    // Pause automatically when LMS view hides #landing-page
    const hidden = landingEl.classList.contains('hidden');
    rootEl.classList.toggle('is-paused', hidden);
    if (hidden) return;
    if (minFrameIntervalSec > 0 && lastRenderTimeSec >= 0 && (timeSec - lastRenderTimeSec) < minFrameIntervalSec) return;
    lastRenderTimeSec = timeSec;

    // Fallback progress read if ScrollTrigger wasn't scrolled via pointer
    const maxS = Math.max(1, landingEl.scrollHeight - landingEl.clientHeight);
    const liveP = THREE.MathUtils.clamp(landingEl.scrollTop / maxS, 0, 1);
    const blendedP = THREE.MathUtils.lerp(scrollState.progress, liveP, 0.25);

    const w = computeWeightsFromProgress(blendedP);
    scrollState.s1 = THREE.MathUtils.lerp(scrollState.s1, w.s1, 0.12);
    scrollState.disperse = THREE.MathUtils.lerp(scrollState.disperse, w.disperse, 0.12);
    scrollState.s3 = THREE.MathUtils.lerp(scrollState.s3, w.s3, 0.12);
    scrollState.s4 = THREE.MathUtils.lerp(scrollState.s4, w.s4, 0.12);
    scrollState.masterFade = THREE.MathUtils.lerp(scrollState.masterFade, w.masterFade, 0.1);
    scrollState.camZ = THREE.MathUtils.lerp(scrollState.camZ, w.camZ, 0.08);
    scrollState.camY = THREE.MathUtils.lerp(scrollState.camY, w.camY, 0.08);

    pointerSmooth.x = THREE.MathUtils.lerp(pointerSmooth.x, pointerTarget.x, 0.06);
    pointerSmooth.y = THREE.MathUtils.lerp(pointerSmooth.y, pointerTarget.y, 0.06);

    const t = prefersReducedMotion ? 0 : timeSec;

    // Update GPU Shader Uniforms
    uniforms.uTime.value = t;
    uniforms.uS1.value = scrollState.s1;
    uniforms.uDisperse.value = scrollState.disperse;
    uniforms.uS3.value = scrollState.s3;
    uniforms.uS4.value = scrollState.s4;
    uniforms.uMasterFade.value = scrollState.masterFade;
    uniforms.uScanY.value = Math.sin(t * 1.1) * 4.4;
    uniforms.uMouse.value.set(pointerSmooth.x, pointerSmooth.y);

    // Camera subtle parallax + orbital zoom
    camera.position.z = scrollState.camZ;
    camera.position.y = scrollState.camY + pointerSmooth.y * 0.45;
    camera.position.x = pointerSmooth.x * 0.65;
    camera.lookAt(0, 0, 0);

    const rigScale = scrollState.masterFade / 0.46;

    // A) Hero Holographic Scan Ring
    heroRig.visible = scrollState.s1 > 0.03;
    if (heroRig.visible) {
      heroScanRing.position.y = uniforms.uScanY.value * 0.72;
      heroScanRingMat.opacity = 0.12 * scrollState.s1 * rigScale;
      heroRig.rotation.y = pointerSmooth.x * 0.28 + Math.sin(t * 0.55) * 0.06;
    }

    // B) Scene 3 Digital Earth + Radar + Data Nodes (InstancedMesh)
    const eVis = scrollState.s3 > 0.02;
    earthRig.visible = eVis;
    if (eVis) {
      const eAlpha = scrollState.s3 * rigScale;
      const rotY = uniforms.uEarthRotY.value + t * 0.16 + pointerSmooth.x * 0.25;
      earthRig.rotation.y = rotY;
      earthCoreMat.opacity = 0.34 * eAlpha;
      earthWireMat.opacity = 0.035 * eAlpha;
      radarSweep.rotation.z = t * 1.25;
      radarSweepMat.opacity = 0.065 * eAlpha;
      beaconMat.opacity = 0.32 * eAlpha;

      earthOrbitRings.forEach((ring) => {
        ring.mesh.rotation.z += ring.speed * 0.01;
        ring.mat.opacity = 0.11 * eAlpha;
      });
      arcMaterials.forEach((mat, idx) => {
        mat.opacity = (0.08 + 0.09 * Math.sin(t * 2.4 + idx)) * eAlpha;
      });

      for (let i = 0; i < NODE_INSTANCE_COUNT; i++) {
        const bd = beaconData[i];
        const th = bd.theta + t * bd.speed;
        const rSinPhi = bd.radius * Math.sin(bd.phi);
        dummy.position.set(
          Math.cos(th) * rSinPhi,
          bd.radius * Math.cos(bd.phi),
          Math.sin(th) * rSinPhi
        );
        const s = 0.75 + 0.45 * Math.sin(t * 3.0 + bd.pulseOffset);
        dummy.scale.setScalar(s);
        dummy.rotation.y = th;
        dummy.updateMatrix();
        instancedBeacons.setMatrixAt(i, dummy.matrix);
      }
      instancedBeacons.instanceMatrix.needsUpdate = true;
    }

    // C) Scene 4 Digital Void Rotating Core Cages
    const vVis = scrollState.s4 > 0.02;
    voidRig.visible = vVis;
    if (vVis) {
      voidInnerMat.opacity = 0.065 * scrollState.s4 * rigScale;
      voidOuterMat.opacity = 0.035 * scrollState.s4 * rigScale;
      voidInnerMesh.rotation.set(t * 0.18, t * 0.28, 0);
      voidOuterMesh.rotation.set(-t * 0.11, -t * 0.16, t * 0.08);
    }

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  if (window.gsap && window.gsap.ticker) {
    window.gsap.ticker.add((time) => {
      if (lenis) lenis.raf(time * 1000);
      renderTick((performance.now() - startTime) * 0.001);
    });
    window.gsap.ticker.lagSmoothing(0);
  } else {
    function fallbackRaf() {
      requestAnimationFrame(fallbackRaf);
      if (lenis) lenis.raf(performance.now());
      renderTick((performance.now() - startTime) * 0.001);
    }
    fallbackRaf();
  }

  // Expose Diagnostic Telemetry & Controller (Read-Only for verification)
  window.__CYBERPRO_WEBGL__ = {
    getState: function () {
      return {
        scrollProgress: Number(scrollState.progress.toFixed(4)),
        weights: {
          scene1Robot: Number(scrollState.s1.toFixed(3)),
          scene2Disperse: Number(scrollState.disperse.toFixed(3)),
          scene3Earth: Number(scrollState.s3.toFixed(3)),
          scene4Void: Number(scrollState.s4.toFixed(3)),
          masterFade: Number(scrollState.masterFade.toFixed(3))
        },
        particleCount: PARTICLE_COUNT,
        dustCount: DUST_COUNT,
        instancedBeacons: NODE_INSTANCE_COUNT,
        bloomEnabled: bloomEnabled,
        lenisActive: Boolean(lenis),
        scrollTriggerActive: Boolean(window.ScrollTrigger && window.ScrollTrigger.getAll().length > 0),
        canvasPointerEvents: getComputedStyle(canvas).pointerEvents,
        rootZIndex: getComputedStyle(rootEl).zIndex,
        landingZIndex: getComputedStyle(landingEl).zIndex
      };
    }
  };
})();
