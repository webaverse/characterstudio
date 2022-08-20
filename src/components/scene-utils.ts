import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { VRM } from "@pixiv/three-vrm";
import VRMExporter from "../library/VRM/VRMExporter";
import { Canvas } from "@react-three/fiber";

import { combine } from "../library/mesh-combination";

// import VRMExporter from "../library/VRM/vrm-exporter";



let scene = null;
let traits = {};
let model = null;

export const setScene = (newScene: any) => {
  scene = newScene;
}


export const setAvatarModel = (newModel: any) => {
  model = newModel;
}


export const setAvatarTraits = (newTraits: any) => {
  traits = newTraits;
}

export const getTraits = () => traits;

export async function getModelFromScene(format = 'glb') {
  if (format && format === 'glb') {
    const exporter = new GLTFExporter()
    var options = {
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    }
    console.log("Scene is", scene);
    const glb: any = await new Promise((resolve) => exporter.parse(scene, resolve, (error) => console.error("Error getting model", error), options))
    return new Blob([glb], { type: 'model/gltf-binary' })
  } else if (format && format === 'vrm') {
    const exporter = new VRMExporter();
    // is the args for this right?
    const vrm: any = await new Promise((resolve) => exporter.parse(scene, scene, resolve))
    return new Blob([vrm], { type: 'model/gltf-binary' })
  } else {
    return console.error("Invalid format");
  }
}

export async function getObjectValue(target: any, scene: any, value: any) {
  if (target && scene) {
    const object = scene.getObjectByName(target);
    return object.material.color;
  }
}

export async function getMesh(name: any, scene: any) {
  const object = scene.getObjectByName(name);
  return object;
}

export async function setMaterialColor(scene: any, value: any, target: any) {
  if (scene && value) {
    const object = scene.getObjectByName(target);
    const randColor = value;
    const skinShade = new THREE.Color(value);
    object.material[0].color.set(skinShade);
  }
}

export async function loadModel(file: any, type: any) {
  if (type && type === "gltf/glb" && file) {
    const loader = new GLTFLoader();
    return loader.loadAsync(file, (e) => {
      console.log(e.loaded)
    }).then((gltf) => {
      const model = gltf;
      // VRM.from( gltf ).then( ( model ) => {
      return model;
      // });
    });
  }

  if (type && type === "vrm" && file) {
    const loader = new GLTFLoader();
    return loader.loadAsync(file).then((model) => {
      // VRM.from(model).then((vrm) => {
      //   console.log("VRM Model: ", vrm);
      // });
      return model;
    });
  }
}

export async function getMorphValue(key: any, scene: any, target: any) {
  if (key && scene) {
    var mesh = scene.getObjectByName(target);
    const index = mesh.morphTargetDictionary[key];
    if (index !== undefined) {
      return mesh.morphTargetInfluences[index];
    }
  }
}

export async function updateMorphValue(
  key: any,
  value: any,
  scene: any,
  targets: any
) {
  if (key && targets && value) {
    targets.map((target: any) => {
      var mesh = scene.getObjectByName(target);
      const index = mesh.morphTargetDictionary[key];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = value;
      }
    });
  }
}

export async function updatePose(name: any, value: any, axis: any, scene: any) {
  var bone = scene.getObjectByName(name);
  if (bone instanceof THREE.Bone) {
    switch (axis) {
      case "x":
        bone.rotation.x = value;
        break;
      case "y":
        bone.rotation.y = value;
        break;
      case "z":
        bone.rotation.z = value;
        break;
      default:
    }
    return value;
  }
}

export async function download(
  model: any,
  fileName: any,
  format: any,
  atlasSize = 4096
) {
  // We can use the SaveAs() from file-saver, but as I reviewed a few solutions for saving files,
  // this approach is more cross browser/version tested then the other solutions and doesn't require a plugin.
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);
  function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  function saveString(text, filename) {
    save(new Blob([text], { type: "text/plain" }), filename);
  }

  function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], { type: "application/octet-stream" }), filename);
  }
  function saveArrayBufferVRM(vrm, filename) {
    save(new Blob([vrm], { type: "octet/stream" }), filename);
  }

    // Specifying the name of the downloadable model
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`;

  if (format && format === "gltf/glb") {
    const exporter = new GLTFExporter();
    var options = {
      trs: false,
      onlyVisible: false,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    };
    const avatar = await combine({ avatar: model.scene.clone(), atlasSize });

    exporter.parse(
      avatar,
      function (result) {
        if (result instanceof ArrayBuffer) {
          console.log(result);
          saveArrayBuffer(result, `${downloadFileName}.glb`);
        } else {
          var output = JSON.stringify(result, null, 2);
          saveString(output, `${downloadFileName}.gltf`);
        }
      },
      (error) => { console.error("Error parsing", error)},
      options
    );
  } else if (format && format === "obj") {
    const exporter = new OBJExporter();
    saveArrayBuffer(exporter.parse(model.scene), `${downloadFileName}.obj`);
  } else if (format && format === "vrm") {
    const exporter = new VRMExporter();
    const clonedScene = model.scene.clone();

    const avatar = await combine({ avatar: clonedScene, atlasSize });
    
    var scene = model.scene;
    var clonedSecondary;
    scene.traverse((child) =>{
      if(child.name == 'secondary'){
        clonedSecondary = child.clone();
      }
    })

    avatar.add(clonedSecondary);
    exporter.parse(model, avatar, (vrm : ArrayBuffer) => {
      saveArrayBufferVRM(vrm, `${downloadFileName}.vrm`);
    });
  }
}

export function addNonDuplicateAnimationClips(clone, scene) {
  const clipsToAdd = [];

  for (const clip of scene.animations) {
    const index = clone.animations.findIndex((clonedAnimation) => {
      return clonedAnimation.name === clip.name;
    });
    if (index === -1) {
      clipsToAdd.push(clip);
    }
  }

  for (const clip of clipsToAdd) {
    clone.animations.push(clip);
  }
}

export function ensureHubsComponents(userData) {
  if (!userData.gltfExtensions) {
    userData.gltfExtensions = {};
  }
  if (!userData.gltfExtensions.MOZ_hubs_components) {
    userData.gltfExtensions.MOZ_hubs_components = {};
  }
  return userData;
}

export function combineHubsComponents(a, b) {
  ensureHubsComponents(a);
  ensureHubsComponents(b);
  if (a.gltfExtensions.MOZ_hubs_components)
    // TODO: Deep merge
    a.gltfExtensions.MOZ_hubs_components = Object.assign(
      a.gltfExtensions.MOZ_hubs_components,
      b.gltfExtensions.MOZ_hubs_components
    );

  return a;
}

export function cloneSkeleton(skinnedMesh) {
  skinnedMesh.skeleton.pose();

  const boneClones = new Map();

  for (const bone of skinnedMesh.skeleton.bones) {
    const clone = bone.clone(false);
    boneClones.set(bone, clone);
  }

  skinnedMesh.skeleton.bones[0].traverse((o) => {
    if (o.type !== "Bone") return;
    const clone = boneClones.get(o);
    for (const child of o.children) {
      clone.add(boneClones.get(child));
    }
  });
  return new THREE.Skeleton(skinnedMesh.skeleton.bones.map((b) => boneClones.get(b)));
}





export default {
  loadModel,
  updatePose,
  download,
  updateMorphValue,
  getMorphValue,
  getMesh,
  setMaterialColor,
  getObjectValue,
  getModelFromScene,
  getTraits,
  setAvatarTraits,
  setScene,
  setAvatarModel
};
