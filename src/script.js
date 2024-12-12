/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000)
camera.position.set(34,16,-20)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(2)
})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69,44,14)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
let mixer; // Declare mixer outside to access it in the render loop
loader.load('models/gltf/XE CONTAINER 2.glb', function (gltf) {
    const model = gltf.scene; // Get the scene (3D model)
    scene.add(gltf.scene);
    console.log(gltf)
    if (gltf.animations && gltf.animations.length > 0) {
        // Create AnimationMixer
        mixer = new THREE.AnimationMixer(model);

        // Play all animations (or select specific ones by index)
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play(); // Play the animation
        });
    }
})

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
    
    new TWEEN.Tween(camera.position.set(26,4,-35 )).to({ // from camera position
        x: -181, //desired x position to go
        y: 170, //desired y position to go
        z: 284 //desired z position to go
    }, 6500) // time take to animate
    .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
    .onComplete(function () { //on finish animation
        controls.enabled = true //enable orbit controls
        setOrbitControlsLimits() //enable controls limits
        controls.autoRotate = true; // enable auto-rotate
        controls.autoRotateSpeed = 0.5; // set auto-rotate speed
        TWEEN.remove(this) // remove the animation from memory
    })
}

introAnimation() // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 600
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5
}
const clock = new THREE.Clock(); // Initialize the clock

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {
    const deltaTime = clock.getDelta(); // Get the time between frames

    TWEEN.update() // update animations
    if (mixer) {
        mixer.update(deltaTime); // Update the mixer for animations
    }
    controls.update() // update orbit controls

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    
}

rendeLoop() //start rendering

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
// const gui = new GUI()

// // create parameters for GUI
// var params = {color: sunLight.color.getHex(), color2: ambient.color.getHex(), color3: scene.background.getHex()}

// // create a function to be called by GUI
// const update = function () {
// 	var colorObj = new THREE.Color( params.color )
// 	var colorObj2 = new THREE.Color( params.color2 )
// 	var colorObj3 = new THREE.Color( params.color3 )
// 	sunLight.color.set(colorObj)
// 	ambient.color.set(colorObj2)
// 	scene.background.set(colorObj3)
// }

// //////////////////////////////////////////////////
// //// GUI CONFIG
// gui.add(sunLight, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity')
// gui.add(sunLight.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos')
// gui.add(sunLight.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos')
// gui.add(sunLight.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos')
// gui.addColor(params,'color').name('Dir color').onChange(update)
// gui.addColor(params,'color2').name('Amb color').onChange(update)
// gui.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity')
// gui.addColor(params,'color3').name('BG color').onChange(update)

// //////////////////////////////////////////////////
// //// ON MOUSE MOVE TO GET CAMERA POSITION
// document.addEventListener('mousemove', (event) => {
//     event.preventDefault()

//     // console.log(camera.position)

// }, false)