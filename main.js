import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';
//import { request } from 'http';

const messages = [
    "You're doing better than you think 💙",
    "Small steps still move you forward.",
    "I'm proud of you for being here.",
    "You're not alone — I'm with you in this tank 🐟",
    "Just checking in. You're okay 💫",
    "Little breaks make a big difference.",
    "You are enough, just as you are."
  ];

const speechBubble = document.createElement('div');
speechBubble.style.position = 'absolute';
speechBubble.style.background = 'rgba(255, 255, 255, 0.95)';
speechBubble.style.borderRadius = '10px';
speechBubble.style.padding = '8px 14px';
speechBubble.style.fontFamily = '"Fredoka", sans-serif';
speechBubble.style.fontSize = '36px';
speechBubble.style.color = '#222';
speechBubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
speechBubble.style.display = 'none';
speechBubble.style.pointerEvents = 'none';
speechBubble.style.zIndex = '10';
speechBubble.style.transform = 'translate(-50%, -100%)';
speechBubble.style.transition = 'opacity 0.3s ease-in-out';
speechBubble.style.maxWidth = '220px';
speechBubble.style.textAlign = 'center';
speechBubble.style.whiteSpace = 'pre-wrap';

// Bubble text
const bubbleText = document.createElement('span');
bubbleText.className = 'bubble-text';
speechBubble.appendChild(bubbleText);

// Tail
const bubbleTail = document.createElement('div');
bubbleTail.style.position = 'absolute';
bubbleTail.style.bottom = '-10px';
bubbleTail.style.left = '50%';
bubbleTail.style.marginLeft = '-6px';
bubbleTail.style.width = '0';
bubbleTail.style.height = '0';
bubbleTail.style.borderLeft = '6px solid transparent';
bubbleTail.style.borderRight = '6px solid transparent';
bubbleTail.style.borderTop = '10px solid rgba(255, 255, 255, 0.95)';
speechBubble.appendChild(bubbleTail);

document.body.appendChild(speechBubble);

const clock = new THREE.Clock();
const colors = [0xff66cc, 0x66ccff, 0xffcc66, 0x99ff99];

let oscar, walkAction, idleAction;
let walking = true;
let idle1Plays = 0;
let idle1Action; // <-- this was missing


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0xeeeeff, 3, 8);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);

// GLTF Loader
const loader = new GLTFLoader();
let mixer;

// Load Oscar
loader.load('/oscar.glb', (gltf) => {
    oscar = gltf.scene;
    oscar.scale.set(0.5, 0.5, 0.5);
    oscar.position.set(0, -1, -3);
  scene.add(oscar);

  mixer = new AnimationMixer(oscar);
  const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
  const idle2Clip = THREE.AnimationClip.findByName(gltf.animations, 'Idle2');
  const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walking');
  if (walkClip && idleClip && idle2Clip) {
    walkAction = mixer.clipAction(walkClip);
    idle1Action = mixer.clipAction(idleClip); 
    idle1Action.setLoop(THREE.LoopOnce, 2);
    idle1Action.clampWhenFinished = true;
    idleAction = mixer.clipAction(idle2Clip);
    walkAction.play();
    
  }
});

const bowlGeometry = new THREE.CylinderGeometry(2.5, 2.5, 5, 64, 1, true);
const bowlMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.2,
    transmission: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    side: THREE.BackSide,
  });
  const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
  bowl.rotation.y = Math.PI / 4;
  bowl.position.y = .8;
  scene.add(bowl);

  const glowLight = new THREE.PointLight(0x88ccff, 1.5, 10, 2);
glowLight.position.set(0, -1.2, 0);
scene.add(glowLight);

const ringGeo = new THREE.RingGeometry(1.2, 1.5, 32);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x88ccff,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide
});
const glowRing = new THREE.Mesh(ringGeo, ringMat);
glowRing.rotation.x = -Math.PI / 2;
glowRing.position.y = -1.5;
scene.add(glowRing);

// Load environment models
const environmentGroup = new THREE.Group();
scene.add(environmentGroup);

loader.load('/Rock.glb', (gltf) => {
    for (let i = 0; i < 100; i++) {
      const rock = gltf.scene.clone(true);
      rock.scale.setScalar(0.0005 + Math.random() * 0.0005); // much smaller
      rock.position.set(
        THREE.MathUtils.randFloat(-1.5, 1.5),
        -1.5,
        THREE.MathUtils.randFloat(-1, 2)
      );
      rock.rotation.y = Math.random() * Math.PI * 2;
  
      rock.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.color.set(colors[i % colors.length]);
        }
      });
  
      environmentGroup.add(rock);
    }
  });
  

loader.load('/Wood Log.glb', (gltf) => {
  const log = gltf.scene;
  log.scale.set(0.4, 0.4, 0.4);
  log.position.set(1.25, -1.5, 0);
  log.rotation.y = Math.PI / 4;
  environmentGroup.add(log);
});


loader.load('/Tower.glb', (gltf) => {
    const tower = gltf.scene;
    tower.scale.set(0.2, 0.2, 0.2);
    tower.position.set(-1.25, -1.5, -2);
    tower.rotation.y = Math.PI / 2;
    environmentGroup.add(tower);
  });


const waterUniforms = {
    time: { value: 0 }
  };
  
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
  
      float causticPattern(vec2 uv, float t) {
        float pattern = sin(uv.x * 20.0 + t * 1.5) * sin(uv.y * 20.0 + t * 1.2);
        pattern += sin((uv.x + uv.y) * 30.0 - t * 1.1);
        return pattern;
      }
  
      void main() {
        float pattern = causticPattern(vUv, time);
        vec3 color = mix(vec3(0.9, 0.95, 1.0), vec3(0.7, 0.85, 1.0), pattern * 0.5 + 0.5);
        gl_FragColor = vec4(color, 0.4);
      }
    `,
    transparent: true,
  });
  
  const waterGeometry = new THREE.CircleGeometry(2.5, 64);

  const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
  waterPlane.rotation.x = -Math.PI / 2;
  waterPlane.position.y = -1.5;
  scene.add(waterPlane);

// Fake shadow/reflection pass
const shadowMaterial = new THREE.MeshStandardMaterial({
  color: 0x444466,
  opacity: 0.15,
  transparent: true,
});
const shadowPlane = new THREE.Mesh(waterGeometry.clone(), shadowMaterial);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -1.49;
scene.add(shadowPlane);

// Light beams
const beamGeometry = new THREE.ConeGeometry(1.2, 3, 32, 1, true);
const beamMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.15,
  emissive: 0xffffff,
  emissiveIntensity: 0.2,
  side: THREE.DoubleSide,
});

for (let i = 0; i < 4; i++) {
  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  beam.rotation.x = Math.PI;
  beam.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
  beam.position.set(
    THREE.MathUtils.randFloat(-1.5, 1.5),
    2,
    THREE.MathUtils.randFloat(-1, 1)
  );
  beam.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
  scene.add(beam);
}

// Bubbles
const bubbleGroup = new THREE.Group();
scene.add(bubbleGroup);

const bubbleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const bubbleMaterial = new THREE.MeshStandardMaterial({
  color: 0x88ccff,
  transparent: true,
  opacity: 0.5,
  roughness: 0.3,
  metalness: 0.1,
  depthWrite: false, // ⬅️ prevents Z-sorting glitches
});

const bubbleCount = 20;
const bubbles = [];

for (let i = 0; i < bubbleCount; i++) {
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  bubble.position.set(
    THREE.MathUtils.randFloat(-1.5, 1.5),
    THREE.MathUtils.randFloat(-1, 1),
    THREE.MathUtils.randFloat(-1, 1)
  );
  bubble.userData.speed = THREE.MathUtils.randFloat(0.001, 0.004);
  bubbleGroup.add(bubble);
  bubbles.push(bubble);
}

const burstBubbles = [];
const sparkleGroup = new THREE.Group();
scene.add(sparkleGroup);
const sparkleGeometry = new THREE.SphereGeometry(0.015, 6, 6);
const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0x99ccff, transparent: true, opacity: 0.8 });

for (let i = 0; i < 20; i++) {
  const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial.clone());
  sparkle.position.set(
    THREE.MathUtils.randFloat(-1.5, 1.5),
    THREE.MathUtils.randFloat(-0.5, 2.0),
    THREE.MathUtils.randFloat(-1.0, 1.0)
  );
  sparkle.material.opacity = Math.random() * 0.5 + 0.3;
  sparkle.userData.baseOpacity = sparkle.material.opacity;
  sparkleGroup.add(sparkle);
}




// Animate loop
function animate(time) {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const t = time * 0.001;
  
    if (mixer) mixer.update(delta);
  
    waterUniforms.time.value = t;
    glowLight.intensity = 1.2 + Math.sin(t * 2) * 0.3;
    ringMat.opacity = 0.2 + Math.sin(t * 2) * 0.1;

    // Animate bubbles with wobble
    bubbles.forEach((bubble, i) => {
      bubble.position.y += bubble.userData.speed;
      bubble.position.x += Math.sin(t + i) * 0.001;
      if (bubble.position.y > 2) {
        bubble.position.y = -1;
        bubble.position.x = THREE.MathUtils.randFloat(-1.5, 1.5);
      }
    });
  
    // Animate sparkle flicker
    sparkleGroup.children.forEach((sparkle, i) => {
      sparkle.material.opacity = sparkle.userData.baseOpacity * (0.5 + 0.5 * Math.sin(t * 2 + i));
    });
  
    // Burst bubbles (random chance to spawn)
    if (Math.random() < 0.02 && burstBubbles.length < 15) {
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial.clone());
      bubble.scale.setScalar(THREE.MathUtils.randFloat(0.02, 0.07));
      bubble.position.set(
        THREE.MathUtils.randFloat(-1.5, 1.5),
        -1,
        THREE.MathUtils.randFloat(-1.0, 1.0)
      );
      bubble.userData.speed = THREE.MathUtils.randFloat(0.01, 0.03);
      bubbleGroup.add(bubble);
      burstBubbles.push(bubble);
    }
  
    // Animate burst bubbles
    for (let i = burstBubbles.length - 1; i >= 0; i--) {
      const b = burstBubbles[i];
      b.position.y += b.userData.speed;
      b.scale.multiplyScalar(0.98); // shrink as they rise
      if (b.position.y > 2 || b.scale.x < 0.005) {
        bubbleGroup.remove(b);
        burstBubbles.splice(i, 1);
      }
    }

    if (oscar && walking) {
        oscar.position.z += 0.01;
        if (oscar.position.z >= 0) {
          oscar.position.z = 0;
          walking = false;
          walkAction.stop();
          idle1Action.reset().play();
      
          // Show speech bubble
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          speechBubble.querySelector('.bubble-text').textContent = randomMsg;
          speechBubble.style.display = 'block';
        }
      }
      
      // Switch to idle2 after idle1 completes
      if (idle1Action && idle1Action.isRunning() === false && idle1Plays === 0) {
        idle1Plays = 1;
        idleAction.play();
        
      }

      if (oscar && !walking) {
        const oscarWorldPosition = new THREE.Vector3();
        oscar.getWorldPosition(oscarWorldPosition);
        oscarWorldPosition.y += 1.5;
      
        const screenPosition = oscarWorldPosition.clone().project(camera);
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (1 - (screenPosition.y * 0.5 + 0.5)) * window.innerHeight;
      
        speechBubble.style.left = `${x}px`;
        speechBubble.style.top = `${y}px`;
      }
      
    renderer.render(scene, camera);
  }
  

animate();
