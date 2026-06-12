import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const statusLabel = document.querySelector("#status");
const speedControl = document.querySelector("#speedControl");
const lightControl = document.querySelector("#lightControl");
const scanButton = document.querySelector("#scanButton");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03131e);
scene.fog = new THREE.FogExp2(0x041827, 0.045);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(
  58,
  window.innerWidth / window.innerHeight,
  0.1,
  300,
);
camera.position.set(18, 10, 18);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 8;
controls.maxDistance = 55;
controls.target.set(0, 2, 0);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const keys = new Set();
const clickable = [];
const fishAgents = [];
const sampleNodes = [];

let sonarActive = false;
let sonarTime = 0;
let samplesCollected = 0;

const materials = {
  sand: new THREE.MeshStandardMaterial({
    color: 0x8a6f4e,
    roughness: 0.94,
    metalness: 0.02,
  }),
  rock: new THREE.MeshStandardMaterial({
    color: 0x34464a,
    roughness: 0.88,
    metalness: 0.04,
  }),
  submarine: new THREE.MeshStandardMaterial({
    color: 0xf5b642,
    roughness: 0.45,
    metalness: 0.35,
  }),
  submarineDark: new THREE.MeshStandardMaterial({
    color: 0x263643,
    roughness: 0.55,
    metalness: 0.42,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xa9f5ff,
    transmission: 0.25,
    transparent: true,
    opacity: 0.62,
    roughness: 0.08,
    metalness: 0.02,
  }),
  coralRed: new THREE.MeshStandardMaterial({
    color: 0xff6666,
    roughness: 0.72,
    metalness: 0.02,
  }),
  coralGreen: new THREE.MeshStandardMaterial({
    color: 0x59c28d,
    roughness: 0.68,
    metalness: 0.02,
  }),
  coralBlue: new THREE.MeshStandardMaterial({
    color: 0x5aa7ff,
    roughness: 0.66,
    metalness: 0.03,
  }),
  biolume: new THREE.MeshStandardMaterial({
    color: 0x9afcff,
    emissive: 0x42f4cc,
    emissiveIntensity: 1.8,
    roughness: 0.25,
    metalness: 0.05,
  }),
  jelly: new THREE.MeshPhysicalMaterial({
    color: 0xf2a6ff,
    emissive: 0x7a2f9c,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.58,
    roughness: 0.18,
    metalness: 0,
  }),
  sonar: new THREE.MeshBasicMaterial({
    color: 0x72fff0,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
};

const ambient = new THREE.HemisphereLight(0x8deeff, 0x051018, 1.35);
scene.add(ambient);

const moonLight = new THREE.DirectionalLight(0xa7e8ff, 2.2);
moonLight.position.set(-10, 24, 7);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.left = -35;
moonLight.shadow.camera.right = 35;
moonLight.shadow.camera.top = 35;
moonLight.shadow.camera.bottom = -35;
scene.add(moonLight);

const submarineLight = new THREE.SpotLight(0xbefcff, 3.2, 42, Math.PI / 8, 0.65, 1.4);
submarineLight.castShadow = true;
submarineLight.target.position.set(9, 0, 0);
scene.add(submarineLight, submarineLight.target);

const seaFloor = new THREE.Mesh(
  new THREE.CircleGeometry(58, 96),
  materials.sand,
);
seaFloor.rotation.x = -Math.PI / 2;
seaFloor.receiveShadow = true;
scene.add(seaFloor);

const reef = new THREE.Group();
reef.name = "Arrecife jerarquico";
scene.add(reef);

createRocks();
createCoralForest();
createBioluminescentSamples();
const submarine = createSubmarine();
scene.add(submarine);
const station = createResearchStation();
scene.add(station);
createFishSchool();
createJellyfishBloom();
createBubbles();

const sonarRing = new THREE.Mesh(
  new THREE.RingGeometry(0.7, 0.76, 96),
  materials.sonar,
);
sonarRing.rotation.x = -Math.PI / 2;
scene.add(sonarRing);

function createSubmarine() {
  const group = new THREE.Group();
  group.name = "Submarino con jerarquia de piezas";
  group.position.set(-9, 3.2, 0);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(1.15, 3.8, 10, 24),
    materials.submarine,
  );
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.glass,
  );
  cabin.position.set(0.25, 0.95, 0);
  cabin.scale.set(1.25, 0.8, 1);
  cabin.castShadow = true;
  group.add(cabin);

  const tail = new THREE.Group();
  tail.name = "Cola y propulsor";
  tail.position.set(-2.55, 0, 0);
  group.add(tail);

  const finGeometry = new THREE.BoxGeometry(0.28, 1.4, 0.16);
  for (let i = 0; i < 4; i += 1) {
    const fin = new THREE.Mesh(finGeometry, materials.submarineDark);
    fin.rotation.x = (Math.PI / 2) * i;
    fin.position.x = -0.2;
    fin.castShadow = true;
    tail.add(fin);
  }

  const propeller = new THREE.Group();
  propeller.name = "Helice animada";
  propeller.position.set(-0.55, 0, 0);
  tail.add(propeller);

  for (let i = 0; i < 3; i += 1) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.05, 0.16),
      materials.submarineDark,
    );
    blade.rotation.x = (Math.PI * 2 * i) / 3;
    propeller.add(blade);
  }
  group.userData.propeller = propeller;

  for (let i = 0; i < 3; i += 1) {
    const porthole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24),
      materials.glass,
    );
    porthole.rotation.z = Math.PI / 2;
    porthole.position.set(0.9 - i * 0.72, 0.14, 1.06);
    porthole.castShadow = true;
    group.add(porthole);
  }

  const periscope = new THREE.Group();
  periscope.name = "Periscopio jerarquico";
  periscope.position.set(0.4, 1.65, 0);
  group.add(periscope);

  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.05, 18),
    materials.submarineDark,
  );
  pipe.position.y = 0.35;
  pipe.castShadow = true;
  periscope.add(pipe);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.25, 0.32),
    materials.submarineDark,
  );
  head.position.set(0.28, 0.9, 0);
  head.castShadow = true;
  periscope.add(head);

  const arm = new THREE.Group();
  arm.name = "Brazo recolector interactivo";
  arm.position.set(1.25, -0.65, 0.72);
  group.add(arm);

  const segmentA = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.1, 12),
    materials.submarineDark,
  );
  segmentA.rotation.z = Math.PI / 4;
  segmentA.castShadow = true;
  arm.add(segmentA);

  const claw = new THREE.Group();
  claw.position.set(0.45, -0.45, 0);
  arm.add(claw);
  for (const side of [-1, 1]) {
    const finger = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.5, 0.08),
      materials.submarineDark,
    );
    finger.position.set(0.08 * side, -0.16, 0);
    finger.rotation.z = side * 0.45;
    claw.add(finger);
  }
  group.userData.arm = arm;

  return group;
}

function createResearchStation() {
  const group = new THREE.Group();
  group.name = "Estacion submarina modular";
  group.position.set(9, 1.1, -7);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2.3, 2.55, 1.35, 32),
    materials.submarineDark,
  );
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.glass,
  );
  dome.position.y = 0.7;
  dome.castShadow = true;
  group.add(dome);

  for (let i = 0; i < 4; i += 1) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 2.2, 10),
      materials.submarineDark,
    );
    const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4;
    leg.position.set(Math.cos(angle) * 1.85, -1.35, Math.sin(angle) * 1.85);
    leg.rotation.z = Math.cos(angle) * 0.18;
    leg.rotation.x = Math.sin(angle) * -0.18;
    leg.castShadow = true;
    group.add(leg);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.4, 10),
    materials.submarineDark,
  );
  antenna.position.y = 2.45;
  group.add(antenna);

  const beacon = new THREE.PointLight(0x65ffda, 1.3, 15);
  beacon.position.set(0, 3.75, 0);
  group.add(beacon);

  const beaconMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 18, 12),
    materials.biolume,
  );
  beaconMesh.position.copy(beacon.position);
  group.add(beaconMesh);
  group.userData.beacon = beaconMesh;

  return group;
}

function createRocks() {
  for (let i = 0; i < 22; i += 1) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.55, 2.2), 0),
      materials.rock,
    );
    const radius = THREE.MathUtils.randFloat(10, 43);
    const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
    rock.position.set(Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius);
    rock.scale.y = THREE.MathUtils.randFloat(0.35, 0.85);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    reef.add(rock);
  }
}

function createCoralForest() {
  const coralMaterials = [materials.coralRed, materials.coralGreen, materials.coralBlue];
  for (let i = 0; i < 30; i += 1) {
    const coral = new THREE.Group();
    const radius = THREE.MathUtils.randFloat(7, 34);
    const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
    coral.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    coral.rotation.y = THREE.MathUtils.randFloat(0, Math.PI);

    const branches = THREE.MathUtils.randInt(3, 7);
    for (let j = 0; j < branches; j += 1) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.12, THREE.MathUtils.randFloat(0.8, 1.8), 8),
        coralMaterials[(i + j) % coralMaterials.length],
      );
      branch.position.y = branch.geometry.parameters.height / 2;
      branch.rotation.z = THREE.MathUtils.randFloat(-0.55, 0.55);
      branch.rotation.x = THREE.MathUtils.randFloat(-0.35, 0.35);
      branch.castShadow = true;
      coral.add(branch);
    }
    reef.add(coral);
  }
}

function createBioluminescentSamples() {
  const positions = [
    [-12, 0.55, -8],
    [-4, 0.55, 10],
    [5, 0.55, 8],
    [14, 0.55, 3],
    [1, 0.55, -13],
  ];

  positions.forEach((position, index) => {
    const node = new THREE.Group();
    node.name = `Muestra bioluminiscente ${index + 1}`;
    node.position.set(...position);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.12, 0.9, 10),
      materials.coralGreen,
    );
    stem.position.y = 0.34;
    node.add(stem);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 16),
      materials.biolume.clone(),
    );
    orb.position.y = 0.95;
    node.add(orb);

    const light = new THREE.PointLight(0x5ef3cf, 0.75, 7);
    light.position.y = 1.1;
    node.add(light);

    node.userData = { orb, light, collected: false, baseY: position[1] };
    sampleNodes.push(node);
    clickable.push(node);
    scene.add(node);
  });
}

function createFishSchool() {
  const fishMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc857,
    roughness: 0.5,
    metalness: 0.05,
  });
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7b54,
    roughness: 0.6,
    metalness: 0.03,
  });

  for (let i = 0; i < 18; i += 1) {
    const fish = new THREE.Group();
    fish.name = "Pez reactivo";
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 18, 12),
      fishMaterial,
    );
    body.scale.set(1.55, 0.72, 0.6);
    fish.add(body);

    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.38, 3),
      finMaterial,
    );
    tail.position.x = -0.56;
    tail.rotation.z = Math.PI / 2;
    fish.add(tail);

    const agent = {
      group: fish,
      center: new THREE.Vector3(
        THREE.MathUtils.randFloat(-14, 14),
        THREE.MathUtils.randFloat(2.2, 7.6),
        THREE.MathUtils.randFloat(-12, 12),
      ),
      orbit: THREE.MathUtils.randFloat(2.2, 5.8),
      speed: THREE.MathUtils.randFloat(0.35, 0.85),
      phase: Math.random() * Math.PI * 2,
      flee: new THREE.Vector3(),
    };
    fishAgents.push(agent);
    clickable.push(fish);
    scene.add(fish);
  }
}

function createJellyfishBloom() {
  for (let i = 0; i < 7; i += 1) {
    const jelly = new THREE.Group();
    jelly.name = "Medusa animada";
    jelly.position.set(
      THREE.MathUtils.randFloat(-20, 20),
      THREE.MathUtils.randFloat(6, 13),
      THREE.MathUtils.randFloat(-18, 16),
    );

    const bell = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      materials.jelly,
    );
    bell.scale.set(1.05, 0.8, 1.05);
    jelly.add(bell);

    for (let j = 0; j < 8; j += 1) {
      const tentacle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.035, THREE.MathUtils.randFloat(1.3, 2.6), 6),
        materials.jelly,
      );
      const angle = (Math.PI * 2 * j) / 8;
      tentacle.position.set(Math.cos(angle) * 0.3, -0.75, Math.sin(angle) * 0.3);
      tentacle.rotation.x = Math.sin(angle) * 0.28;
      tentacle.rotation.z = Math.cos(angle) * 0.28;
      jelly.add(tentacle);
    }

    jelly.userData = { phase: Math.random() * Math.PI * 2, baseY: jelly.position.y };
    clickable.push(jelly);
    scene.add(jelly);
  }
}

function createBubbles() {
  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xccfbff,
    transparent: true,
    opacity: 0.28,
    roughness: 0.03,
    metalness: 0,
    transmission: 0.35,
  });

  const bubbles = new THREE.Group();
  bubbles.name = "Columnas de burbujas animadas";
  for (let i = 0; i < 90; i += 1) {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.035, 0.15), 10, 8),
      bubbleMaterial,
    );
    bubble.position.set(
      THREE.MathUtils.randFloat(-26, 26),
      THREE.MathUtils.randFloat(0.5, 19),
      THREE.MathUtils.randFloat(-24, 24),
    );
    bubble.userData.speed = THREE.MathUtils.randFloat(0.35, 1.15);
    bubble.userData.drift = THREE.MathUtils.randFloat(0.2, 0.65);
    bubbles.add(bubble);
  }
  scene.add(bubbles);
  scene.userData.bubbles = bubbles;
}

function triggerSonar() {
  sonarActive = true;
  sonarTime = 0;
  sonarRing.scale.setScalar(1);
  materials.sonar.opacity = 0.72;
}

function inspectObject(object) {
  let root = object;
  while (root.parent && !clickable.includes(root)) {
    root = root.parent;
  }

  if (sampleNodes.includes(root) && !root.userData.collected) {
    root.userData.collected = true;
    samplesCollected += 1;
    root.userData.orb.material.emissive.set(0xffc857);
    root.userData.orb.material.emissiveIntensity = 2.8;
    statusLabel.textContent = `Muestras analizadas: ${samplesCollected} / ${sampleNodes.length}`;
    triggerSonar();
    return;
  }

  if (root.name) {
    statusLabel.textContent = `Inspeccionando: ${root.name}. Muestras analizadas: ${samplesCollected} / ${sampleNodes.length}`;
  }
}

function updateSubmarine(delta, elapsed) {
  const speed = Number(speedControl.value);
  const move = new THREE.Vector3();

  if (keys.has("KeyW") || keys.has("ArrowUp")) move.x += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) move.x -= 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) move.z -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) move.z += 1;
  if (keys.has("KeyQ")) move.y += 1;
  if (keys.has("KeyE")) move.y -= 1;

  if (move.lengthSq() > 0) {
    move.normalize();
    submarine.position.addScaledVector(move, delta * speed * 4.8);
    submarine.rotation.y = THREE.MathUtils.lerp(
      submarine.rotation.y,
      Math.atan2(-move.z, move.x),
      0.12,
    );
  }

  submarine.position.x = THREE.MathUtils.clamp(submarine.position.x, -25, 25);
  submarine.position.y = THREE.MathUtils.clamp(submarine.position.y, 1.4, 14);
  submarine.position.z = THREE.MathUtils.clamp(submarine.position.z, -23, 23);
  submarine.position.y += Math.sin(elapsed * 2.1) * 0.0035;
  submarine.userData.propeller.rotation.x += delta * (move.lengthSq() > 0 ? 18 : 5);
  submarine.userData.arm.rotation.z = Math.sin(elapsed * 1.8) * 0.16;

  const lightOffset = new THREE.Vector3(2.45, -0.12, 0);
  const targetOffset = new THREE.Vector3(9, -0.65, 0);
  submarineLight.position.copy(submarine.localToWorld(lightOffset.clone()));
  submarineLight.target.position.copy(submarine.localToWorld(targetOffset.clone()));
  submarineLight.intensity = Number(lightControl.value);

  controls.target.lerp(submarine.position, 0.025);
}

function updateFish(delta, elapsed) {
  for (const agent of fishAgents) {
    const { group, center, orbit, speed, phase, flee } = agent;
    const desired = new THREE.Vector3(
      center.x + Math.cos(elapsed * speed + phase) * orbit,
      center.y + Math.sin(elapsed * speed * 1.5 + phase) * 0.65,
      center.z + Math.sin(elapsed * speed + phase) * orbit,
    );

    const distance = group.position.distanceTo(submarine.position);
    if (distance < 5.2) {
      flee.copy(group.position).sub(submarine.position).normalize().multiplyScalar((5.2 - distance) * 1.35);
    } else {
      flee.multiplyScalar(0.92);
    }

    desired.add(flee);
    group.position.lerp(desired, delta * 1.5);
    group.lookAt(desired.clone().add(new THREE.Vector3(1, 0, 0)));
    group.children[1].rotation.y = Math.sin(elapsed * 12 + phase) * 0.55;
  }
}

function updateJellyfish(elapsed) {
  scene.traverse((object) => {
    if (object.name !== "Medusa animada") return;
    object.position.y = object.userData.baseY + Math.sin(elapsed * 1.15 + object.userData.phase) * 0.75;
    object.rotation.y += 0.0025;
    object.scale.y = 1 + Math.sin(elapsed * 2.6 + object.userData.phase) * 0.06;
  });
}

function updateSamples(elapsed) {
  for (const sample of sampleNodes) {
    sample.rotation.y += 0.006;
    sample.userData.orb.position.y = 0.95 + Math.sin(elapsed * 2.3 + sample.position.x) * 0.08;
    sample.userData.light.intensity = sample.userData.collected
      ? 1.45 + Math.sin(elapsed * 5) * 0.35
      : 0.65 + Math.sin(elapsed * 2) * 0.2;

    if (!sample.userData.collected && sample.position.distanceTo(submarine.position) < 1.9) {
      inspectObject(sample);
    }
  }
}

function updateEnvironment(delta, elapsed) {
  station.userData.beacon.material.emissiveIntensity = 1.4 + Math.sin(elapsed * 3) * 0.45;

  for (const bubble of scene.userData.bubbles.children) {
    bubble.position.y += delta * bubble.userData.speed;
    bubble.position.x += Math.sin(elapsed * bubble.userData.drift + bubble.position.z) * delta * 0.18;
    if (bubble.position.y > 20) {
      bubble.position.y = 0.3;
    }
  }
}

function updateSonar(delta) {
  if (!sonarActive) return;
  sonarTime += delta;
  sonarRing.position.copy(submarine.position);
  sonarRing.position.y = 0.14;
  sonarRing.scale.setScalar(1 + sonarTime * 9);
  materials.sonar.opacity = Math.max(0, 0.72 - sonarTime * 0.55);

  for (const agent of fishAgents) {
    const distance = agent.group.position.distanceTo(submarine.position);
    const wave = Math.abs(distance - sonarTime * 9);
    if (wave < 1.6) {
      agent.flee.copy(agent.group.position).sub(submarine.position).normalize().multiplyScalar(3.6);
    }
  }

  if (sonarTime > 1.35) {
    sonarActive = false;
    materials.sonar.opacity = 0;
  }
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;

  updateSubmarine(delta, elapsed);
  updateFish(delta, elapsed);
  updateJellyfish(elapsed);
  updateSamples(elapsed);
  updateEnvironment(delta, elapsed);
  updateSonar(delta);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Space") {
    event.preventDefault();
    triggerSonar();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

window.addEventListener("pointerdown", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickable, true);
  if (hits.length > 0) {
    inspectObject(hits[0].object);
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

scanButton.addEventListener("click", triggerSonar);

animate();
