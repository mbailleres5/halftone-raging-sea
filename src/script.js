import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import halftoneVertexShader from './shaders/halftone/vertexhalftone.glsl'
import halftoneFragmentShader from './shaders/halftone/fragmenthalftone.glsl'
import waterVertexShader from './shaders/water/vertexwater.glsl'
import waterFragmentShader from './shaders/water/fragmentwater.glsl'
import mixedVertexShader from './shaders/water-halftone/vertex.glsl'
import mixedFragmentShader from './shaders/water-halftone/fragment.glsl'
import fragmentShader from './shaders/combined-2/fragment.glsl'
import vertexShader from './shaders/combined-2/vertex.glsl'

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
/**
 * Base
 */

// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Halftone
 */
const halftoneParameters = {}
halftoneParameters.color = '#652d1b'
halftoneParameters.shadowColor = '#8e19b8'
halftoneParameters.depthWrite = false
const halftone = new THREE.ShaderMaterial({
    vertexShader: halftoneVertexShader,
    fragmentShader: halftoneFragmentShader,
    uniforms:
    {
        uColor: new THREE.Uniform(new THREE.Color(halftoneParameters.color)),
        uShadeColor: new THREE.Uniform(new THREE.Color(halftoneParameters.shadeColor)),
    }
})

const halfToneWater = new THREE.ShaderMaterial({
    vertexShader: mixedVertexShader,
    fragmentShader: mixedFragmentShader,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },

        uColor: new THREE.Uniform(new THREE.Color(halftoneParameters.color)),
        uShadowColor: new THREE.Uniform(new THREE.Color(halftoneParameters.shadowColor)),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uShadowRepetitions: new THREE.Uniform(100),
        uShadowColor: new THREE.Uniform(new THREE.Color(halftoneParameters.shadowColor)),
    },
    //transparent: true,
    side: THREE.DoubleSide,
    depthWrite: halftoneParameters.depthWrite,
    blending: THREE.AdditiveBlending,

})
gui.add(halftoneParameters, 'depthWrite').name('depthWrite').onChange(() => {
    halfToneWater.depthWrite = halftoneParameters.depthWrite
})
gui
    .addColor(halftoneParameters, 'color')
    .onChange(() => {
        halfToneWater.uniforms.uColor.value.set(halftoneParameters.color)
    })


gui
    .addColor(halftoneParameters, 'shadowColor')
    .onChange(() => {
        halfToneWater.uniforms.uShadowColor.value.set(halftoneParameters.shadowColor)
    })
/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.BoxGeometry(64, 64, 8, 512, 512)

// Colors
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },
    }
})

//Debug
gui.add(halfToneWater.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(halfToneWater.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(halfToneWater.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(halfToneWater.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')
gui
    .addColor(debugObject, 'depthColor').name('depthColor')
    .onChange(() => {
        waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
    })

gui.add(halfToneWater.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(halfToneWater.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(halfToneWater.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(halfToneWater.uniforms.uSmallWavesIterations, 'value').min(0).max(10).step(1).name('uSmallWavesIterations')

// WATER
const water = new THREE.Mesh(waterGeometry, halfToneWater)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update uniforms
    halfToneWater.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const rendererParameters = {}
rendererParameters.clearColor = '#26132f'

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(rendererParameters.clearColor)
    })
/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    halfToneWater
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    halfToneWater
)
sphere.position.x = - 3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load(
    './suzanne.glb',
    (gltf) => {
        suzanne = gltf.scene
        suzanne.traverse((child) => {
            if (child.isMesh)
                child.material = halfToneWater
        })
        scene.add(suzanne)
    }
)
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    // camera.position.x = Math.sin(elapsedTime / 8) * 6
    // camera.position.z = Math.cos(elapsedTime / 8) * 6
    // Update water
    waterMaterial.uniforms.uTime.value = elapsedTime
    halfToneWater.uniforms.uTime.value = elapsedTime
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()