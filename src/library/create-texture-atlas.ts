import * as THREE from "three";
import debugConfig from "./debug-config";
import { createCanvas, createImageData } from 'canvas';

function createContext({ width, height }) {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  return context;
}

function getTextureImage(material, textureName) {
  return material[textureName] && material[textureName].image;
}

export const createTextureAtlas = (function () {
  const ATLAS_SIZE_PX = 2048;
  const IMAGE_NAMES = ["diffuse", "normal", "orm"];

  return async function createTextureAtlas({ meshes }) {
    const contexts = Object.fromEntries(
      IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX })])
    );

    if (typeof document !== 'undefined' && debugConfig.debugCanvases) {
      const previous = document.getElementById("debug-canvases");
      if (previous) {
        previous.parentNode.removeChild(previous);
      }

      const domElement = document.createElement("div");
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
      meshes.map((mesh, i) => {
        const min = new THREE.Vector2(i % numTiles, Math.floor(i / numTiles)).multiplyScalar(1 / numTiles);
        const max = new THREE.Vector2(min.x + 1 / numTiles, min.y + 1 / numTiles);
        return [mesh, { min, max }];
      })
    );

    // Draw image for diffuse map
    {
      const context = contexts["diffuse"];
      meshes.forEach((mesh) => {
        const image = getTextureImage(mesh.material, "map");
        console.log('image is', image)
        // image.data is a buffer
        // convert it to an Image
        const { min, max } = uvs.get(mesh) as any;
        if (image) {
          context.globalCompositeOperation = "source-over";
          // create a new Uint8ClampedArray from the image.data Buffer object
          const imageDataBuffer = Uint8ClampedArray.from(image.data);
          context.putImageData(createImageData(imageDataBuffer, image.width, image.height), min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX);
        }

        context.globalCompositeOperation = image ? "multiply" : "source-over";

        const colorClone = (mesh.material[0] ?? mesh.material).color.clone();
        // colorClone.convertLinearToGamma(); // disable cuz it makes bugs....

        context.fillStyle = `#${colorClone.getHexString()}`;
        context.fillRect(min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, tileSize, tileSize);
      });
    }

    // Draw image for normal map
    {
      const context = contexts["normal"];
      context.globalCompositeOperation = "source-over";
      meshes.forEach((mesh) => {
        const image = getTextureImage(mesh.material, "normalMap");
        const { min, max } = uvs.get(mesh) as any;
        if (image) {
          const imageDataBuffer = Uint8ClampedArray.from(image.data);
          context.putImageData(createImageData(imageDataBuffer, image.width, image.height), min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX);
        } else {
          context.fillStyle = "#8080ff"; // default color encodes the vector (0,0,1)
          context.fillRect(min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, tileSize, tileSize);
        }
      });
    }

    // Draw image for orm map(s)
    {
      {
        const context = contexts["orm"];
        meshes.forEach((mesh) => {
          const material = mesh.material;
          const image =
            getTextureImage(material, "aoMap") ||
            getTextureImage(material, "roughnessMap") ||
            getTextureImage(material, "metalnessMap");
          const { min, max } = uvs.get(mesh) as any;
          if (image) {
            context.globalCompositeOperation = "source-over";
            const imageDataBuffer = Uint8ClampedArray.from(image.data);
            context.putImageData(createImageData(imageDataBuffer, image.width, image.height), min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX);
                    }

          context.globalCompositeOperation = image ? "multiply" : "source-over";
          const color = new THREE.Color(material.aoMapIntensity, material.roughness, material.metalness);
          context.fillStyle = `#${color.getHexString()}`;
          context.fillRect(min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, tileSize, tileSize);
        });
      }
    }

    // TODO Draw image for emission maps

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

    return { textures, uvs };
  };
})();
