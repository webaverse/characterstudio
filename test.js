import * as THREE from 'three';
import fs from 'fs';
import { exportAvatar } from './dist/index.js';

import { loadGltf } from 'node-three-gltf';

// step one: import 0.glb from '0.glb' in the current working directory using three.js in node.js
const gltf = await loadGltf('./clonex.glb');

// resize all of the textures in the gltf to 1024x1024
// gltf.scene.traverse(function (node) {
//     if (node.isMesh && node.material && node.material.map) {
//         console.log('resizing texture', node.material.map.image.width, node.material.map.image.height)
//         node.material.map.image.width = 1024;
//         node.material.map.image.height = 1024;
//     }
//     }
// );

const avatar = await exportAvatar(gltf.scene);

// save the avatar to a file (in node)
fs.writeFileSync('avatar.glb', avatar);