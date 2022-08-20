import * as THREE from "three";
import debugConfig from "./debug-config";
import { createCanvas } from 'canvas';
import { mergeGeometry } from "./merge-geometry";

function createContext({ width, height }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  return context;
}

function getTextureImage(material, textureName) {
  return material[textureName] && material[textureName].image;
}

function lerp(t, min, max, newMin, newMax) {
  const progress = (t - min) / (max - min);
  return newMin + progress * (newMax - newMin);
}

export const createTextureAtlas = async ({ meshes }) => {
  const ATLAS_SIZE_PX = 256;
  const IMAGE_NAMES = ["diffuse", "normal", "orm"];

    const bakeObjects = [];
    // for each mesh in meshes
    meshes.forEach((mesh) => {
      const material = mesh.material;
      // check if bakeObjects as any objects that contain the material property with value of mesh.material
      let bakeObject = bakeObjects.find((bakeObject) => bakeObject.material === material);
      if (!bakeObject) bakeObjects.push({ material, mesh });
      else {
      const { source, dest } = mergeGeometry({ meshes: [bakeObject.mesh, mesh] });

      // console.log('meshes[0]')
      // console.log(meshes[0]);
      // console.log('source')
      // console.log(source);
      // console.log('dest')
      // console.log(dest);
      bakeObject.mesh = mesh.clone();
      bakeObject.mesh.geometry = dest;      
      }
    });

    console.log('bakeObjects')
    console.log(bakeObjects);

    const contexts = Object.fromEntries(
      IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX })])
    );

    if (debugConfig.debugCanvases) {
      const previous = document.getElementById("debug-canvases");
      if (previous) {
        previous.parentNode.removeChild(previous);
      }

      const domElement = document.createElement("div");
      domElement.style.zIndex = "9999";
      domElement.style.position = "absolute";
      domElement.setAttribute("id", "debug-canvases");
      document.body.append(domElement);

      IMAGE_NAMES.map((name) => {
        const title = document.createElement("h1");
        title.innerText = name;
        domElement.append(title);
        domElement.append(contexts[name].canvas);
      });
    }

    const numTiles = Math.floor(Math.sqrt(meshes.length) + 1);
    const tileSize = ATLAS_SIZE_PX / numTiles;

    const uvs = new Map(
      bakeObjects.map((bakeObject, i) => {
        const min = new THREE.Vector2(i % numTiles, Math.floor(i / numTiles)).multiplyScalar(1 / numTiles);
        const max = new THREE.Vector2(min.x + 1 / numTiles, min.y + 1 / numTiles);
        return [bakeObject.mesh, { min, max }];
      })
    );

    const imageToMaterialMapping = {
      diffuse: ["map"],
      normal: ["normalMap"],
      orm: ["ormMap", "aoMap", "roughnessMap", "metalnessMap"]
    }

    const uvBoundsMin = [];
    const uvBoundsMax = [];

    bakeObjects.forEach((bakeObject) => {
      const { min, max } = uvs.get(bakeObject.mesh) as any;
      uvBoundsMax.push(max);
      uvBoundsMin.push(min);
    });

    // find the largest x and y in the Vector2 array uvBoundsMax
    const maxUv = new THREE.Vector2(
      Math.max(...uvBoundsMax.map((uv) => uv.x)),
      Math.max(...uvBoundsMax.map((uv) => uv.y))
    );

    // find the smallest x and y in the Vector2 array uvBoundsMin
    const minUv = new THREE.Vector2(
      Math.min(...uvBoundsMin.map((uv) => uv.x)),
      Math.min(...uvBoundsMin.map((uv) => uv.y))
    );

    const xScaleFactor = 1 / (maxUv.x - minUv.x);
    const yScaleFactor = 1 / (maxUv.y - minUv.y);

    const xTileSize = tileSize * xScaleFactor;
    const yTileSize = tileSize * yScaleFactor;

    bakeObjects.forEach((bakeObject) => {
      const { material, mesh } = bakeObject;
      const { min, max } = uvs.get(mesh) as any;

      IMAGE_NAMES.forEach((name) => {
        const context = contexts[name];
        context.globalCompositeOperation = "source-over";

        // iterate through imageToMaterialMapping[name] and find the first image that is not null
        let image = getTextureImage(material, imageToMaterialMapping[name].find((textureName) => getTextureImage(material, textureName)));
        console.log('name', name, 'image', image);
        if (image) {
          context.drawImage(image, min.x * ATLAS_SIZE_PX * xScaleFactor, min.y * ATLAS_SIZE_PX * yScaleFactor, xTileSize, yTileSize);
        } else {
          // context.fillStyle = name === 'diffuse' ? `#${material.color.clone().getHexString()}` : name === 'normal' ? '#8080ff' : name === 'orm' ?
          //   `#${(new THREE.Color(material.aoMapIntensity, material.roughness, material.metalness)).getHexString()}` : '#7F7F7F';

          // context.fillRect(min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize);
        }
      });

      console.log('mesh is', mesh)

      const geometry = mesh.geometry

      const uv = geometry.attributes.uv;
      if (uv) {
        for (let i = 0; i < uv.array.length; i += 2) {
          uv.array[i] = lerp(uv.array[i], 0, 1, min.x, max.x);
          uv.array[i + 1] = lerp(uv.array[i + 1], 0, 1, min.y, max.y);
        }
      }
      const uv2 = geometry.attributes.uv2;
      if (uv2) {
        for (let i = 0; i < uv2.array.length; i += 2) {
          uv2.array[i] = lerp(uv2.array[i], 0, 1, min.x, max.x);
          uv2.array[i + 1] = lerp(uv2.array[i + 1], 0, 1, min.y, max.y);
        }
      }
      mesh.geometry = geometry;
      const context = contexts['orm'];
      console.log('mesh.geometry is', mesh.geometry)

      // meshBufferGeometry is a THREE.BufferGeometry
      const meshBufferGeometry = mesh.geometry;
      
      console.log('meshBufferGeometry' , meshBufferGeometry)
      // for each triangle in meshBufferGeometry, find the uv coordinates of the triangle's vertices

      // start by iterating over the indices of the triangle vertices
      for (let i = 0; i < meshBufferGeometry.index.length; i += 3) {
        // get the indices of the triangle's vertices
        const index0 = meshBufferGeometry.index[i];
        const index1 = meshBufferGeometry.index[i + 1];
        const index2 = meshBufferGeometry.index[i + 2];
        // get the uv coordinates of the triangle's vertices
        const uv0 = { x: meshBufferGeometry.attributes.uv.array[index0 * 2], y: meshBufferGeometry.attributes.uv.array[index0 * 2 + 1] };
        const uv1 = { x: meshBufferGeometry.attributes.uv.array[index1 * 2], y: meshBufferGeometry.attributes.uv.array[index1 * 2 + 1] };
        const uv2 = { x: meshBufferGeometry.attributes.uv.array[index2 * 2], y: meshBufferGeometry.attributes.uv.array[index2 * 2 + 1] };
        

        context.fillStyle = `#000000`;
        context.beginPath();
        // draw lines between each of the triangle's vertices
        context.moveTo(uv0.x * ATLAS_SIZE_PX * xScaleFactor, uv0.y * ATLAS_SIZE_PX * yScaleFactor);
        context.lineTo(uv1.x * ATLAS_SIZE_PX * xScaleFactor, uv1.y * ATLAS_SIZE_PX * yScaleFactor);
        context.lineTo(uv2.x * ATLAS_SIZE_PX * xScaleFactor, uv2.y * ATLAS_SIZE_PX * yScaleFactor);
        context.lineTo(uv0.x * ATLAS_SIZE_PX * xScaleFactor, uv0.y * ATLAS_SIZE_PX * yScaleFactor);
        context.stroke();
        context.closePath();
      }
    });
  
    // Create textures from canvases
    const textures = Object.fromEntries(
      await Promise.all(
        IMAGE_NAMES.map(async (name) => {
          const texture = new THREE.Texture(contexts[name].canvas)
          // TODO: What is encoding?
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          return [name, texture];
        })
      )
    );

    return { bakeObjects, textures, uvs };
};
