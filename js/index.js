import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

import { OrbitControls } from "./OrbitControls.js";

import { DRACOLoader } from "./DRACOLoader.js";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const fog = new THREE.Fog("#00000a", 1, 200);
scene.fog = fog;
const loadingBarElement = document.querySelector(".loading-bar");

var loadingManager = new THREE.LoadingManager(
  //loaded
  () => {
    window.setTimeout(() => {
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
      });
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = ``;
    }, 1000);
  },
  //progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);

/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 *
 * overLay
 *
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: {
      value: 1,
    },
  },
  vertexShader: `void main()
      {
        gl_Position =  vec4(position,1.0);
      }
      `,
  fragmentShader: `
      uniform float uAlpha;
      void main()

      {
        gl_FragColor = vec4 (0.0,0.0,0.0,uAlpha);
      }
      `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 * Rendrer
 *
 */

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: canvas,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#00000a", 1);

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 *Cameraas
 *
 */

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 13.3, 90);

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 * Controls
 *
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target = new THREE.Vector3(0, 0, 0);
controls.maxPolarAngle = Math.PI / (2.0 + 0.1);

controls.maxAzimuthAngle = Math.PI / 3;
controls.minAzimuthAngle = -Math.PI / 3;
// this.controls.minDistance = 63.3;
// this.controls.maxDistance = 600;

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 * Resizing updates
 *
 */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 *
 * Loading all the models
 *
 */
const textureLoader = new THREE.TextureLoader(loadingManager); //
var Model = function () {
  var mainbage = textureLoader.load("/models/pharma/tinified/front-last.jpg");
  var bars = textureLoader.load(
    "/models/pharma/tinified/front-last-pharma.jpg"
  );
  var glass = textureLoader.load(
    "/models/pharma/tinified/double_faces_last_pharmacy.jpg"
  );
  var glassandbars = textureLoader.load(
    "/models/pharma/tinified/glass&bars.jpg"
  );
  var Lap = textureLoader.load("/models/pharma/tinified/extenstion.jpg");
  var Lapv2 = textureLoader.load("/models/Lap/laplast3.jpg");

  mainbage.flipY = false;
  bars.flipY = false;
  glass.flipY = false;
  glassandbars.flipY = false;
  Lap.flipY = false;
  Lapv2.flipY = false;

  var mainbagebacked = new THREE.MeshBasicMaterial({ map: mainbage });
  var barsbacked = new THREE.MeshBasicMaterial({ map: bars });
  var glassbacked = new THREE.MeshBasicMaterial({ map: glass });
  var glassandbarss = new THREE.MeshBasicMaterial({ map: glassandbars });
  var Lapmaterial = new THREE.MeshBasicMaterial({ map: Lap });
  var Lapmaterialv2 = new THREE.MeshBasicMaterial({ map: Lapv2 });

  const maingroup = new THREE.Group();
  maingroup.rotation.y = -(Math.PI * 0.5);
  const lapgroup = new THREE.Group();
  lapgroup.position.x = 20;
  lapgroup.position.y = 0.3;

  maingroup.add(lapgroup);
  scene.add(maingroup);

  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader(loadingManager); //loadingManager
  gltfLoader.setDRACOLoader(draco);

  gltfLoader.load("/models/pharma/base.glb", (gltf) => {
    gltf.scene.traverse((child) => {
      child.material = mainbagebacked;
    });
    maingroup.add(gltf.scene);
    gltfLoader.load("/models/pharma/front.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = barsbacked;
      });
      maingroup.add(gltf.scene);
      gltfLoader.load("/models/pharma/left-right-base.glb", (gltf) => {
        gltf.scene.traverse((child) => {
          child.material = glassbacked;
        });
        maingroup.add(gltf.scene);
        gltfLoader.load("/models/pharma/glassandbars.glb", (gltf) => {
          gltf.scene.traverse((child) => {
            child.material = glassandbarss;
          });
          maingroup.add(gltf.scene);
          gltfLoader.load("/models/pharma/extenstion.glb", (gltf) => {
            gltf.scene.traverse((child) => {
              child.material = Lapmaterial;
            });
            maingroup.add(gltf.scene);
            gltfLoader.load("/models/Lap/Lap-last3.glb", (gltf) => {
              gltf.scene.traverse((child) => {
                child.material = Lapmaterialv2;
              });

              lapgroup.add(gltf.scene);
            });
          });
        });
      });
    });
  });
};

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 * All OBjects in the Light Bars
 *
 */
const materialForAllPlanes = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  visible: false,
});

const geoPlan = new THREE.PlaneGeometry(4.13, 0.96);

const boardGeomtry = new THREE.PlaneGeometry(5.5, 1.93);

const boardMaterial = new THREE.MeshBasicMaterial({
  map: textureLoader.load("/img/123123.jpg"),
});
const boardMaterial2 = new THREE.MeshBasicMaterial({
  map: textureLoader.load("/img/1212.jpg"),
});
const boardMaterial3 = new THREE.MeshBasicMaterial({
  map: textureLoader.load("/img/11.jpg"),
});

const plane1 = new THREE.Mesh(geoPlan, materialForAllPlanes);
const plane2 = new THREE.Mesh(geoPlan, materialForAllPlanes);
const plane3 = new THREE.Mesh(geoPlan, materialForAllPlanes);
const plane4 = new THREE.Mesh(geoPlan, materialForAllPlanes);
const board = new THREE.Mesh(boardGeomtry, materialForAllPlanes);
const nextBtn = new THREE.Mesh(geoPlan, materialForAllPlanes);
const prevBtn = new THREE.Mesh(geoPlan, materialForAllPlanes);

scene.add(plane1, plane2, plane3, plane4, board, nextBtn, prevBtn);
plane1.position.set(-20.23, 3.82, 62.43);
plane2.position.set(-20.23, 5.2, 62.43);
plane3.position.set(-20.23, 7.09, 62.43);
plane4.position.set(-20.23, 8.66, 62.43);
board.position.set(0.302, 2.6, 15.42);
nextBtn.position.set(2.68, 1.93, 15.44);
nextBtn.scale.set(0.1, 0.27, 0.3);
prevBtn.position.set(-2.05, 1.93, 15.44);
prevBtn.scale.set(0.1, 0.27, 0.3);

/**.\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 * Ray Caster with planes
 *
 */

const raycaster = new THREE.Raycaster();

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 * mouse
 *
 */
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 *
 * Witness RayCaster With animation Cards with GSAP
 *
//  */

function transition(target, x, y, z) {
  gsap.to(target, {
    x,
    y,
    z,
    duration: 2,
    ease: "power3.inOut",
  });
}

var currentIntersect = null;

const pVector = {
  x: camera.position.x,
  y: camera.position.y,
  z: camera.position.z,
};

const rVector = {
  x: camera.rotation.x,
  y: camera.rotation.y,
  z: camera.rotation.z,
};
var counter = 1;

window.addEventListener("click", () => {
  if (currentIntersect) {
    if (currentIntersect.object === plane1) {
      window.location = "/Landing";
    }
    /////////////////////////////////////////////////////////////////////////////////
    else if (currentIntersect.object === plane2) {
      transition(camera.position, pVector.x, pVector.y, pVector.z);
      transition(camera.rotation, rVector.x, rVector.y, rVector.z);
      gsap.to(camera.position, {
        x: 0,
        y: 3,
        z: 21.5,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
          const v3 = new THREE.Vector3();
          v3.x = 0;
          v3.y = 2.55;
          v3.z = 15.42;
          controls.target = v3;
        },
      });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    else if (currentIntersect.object === plane3) {
      transition(camera.position, pVector.x, pVector.y, pVector.z);
      transition(camera.rotation, rVector.x, rVector.y, rVector.z);
      gsap.to(camera.position, {
        x: 0,
        y: 3,
        z: 21.5,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
          const v3 = new THREE.Vector3();
          v3.x = 0;
          v3.y = 2.55;
          v3.z = 15.42;
          controls.target = v3;
        },
      });
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    else if (currentIntersect.object === plane4) {
      transition(camera.position, pVector.x, pVector.y, pVector.z);
      transition(camera.rotation, rVector.x, rVector.y, rVector.z);
      gsap.to(camera.position, {
        x: 0,
        y: 3,
        z: 21.5,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
          const v3 = new THREE.Vector3();
          v3.x = 0;
          v3.y = 2.55;
          v3.z = 15.42;
          controls.target = v3;
        },
      });
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    else if (currentIntersect.object === nextBtn) {
      if (counter === 1) {
        board.material = boardMaterial;
        counter++;
      } else if (counter === 2) {
        board.material = boardMaterial2;
        counter++;
      } else if (counter === 3) {
        board.material = boardMaterial3;
      }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    else if (currentIntersect.object === prevBtn) {
      if (counter === 1) {
      } else if (counter === 2) {
        board.material = boardMaterial;
        counter = counter - 1;
      } else if (counter === 3) {
        board.material = boardMaterial2;
        counter = counter - 1;
      }
    }
  }
});

/////////////////////////////////////////////////////////////////////////////////////////
/****
 *
 * Arrows transitions
 *
 */

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 *
 *
 * Calling the Animation and the model
 *
 */

// this.settings();

/**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * recusrion to play infinite Excuation
 */
const animation = () => {
  requestAnimationFrame(animation);

  /**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   * Raycaster and array of intersects helps helps in finding who is clicked
   *
  //  */
  raycaster.setFromCamera(mouse, camera);
  const objectToTest = [
    plane1,
    plane2,
    plane3,
    plane4,
    board,
    prevBtn,
    nextBtn,
  ];
  const intersects = raycaster.intersectObjects(objectToTest);
  if (intersects.length) {
    currentIntersect = intersects[0];
  } else {
    currentIntersect = null;
  }

  /**\////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   * Render scene every sub seconde
   */
  renderer.render(scene, camera);

  controls.update();
};

Model();

animation();
