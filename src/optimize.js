import * as THREE from 'three';
import fs from 'fs';
import {NodeIO, Scene} from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import {exit} from 'process';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { dedup,reorder, quantize, prune, weld, simplify, meshopt } from '@gltf-transform/functions';

await MeshoptEncoder.ready;

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
let document;

if (process.argv.length <= 2 || process.argv[2] === "-h") {
    console.log(`
parameters :
    command [space separated LOD file path (order not important)]
    
`)
    exit();
}

    document = await io.read(inputPath);

    await document.transform(
        reorder({encoder: MeshoptEncoder, level: 'medium'}),
        dedup(),
        prune(),
        // weld({ tolerance: 0.001 }),
        // meshopt()
      );

      await io.write(outputPath, document);

