import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */

const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
} 


gui
    .addColor(parameters, 'materialColor')
    .onChange(() => 
    {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    }) 
    // hide the GUI
    gui.hide()

/**
 * 
 * Base
 */
// Canvas

const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects

// textures
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// material
const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: gradientTexture    
})

// Fade "Your Journey Begins" text and boxMesh
const text = document.querySelector('section.text')
gsap.to(text, { opacity: 0, duration: 2, delay: 3 })

// Lights

// light on health bar 
const directionalLight1 = new THREE.DirectionalLight(0xA2B1FC, 3)
directionalLight1.position.set(1, 1, 1)
scene.add(directionalLight1)

// light on image box
const directionalLight2 = new THREE.DirectionalLight(0xA2B1FC, 3)
directionalLight2.position.set(0, 0, -1)
scene.add(directionalLight2)

// light on narration box
const directionalLight3 = new THREE.DirectionalLight(0xA2B1FC, 3)
directionalLight3.position.set(0, 0, 1)
scene.add(directionalLight3)

// light on option boxes + custom
const directionalLight4 = new THREE.DirectionalLight(0xA2B1FC, 3)
directionalLight4.position.set(-1, -1, 1)
scene.add(directionalLight4)

// Meshes

// // health bar
// const healthBarGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.15);
// const healthBarMaterial = new THREE.MeshStandardMaterial({ 
//     color: 0xDE1E1E, 
//     transparent: true,
//  });
// const healthBarMesh = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
// healthBarMesh.position.set(-2.9, 1.5, 0);
// scene.add(healthBarMesh);

// // volume box
// const volumeBoxGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.15);
// const volumeBoxMaterial = new THREE.MeshStandardMaterial({ 
//     color: 0x1EDEDE, 
//     transparent: true
//  });
// const volumeBoxMesh = new THREE.Mesh(volumeBoxGeometry, volumeBoxMaterial);
// volumeBoxMesh.position.set(-2.9, -1.43, 0);
// scene.add(volumeBoxMesh);

// // narration box
// const narrationBoxGeometry = new THREE.BoxGeometry(3.5, 0.75, 0.15);
// const narrationBoxMaterial = new THREE.MeshStandardMaterial({ 
//     color: 0x7B5387, 
//     opacity: 0.8,
//  });
// const narrationBoxMesh = new THREE.Mesh(narrationBoxGeometry, narrationBoxMaterial);
// narrationBoxMesh.position.set(0, -1.2, 0);
// scene.add(narrationBoxMesh);

// // option 1 box
// const option1BoxGeometry = new THREE.BoxGeometry(1.1, 0.4, 0.15);
// const option1BoxMaterial = new THREE.MeshStandardMaterial({ color: 0xD5D5F9});
// const option1BoxMesh = new THREE.Mesh(option1BoxGeometry, option1BoxMaterial);
// option1BoxMesh.position.set(2.9, 1.5, 0);
// scene.add(option1BoxMesh);

// // option 2 box
// const option2BoxGeometry = new THREE.BoxGeometry(1.1, 0.4, 0.15);
// const option2BoxMaterial = new THREE.MeshStandardMaterial({ color: 0xF9D9D5});
// const option2BoxMesh = new THREE.Mesh(option2BoxGeometry, option2BoxMaterial);
// option2BoxMesh.position.set(2.9, 1, 0);
// scene.add(option2BoxMesh);

// // option 3 box
// const option3BoxGeometry = new THREE.BoxGeometry(1.1, 0.4, 0.15);
// const option3BoxMaterial = new THREE.MeshStandardMaterial({ color: 0xD5D5F9});
// const option3BoxMesh = new THREE.Mesh(option3BoxGeometry, option3BoxMaterial);
// option3BoxMesh.position.set(2.9, 0.5, 0);
// scene.add(option3BoxMesh);

// // option 4 box
// const option4BoxGeometry = new THREE.BoxGeometry(1.1, 0.4, 0.15);
// const option4BoxMaterial = new THREE.MeshStandardMaterial({ color: 0xF9D9D5});
// const option4BoxMesh = new THREE.Mesh(option4BoxGeometry, option4BoxMaterial);
// option4BoxMesh.position.set(2.9, 0, 0);
// scene.add(option4BoxMesh);

// // custom box
// const customBoxGeometry = new THREE.BoxGeometry(1.4, 0.8, 0.15);
// const customBoxMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF});
// const customBoxMesh = new THREE.Mesh(customBoxGeometry, customBoxMaterial);
// customBoxMesh.position.set(2.9, -1.2, 0);
// scene.add(customBoxMesh);

// // Raycaster
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// // animate box hover
// const animateBoxHover = (object, scale) => {
//     gsap.to(object.scale, {
//         x: scale,
//         y: scale,
//         z: scale,
//         duration: 0.3,
//         ease: "power2.out"
//     });
// };

// Event listener to track mouse movements
window.addEventListener('mousemove', (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

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
const cameraGroup = new THREE.Group()   
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock() 

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // fade text 
    if (elapsedTime > 3) {
        text.style.opacity = 1 - (elapsedTime - 3) / 3;
    }

    // // update raycaster
    // raycaster.setFromCamera(mouse, camera);


    //  // Check for intersections with the boxes
    //  const intersects = raycaster.intersectObjects([healthBarMesh, volumeBoxMesh, option1BoxMesh, option2BoxMesh, option3BoxMesh, option4BoxMesh, customBoxMesh]);

    //  if (intersects.length > 0) {
    //      const hoveredBox = intersects[0].object;
 
    //      // Animate the hovered box
    //      animateBoxHover(hoveredBox, 1.2);
    //  }
 
    //  // Reset the scale for all other boxes that are not hovered
    //  [healthBarMesh, volumeBoxMesh, option1BoxMesh, option2BoxMesh, option3BoxMesh, option4BoxMesh, customBoxMesh].forEach(box => {
    //      if (!intersects.find(intersect => intersect.object === box)) {
    //          animateBoxHover(box, 1);
    //      }
    //  });

    // Render the scene
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
