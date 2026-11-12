import json
import re

INDEX_PATH = r"C:\Users\Parth\.gemini\antigravity\scratch\cyberpro\public\index.html"
INDIA_JSON_PATH = r"C:\Users\Parth\.gemini\antigravity\scratch\cyberpro\public\assets\india-polygon.json"

with open(INDIA_JSON_PATH, "r", encoding="utf-8") as f:
    india_data = json.load(f)

# Round coordinates to 2 decimal places to keep embedded script compact
coords_compact = [[round(p[0], 2), round(p[1], 2)] for p in india_data["points"]]
coords_js = json.dumps(coords_compact)

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Locate view-globe and initThreeGlobe script
pattern = r'<!-- VIEW 3: 3D Holographic Globe \(Global Threat Mesh\) -->.*?<!-- Journey Section -->'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("ERROR: Could not find target pattern in index.html")
    exit(1)

template = '''<!-- VIEW 3: 3D Holographic Globe (Global Threat Mesh) -->
                <div id="view-globe" class="hidden relative w-full flex flex-col items-center justify-center">
                    <!-- Cockpit HUD Top Telemetry Bar -->
                    <div class="w-full max-w-[480px] sm:max-w-[520px] flex items-center justify-between px-4 py-2 mb-3.5 font-mono text-[9px] bg-black/85 border border-[#1e2d47] rounded-xl backdrop-blur-md shadow-[0_0_24px_rgba(0,0,0,0.9)] z-20">
                        <div class="flex items-center gap-2 text-[#00d9f5] font-bold tracking-wider">
                            <span class="relative flex h-2 w-2">
                                <span id="globe-status-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d9f5] opacity-75"></span>
                                <span id="globe-status-dot" class="relative inline-flex rounded-full h-2 w-2 bg-[#00d9f5]"></span>
                            </span>
                            <span id="globe-status-title" class="tracking-widest transition-colors duration-300">GLOBAL THREAT MESH // v5.4</span>
                        </div>
                        <div class="text-white/80 flex items-center gap-2.5 font-bold">
                            <span id="globe-live-sync" class="text-[#00f5a0] bg-[#080c14] px-2 py-0.5 rounded border border-[#1e2d47] transition-all duration-300">NODES: 48 ACTIVE</span>
                            <span id="globe-defcon-badge" class="text-[#00f5a0] transition-colors duration-300">DEFCON 3</span>
                        </div>
                    </div>

                    <div id="globe-3d-wrap" class="relative w-full max-w-[480px] sm:max-w-[520px] aspect-square flex items-center justify-center border border-[#1e2d47] rounded-2xl bg-[#030712]/95 backdrop-blur-sm shadow-[0_0_60px_rgba(0,217,245,0.18)] overflow-hidden cursor-grab active:cursor-grabbing">
                        <div id="globe-canvas-mount" class="w-full h-full"></div>
                        
                        <!-- Floating India Security Badge Overlay -->
                        <div id="globe-security-badge" class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none transition-all duration-500 opacity-0 transform -translate-y-2 z-10">
                            <div class="flex items-center gap-2 px-3 py-1 bg-black/90 border border-[#39ff14] rounded-lg shadow-[0_0_18px_rgba(57,255,20,0.4)]">
                                <span class="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
                                <span id="globe-badge-text" class="text-[10px] font-mono font-bold text-[#39ff14] tracking-wider">INDIA SECTOR: 100% PROTECTED</span>
                            </div>
                            <div class="px-2.5 py-1 bg-[#031508]/90 border border-[#39ff14]/50 rounded text-[9px] font-mono font-bold text-[#00f5a0] shadow-[0_0_10px_rgba(57,255,20,0.25)]">
                                ZERO-TRUST ACTIVE
                            </div>
                        </div>

                        <!-- Live Telemetry Bottom Bar -->
                        <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[9px] font-mono text-slate-400 select-none pointer-events-none z-10">
                            <span id="globe-bot-left" class="transition-colors duration-300">ROTATION: GLOBAL SCAN</span>
                            <span id="globe-bot-right" class="text-[#00d9f5] transition-colors duration-300">CYBER SHIELD ARCS: ONLINE</span>
                        </div>
                    </div>
                </div>
            </div></section>
        <!-- 3D Holographic Globe Initializer -->
        <script>
            (function() {
                const INDIA_COORDS = __INDIA_COORDS__;
                let globeInitialized = false;

                function initThreeGlobe() {
                    const mount = document.getElementById('globe-canvas-mount');
                    if (!mount || typeof THREE === 'undefined') return;
                    if (globeInitialized && mount.querySelector('canvas')) return;
                    globeInitialized = true;

                    const width = mount.clientWidth || 480;
                    const height = mount.clientHeight || 480;

                    const scene = new THREE.Scene();
                    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
                    camera.position.z = 210;

                    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                    renderer.setSize(width, height);
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    mount.innerHTML = '';
                    mount.appendChild(renderer.domElement);

                    const globeGroup = new THREE.Group();
                    // Initial orientation: Start right before India so user immediately experiences the protection sequence
                    globeGroup.rotation.y = 2.70;
                    scene.add(globeGroup);

                    // Utility: Convert (lat, lon, radius) to Three.js Cartesian 3D coordinates
                    function latLonToVec(lat, lon, r) {
                        const phi = (90 - lat) * (Math.PI / 180);
                        const theta = (lon + 180) * (Math.PI / 180);
                        return new THREE.Vector3(
                            -r * Math.sin(phi) * Math.cos(theta),
                            r * Math.cos(phi),
                            r * Math.sin(phi) * Math.sin(theta)
                        );
                    }

                    // 1. Texture Loader
                    const textureLoader = new THREE.TextureLoader();

                    // 2. High-Tech Cyber World Map Texture onto Core Sphere
                    const worldTex = textureLoader.load('/assets/cyber-world-map.png');
                    if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
                        worldTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                    }

                    const coreGeo = new THREE.SphereGeometry(52, 64, 64);
                    const coreMat = new THREE.MeshBasicMaterial({
                        map: worldTex,
                        transparent: true,
                        opacity: 0.98
                    });
                    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
                    globeGroup.add(coreSphere);

                    // 3. Holographic Atmospheric Glow Shell
                    const atmoGeo = new THREE.SphereGeometry(52.8, 48, 24);
                    const atmoMat = new THREE.MeshBasicMaterial({
                        color: 0x00d9f5,
                        wireframe: true,
                        transparent: true,
                        opacity: 0.12,
                        blending: THREE.AdditiveBlending
                    });
                    const atmoSphere = new THREE.Mesh(atmoGeo, atmoMat);
                    globeGroup.add(atmoSphere);

                    // 4. Detailed 3D Vector Boundary of India
                    const indiaPoints3D = [];
                    INDIA_COORDS.forEach(function(pt) {
                        indiaPoints3D.push(latLonToVec(pt[1], pt[0], 52.35));
                    });
                    const indiaBorderGeo = new THREE.BufferGeometry().setFromPoints(indiaPoints3D);
                    const indiaBorderMat = new THREE.LineBasicMaterial({
                        color: 0x39ff14,
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.95
                    });
                    const indiaBorder = new THREE.LineLoop(indiaBorderGeo, indiaBorderMat);
                    globeGroup.add(indiaBorder);

                    // 5. India Strategic Center & Headquarters Vector
                    const indiaCenterPos = latLonToVec(21.73, 82.79, 52.4);
                    const indiaNormal = indiaCenterPos.clone().normalize();
                    const delhiPos = latLonToVec(28.61, 77.21, 52.4);

                    // 6. CyberPro Shield Holographic Emblem Sprite
                    const shieldTex = textureLoader.load('/assets/cyberpro-shield-sprite.png');
                    const shieldMat = new THREE.SpriteMaterial({
                        map: shieldTex,
                        transparent: true,
                        opacity: 0.0,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    });
                    const shieldSprite = new THREE.Sprite(shieldMat);
                    const shieldHoverPos = latLonToVec(21.73, 82.79, 59.0);
                    shieldSprite.position.copy(shieldHoverPos);
                    shieldSprite.scale.set(0.1, 0.1, 1);
                    globeGroup.add(shieldSprite);

                    // 7. Concentric Holographic Defense Wave Rings over India
                    const defenseRings = [];
                    const ringCount = 3;
                    for (let i = 0; i < ringCount; i++) {
                        const rGeo = new THREE.RingGeometry(0.5, 2.5, 36);
                        const rMat = new THREE.MeshBasicMaterial({
                            color: 0x39ff14,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.0,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false
                        });
                        const rMesh = new THREE.Mesh(rGeo, rMat);
                        rMesh.position.copy(indiaCenterPos);
                        rMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), indiaNormal);
                        globeGroup.add(rMesh);
                        defenseRings.push({ mesh: rMesh, mat: rMat, offset: i / ringCount });
                    }

                    // 8. New Delhi Cyber Defense Laser Beacon & Node Marker
                    const beaconPoints = [
                        latLonToVec(28.61, 77.21, 52.2),
                        latLonToVec(28.61, 77.21, 64.0)
                    ];
                    const beaconGeo = new THREE.BufferGeometry().setFromPoints(beaconPoints);
                    const beaconMat = new THREE.LineBasicMaterial({
                        color: 0x39ff14,
                        linewidth: 2,
                        transparent: true,
                        opacity: 0.95
                    });
                    const beaconLine = new THREE.Line(beaconGeo, beaconMat);
                    globeGroup.add(beaconLine);

                    const delhiDotGeo = new THREE.SphereGeometry(1.2, 12, 12);
                    const delhiDotMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
                    const delhiDot = new THREE.Mesh(delhiDotGeo, delhiDotMat);
                    delhiDot.position.copy(latLonToVec(28.61, 77.21, 52.4));
                    globeGroup.add(delhiDot);

                    // 9. Floating Orbital Rings
                    function createOrbitRing(radius, tiltX, tiltY, color, segments) {
                        const ringGeo = new THREE.BufferGeometry();
                        const ringPos = [];
                        for (let i = 0; i <= segments; i++) {
                            if (i % 3 === 0) continue;
                            const angle = (i / segments) * Math.PI * 2;
                            ringPos.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
                        }
                        ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPos, 3));
                        const ringMat = new THREE.LineBasicMaterial({
                            color: color,
                            transparent: true,
                            opacity: 0.45,
                            blending: THREE.AdditiveBlending
                        });
                        const ring = new THREE.Line(ringGeo, ringMat);
                        ring.rotation.x = tiltX;
                        ring.rotation.y = tiltY;
                        return ring;
                    }
                    const ring1 = createOrbitRing(76, Math.PI / 3, Math.PI / 6, 0x00d9f5, 128);
                    const ring2 = createOrbitRing(86, -Math.PI / 4, Math.PI / 3, 0x00f5a0, 128);
                    globeGroup.add(ring1);
                    globeGroup.add(ring2);

                    // 10. Outer Cyber Particles
                    const particleCount = 360;
                    const particleGeo = new THREE.BufferGeometry();
                    const posArray = new Float32Array(particleCount * 3);
                    const colorsArray = new Float32Array(particleCount * 3);

                    for (let i = 0; i < particleCount; i++) {
                        const phi = Math.acos(-1 + (2 * i) / particleCount);
                        const theta = Math.sqrt(particleCount * Math.PI) * phi;
                        const r = 56 + (Math.random() - 0.5) * 6;

                        posArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                        posArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                        posArray[i * 3 + 2] = r * Math.cos(phi);

                        const isEmerald = Math.random() > 0.5;
                        colorsArray[i * 3] = isEmerald ? 0.22 : 0.0;
                        colorsArray[i * 3 + 1] = isEmerald ? 1.0 : 0.85;
                        colorsArray[i * 3 + 2] = isEmerald ? 0.08 : 0.96;
                    }
                    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
                    particleGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

                    const particleMat = new THREE.PointsMaterial({
                        size: 1.4,
                        vertexColors: true,
                        transparent: true,
                        opacity: 0.75,
                        blending: THREE.AdditiveBlending
                    });
                    const particleMesh = new THREE.Points(particleGeo, particleMat);
                    globeGroup.add(particleMesh);

                    // 11. Interactive Mouse Parallax
                    let mouseX = 0, mouseY = 0;
                    let targetMouseRotX = 0, targetMouseRotY = 0;
                    window.addEventListener('mousemove', function(e) {
                        mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
                        mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
                        targetMouseRotY = mouseX * 0.3;
                        targetMouseRotX = mouseY * 0.2;
                    });

                    window.addEventListener('resize', function() {
                        const nw = mount.clientWidth || 480;
                        const nh = mount.clientHeight || 480;
                        camera.aspect = nw / nh;
                        camera.updateProjectionMatrix();
                        renderer.setSize(nw, nh);
                    });

                    // 12. Cinematic State Machine & Animation Engine
                    // States: 'ORBIT' -> 'APPROACH' -> 'PROTECTED' -> 'ZOOM_OUT' -> 'ORBIT'
                    let animState = 'ORBIT';
                    let stateTime = 0;
                    let cooldown = 1.0; // Quick initial approach so user immediately sees the effect
                    const baseSpeed = 0.0035;
                    const targetAngleY = 3.2674; // Rotation angle where India directly faces the camera

                    let currentCamZ = 210;
                    let targetCamZ = 210;
                    let currentRotX = 0;
                    let targetRotX = 0;

                    // Manual trigger function
                    window.triggerIndiaProtection = function() {
                        animState = 'APPROACH';
                        stateTime = 0;
                        cooldown = 0;
                    };

                    // HUD elements cache
                    const hudTitle = document.getElementById('globe-status-title');
                    const hudLiveSync = document.getElementById('globe-live-sync');
                    const hudDefcon = document.getElementById('globe-defcon-badge');
                    const hudSecurityBadge = document.getElementById('globe-security-badge');
                    const hudBotLeft = document.getElementById('globe-bot-left');
                    const hudBotRight = document.getElementById('globe-bot-right');
                    const hudPing = document.getElementById('globe-status-ping');
                    const hudDot = document.getElementById('globe-status-dot');

                    const clock = new THREE.Clock();

                    function loop() {
                        requestAnimationFrame(loop);
                        const vg = document.getElementById('view-globe');
                        if (!vg || vg.classList.contains('hidden')) return;

                        const delta = Math.min(clock.getDelta(), 0.1);
                        stateTime += delta;
                        if (cooldown > 0) cooldown -= delta;

                        // Calculate difference between current globe rotation.y and target India angle
                        const TWO_PI = Math.PI * 2;
                        const normRotY = ((globeGroup.rotation.y % TWO_PI) + TWO_PI) % TWO_PI;
                        let diffAngle = targetAngleY - normRotY;
                        while (diffAngle < -Math.PI) diffAngle += TWO_PI;
                        while (diffAngle > Math.PI) diffAngle -= TWO_PI;

                        // State Transitions
                        if (animState === 'ORBIT') {
                            targetCamZ = 210;
                            targetRotX = 0;
                            globeGroup.rotation.y += baseSpeed;

                            // When India rotates into approaching sector and cooldown is done
                            if (cooldown <= 0 && Math.abs(diffAngle) < 0.60) {
                                animState = 'APPROACH';
                                stateTime = 0;
                                if (hudTitle) {
                                    hudTitle.innerText = "TARGET ACQUIRED: INDIA CYBER REGION";
                                    hudTitle.classList.remove('text-[#00d9f5]');
                                    hudTitle.classList.add('text-[#39ff14]');
                                }
                                if (hudBotLeft) hudBotLeft.innerText = "COORDINATES: 21.73° N, 82.79° E";
                                if (hudBotRight) {
                                    hudBotRight.innerText = "LOCKING DEFENSE GRID...";
                                    hudBotRight.classList.remove('text-[#00d9f5]');
                                    hudBotRight.classList.add('text-[#39ff14]');
                                }
                                if (hudPing) {
                                    hudPing.classList.remove('bg-[#00d9f5]');
                                    hudPing.classList.add('bg-[#39ff14]');
                                }
                                if (hudDot) {
                                    hudDot.classList.remove('bg-[#00d9f5]');
                                    hudDot.classList.add('bg-[#39ff14]');
                                }
                            }
                        } else if (animState === 'APPROACH') {
                            // Lock rotation onto India & smoothly zoom in
                            targetCamZ = 126;
                            targetRotX = -0.18; // Vertical tilt to center India on screen
                            globeGroup.rotation.y += diffAngle * 0.05;

                            // Fade in shield sprite slightly during zoom
                            const zoomProgress = Math.max(0, Math.min(1, (210 - currentCamZ) / (210 - 126)));
                            shieldMat.opacity = zoomProgress * 0.8;
                            const sScale = 2 + zoomProgress * 18;
                            shieldSprite.scale.set(sScale, sScale, 1);

                            if (currentCamZ < 134 && Math.abs(diffAngle) < 0.05) {
                                animState = 'PROTECTED';
                                stateTime = 0;
                                if (hudSecurityBadge) {
                                    hudSecurityBadge.classList.remove('opacity-0', '-translate-y-2');
                                    hudSecurityBadge.classList.add('opacity-100', 'translate-y-0');
                                }
                                if (hudTitle) hudTitle.innerText = "INDIA DEFENSE GRID: 100% PROTECTED";
                                if (hudLiveSync) {
                                    hudLiveSync.innerText = "CYBERPRO SENTINEL: ARMED";
                                    hudLiveSync.classList.remove('text-[#00f5a0]', 'border-[#1e2d47]');
                                    hudLiveSync.classList.add('text-[#39ff14]', 'border-[#39ff14]/70');
                                }
                                if (hudDefcon) {
                                    hudDefcon.innerText = "IMMUNIZED";
                                    hudDefcon.classList.remove('text-[#00f5a0]');
                                    hudDefcon.classList.add('text-[#39ff14]');
                                }
                                if (hudBotRight) hudBotRight.innerText = "ZERO-TRUST SHIELD: ACTIVE";
                            }
                        } else if (animState === 'PROTECTED') {
                            targetCamZ = 126;
                            targetRotX = -0.18;
                            // Gentle micro-sway while locked on India
                            globeGroup.rotation.y += diffAngle * 0.05 + Math.sin(stateTime * 2.5) * 0.0004;

                            // CyberPro shield holographic pulse
                            const pulse = 1.0 + Math.sin(stateTime * 5.0) * 0.08;
                            shieldSprite.scale.set(22 * pulse, 22 * pulse, 1);
                            shieldMat.opacity = 1.0;

                            // Pulsing India boundary outline
                            indiaBorderMat.opacity = 0.8 + Math.sin(stateTime * 8.0) * 0.2;

                            // Expanding concentric protective forcefield rings
                            defenseRings.forEach(function(ring) {
                                const prog = (stateTime * 0.65 + ring.offset) % 1.0;
                                const scale = 1.0 + prog * 16.0;
                                ring.mesh.scale.set(scale, scale, 1);
                                ring.mat.opacity = Math.sin(prog * Math.PI) * 0.9;
                            });

                            // Hold in protected state for 3.6 seconds, then zoom out while keeping protection active
                            if (stateTime > 3.6) {
                                animState = 'ZOOM_OUT';
                                stateTime = 0;
                                if (hudTitle) hudTitle.innerText = "GLOBAL MESH // INDIA DEFENDED";
                                if (hudBotRight) hudBotRight.innerText = "SECTOR PROTECTED // RESUMING ORBIT";
                            }
                        } else if (animState === 'ZOOM_OUT') {
                            // Zoom out while KEEPING the shield & defense rings visibly active on India!
                            targetCamZ = 210;
                            targetRotX = 0;
                            globeGroup.rotation.y += baseSpeed * 0.6; // Slowly start rotating

                            // Rings continue pulsing
                            defenseRings.forEach(function(ring) {
                                const prog = (stateTime * 0.65 + ring.offset) % 1.0;
                                const scale = 1.0 + prog * 16.0;
                                ring.mesh.scale.set(scale, scale, 1);
                                ring.mat.opacity = Math.sin(prog * Math.PI) * 0.75;
                            });

                            // Fade security top badge as camera pulls back
                            if (hudSecurityBadge && currentCamZ > 175) {
                                hudSecurityBadge.classList.remove('opacity-100', 'translate-y-0');
                                hudSecurityBadge.classList.add('opacity-0', '-translate-y-2');
                            }

                            // Once fully zoomed out
                            if (currentCamZ > 207) {
                                animState = 'ORBIT';
                                stateTime = 0;
                                cooldown = 24.0; // Wait for full orbit revolution (~25-30s) before next India zoom
                                if (hudTitle) {
                                    hudTitle.innerText = "GLOBAL THREAT MESH // v5.4";
                                    hudTitle.classList.remove('text-[#39ff14]');
                                    hudTitle.classList.add('text-[#00d9f5]');
                                }
                                if (hudLiveSync) {
                                    hudLiveSync.innerText = "NODES: 48 ACTIVE";
                                    hudLiveSync.classList.remove('text-[#39ff14]', 'border-[#39ff14]/70');
                                    hudLiveSync.classList.add('text-[#00f5a0]', 'border-[#1e2d47]');
                                }
                                if (hudDefcon) {
                                    hudDefcon.innerText = "DEFCON 3";
                                    hudDefcon.classList.remove('text-[#39ff14]');
                                    hudDefcon.classList.add('text-[#00f5a0]');
                                }
                                if (hudBotLeft) hudBotLeft.innerText = "ROTATION: GLOBAL SCAN";
                                if (hudBotRight) {
                                    hudBotRight.innerText = "CYBER SHIELD ARCS: ONLINE";
                                    hudBotRight.classList.remove('text-[#39ff14]');
                                    hudBotRight.classList.add('text-[#00d9f5]');
                                }
                                if (hudPing) {
                                    hudPing.classList.remove('bg-[#39ff14]');
                                    hudPing.classList.add('bg-[#00d9f5]');
                                }
                                if (hudDot) {
                                    hudDot.classList.remove('bg-[#39ff14]');
                                    hudDot.classList.add('bg-[#00d9f5]');
                                }
                            }
                        }

                        // Smooth camera zoom interpolation
                        currentCamZ += (targetCamZ - currentCamZ) * 0.055;
                        camera.position.z = currentCamZ;

                        // Smooth tilt interpolation with mouse parallax
                        currentRotX += (targetRotX - currentRotX) * 0.05;
                        globeGroup.rotation.x = currentRotX + targetMouseRotX * 0.4;

                        // Orbital rings & idle movement
                        ring1.rotation.z += 0.005;
                        ring2.rotation.z -= 0.004;
                        const elapsed = clock.getElapsedTime();
                        globeGroup.position.y = Math.sin(elapsed * 1.1) * 1.8;

                        renderer.render(scene, camera);
                    }
                    loop();
                }
                window.initThreeGlobe = initThreeGlobe;
            })();
        </script>

        <!-- Journey Section -->'''

new_block = template.replace("__INDIA_COORDS__", coords_js)

# Replace in index.html
new_content = content[:match.start()] + new_block + content[match.end():]
with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Applied updated 3D Globe with fast initial India approach!")
