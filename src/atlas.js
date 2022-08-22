import * as THREE from 'three';

import { GLTFExporter } from './library/GLTFExporter.js';

import fs from 'fs';
import { combine } from './library/mesh-combination.js';

import { loadGltf } from 'node-three-gltf';

import { Blob, FileReader } from 'vblob';
global.THREE = THREE;
global.window = (global);
(global).Blob = Blob; // working
(global).FileReader = FileReader;

const atlasSize = 4096;

const inputPath = process.argv[2] ?? './public/cowboy.glb';
const outputPath = process.argv[3] ?? './output.glb';


export default (async () => {

    const exporter = new GLTFExporter();

    const model = await loadGltf(inputPath);

    const combinedAvatar = await combine({ avatar: model.scene, atlasSize });
    console.log('combinedAvatar');
    exporter.parse(combinedAvatar, (gltf) => { console.log('writing gltf'); console.log('gltf is', gltf); try { fs.writeFileSync(outputPath, Buffer.from(gltf)); } catch (error) { console.log('error', error) } console.log('done!')}, { binary: true, animations: combinedAvatar.animations });
})();