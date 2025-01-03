/////////////////////////////////////////////////////////////////////////
///// IMPORT
import "./main.css";
import * as THREE from "three";
// import * as TWEEN from "three/examples/jsm/libs/tween.module.min.js";
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { ViewportGizmo } from "three-viewport-gizmo";

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
dracoLoader.setDecoderConfig({ type: "js" });
loader.setDRACOLoader(dracoLoader);

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement("div");
document.body.appendChild(container);

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene();
scene.background = new THREE.Color("#c8f0f9");

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true }); // turn on antialias
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.; // Optional: for softer shadows

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight); // make it full screen
// renderer.outputEncoding = THREE.sRGBEncoding; // set color encoding
container.appendChild(renderer.domElement); // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.position.set(34, 16, -20);
scene.add(camera);

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(2);
  gizmo.update();

});

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer,{size:100});
gizmo.attachControls(controls);

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82);
scene.add(ambient);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
//#region //*shadow
// sunLight.castShadow = true;

// // Optional: Configure shadow properties
// sunLight.shadow.mapSize.width = 2048; // Default is 512
// sunLight.shadow.mapSize.height = 2048;
// sunLight.shadow.camera.near = 0.5; // Default is 0.5
// sunLight.shadow.camera.far = 500; // Default is 500
// sunLight.shadow.camera.left = -100; // Adjust these values based on your scene
// sunLight.shadow.camera.right = 100;
// sunLight.shadow.camera.top = 100;
// sunLight.shadow.camera.bottom = -100;
//#endregion
sunLight.position.set(23, 44, 14);
scene.add(sunLight);

const additionalLight = new THREE.DirectionalLight(0xffffff, 2);
additionalLight.position.set(50, 50, 50);
scene.add(additionalLight);

const light2 = new THREE.DirectionalLight(0xffffff, 2);
light2.position.set(-50, 50, -50);
scene.add(light2);

// const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 1); // Sky color, ground color, intensity
// scene.add(hemisphereLight);

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
let modelCenter = new THREE.Vector3(); // Vector to store the center of the model

let mixer; // Declare mixer outside to access it in the render loop
loader.load("models/gltf/danon.glb", function (gltf) {
  const model = gltf.scene; // Get the scene (3D model)
  scene.add(gltf.scene);

  // Add a bounding box around the loaded model
  //   const boundingBox = addBoundingBox(model);
  const box = new THREE.Box3().setFromObject(model);
  //   box.min.
  let temp = box.getCenter(new THREE.Vector3());
  //   console.log(modelCenter, center);
  //   mesh.position.set(
  //     mesh.position.x - center.x,
  //     mesh.position.y - center.y,
  //     mesh.position.z - center.z
  //   );
  modelCenter = new THREE.Vector3(temp.x, box.min.y, temp.z);
  // Update the camera to look at the calculated center
  camera.lookAt(modelCenter);
  controls.target.copy(modelCenter);
  if (gltf.animations && gltf.animations.length > 0) {
    // Create AnimationMixer
    mixer = new THREE.AnimationMixer(model);

    // Play all animations (or select specific ones by index)
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play(); // Play the animation
    });
  }
  introAnimation(); // call intro animation on start
  playAudio();
  setTimeout(() => {
    playHornEffectAudio();
  }, 2000);
  // Assuming the GLTF model contains meshes
  //   gltf.scene.traverse((child) => {
  //     if (child.isMesh) {
  //       child.castShadow = true; // Enable shadow casting
  //       child.receiveShadow = true; // Enable shadow receiving
  //     }
  //   });
});

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
  controls.enabled = false; //disable orbit controls to animate the camera

  new TWEEN.Tween(camera.position.set(34, 16, -20))
    .to(
      {
        // from camera position
        x: 25, //desired x position to go
        y: 200, //desired y position to go
        z: 461, //desired z position to go
      },
      6500
    ) // time take to animate
    .delay(1000)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start() // define delay, easing
    .onComplete(function () {
      //on finish animation
      controls.enabled = true; //enable orbit controls
      setOrbitControlsLimits(); //enable controls limits
      controls.autoRotate = true; // enable auto-rotate
      controls.autoRotateSpeed = 0.5; // set auto-rotate speed
      TWEEN.remove(this); // remove the animation from memory
    });
}

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits() {
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.minDistance = 35;
  controls.maxDistance = 500;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.maxPolarAngle = Math.PI / 2.5;
  //   controls.target.copy(modelCenter);
}
const clock = new THREE.Clock(); // Initialize the clock

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {
  const deltaTime = clock.getDelta(); // Get the time between frames

  TWEEN.update(); // update animations
  if (mixer) {
    mixer.update(deltaTime); // Update the mixer for animations
  }
  // Ensure the camera always looks at the center of the model
  camera.lookAt(modelCenter);
  controls.update(); // update orbit controls

  renderer.render(scene, camera); // render the scene using the camera

  requestAnimationFrame(rendeLoop); //loop the render function
  gizmo.render();

}

rendeLoop(); //start rendering

// import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
// const gui = new GUI();

// // create parameters for GUI
// var params = {
//   color: sunLight.color.getHex(),
//   color2: ambient.color.getHex(),
//   color3: scene.background.getHex(),
// };

// // create a function to be called by GUI
// const update = function () {
//   var colorObj = new THREE.Color(params.color);
//   var colorObj2 = new THREE.Color(params.color2);
//   var colorObj3 = new THREE.Color(params.color3);
//   sunLight.color.set(colorObj);
//   ambient.color.set(colorObj2);
//   scene.background.set(colorObj3);
// };

// //////////////////////////////////////////////////
// //// GUI CONFIG
// gui
//   .add(sunLight, "intensity")
//   .min(0)
//   .max(10)
//   .step(0.0001)
//   .name("Dir intensity");
// gui
//   .add(sunLight.position, "x")
//   .min(-100)
//   .max(100)
//   .step(0.00001)
//   .name("Dir X pos");
// gui.add(sunLight.position, "y").min(0).max(100).step(0.00001).name("Dir Y pos");
// gui
//   .add(sunLight.position, "z")
//   .min(-100)
//   .max(100)
//   .step(0.00001)
//   .name("Dir Z pos");
// gui.addColor(params, "color").name("Dir color").onChange(update);
// gui.addColor(params, "color2").name("Amb color").onChange(update);
// gui.add(ambient, "intensity").min(0).max(10).step(0.001).name("Amb intensity");
// gui.addColor(params, "color3").name("BG color").onChange(update);

// //////////////////////////////////////////////////
// //// ON MOUSE MOVE TO GET CAMERA POSITION
// document.addEventListener(
//   "mousemove",
//   (event) => {
//     event.preventDefault();

//     console.log(camera.position);
//   },
//   false
// );

//// HELPER FUNCTION TO ADD A BOUNDING BOX
function addBoundingBox(object) {
  const boxHelper = new THREE.BoxHelper(object, 0xffff00); // Yellow bounding box
  scene.add(boxHelper);

  // Optional: Update the box in the render loop if the object is animated
  return boxHelper;
}
function calculateCenter(min, max) {
  return new THREE.Vector3(
    (min.x + max.x) / 2,
    (min.y + max.y) / 2,
    (min.z + max.z) / 2
  );
}
let audioContext;
let audioBuffer;
let hornEffectBuffer;
let source;
let gainNode;

async function loadAudio(url) {
  // Initialize AudioContext
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Fetch audio data
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Decode audio data
  audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

async function loadHornEffect(url) {
  // Initialize AudioContext
  if(!audioContext)
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Fetch audio data
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Decode audio data
  hornEffectBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

function playAudio() {
  if (!audioBuffer) return;

  // Create audio buffer source
  source = audioContext.createBufferSource();
  source.loop = true; // Enable looping

  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  // Start playback
  source.start(0);
}

function playHornEffectAudio() {
  if (!hornEffectBuffer) return;

  // Create audio buffer source
  source = audioContext.createBufferSource();
  source.loop = true; // Enable looping
  gainNode = audioContext.createGain();

  source.buffer = hornEffectBuffer;
  // source.connect(audioContext.destination);
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Start with low volume
  // Start playback
  source.start(0);
}

function stopAudio() {
  if (source) {
    source.stop();
  }
}

// Load the WebA file
loadAudio("musics/videoplayback.weba"); // Update with the actual file path
loadHornEffect("musics/train.mp3"); // Update with the actual file path
