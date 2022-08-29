import * as THREE from "three"
import { SPACE_SIZE } from "./Constants"

class ShadowPlane extends THREE.Mesh {
  constructor() {
    super()

    this.name = "GroundMesh"
    this.geometry = new THREE.PlaneGeometry(SPACE_SIZE, SPACE_SIZE)
    this.geometry.rotateX(-Math.PI / 2)
    this.material = new THREE.ShadowMaterial()
    this.material.opacity = 0.6

    this.position.y = 0
    this.receiveShadow = true
  }
}

function FitCameraToSelection(camera, objects, offset, controls) {
  offset = offset || 1.25

  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  const box = new THREE.Box3()

  for (const object of objects) {
    box.expandByObject(object)
  }

  box.getCenter(center)

  box.getSize(size)

  const maxSize = Math.max(size.x, size.y, size.z)
  const fitHeightDistance =
    maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360))
  const fitWidthDistance = fitHeightDistance / camera.aspect
  const distance = offset * Math.max(fitHeightDistance, fitWidthDistance)

  const direction = controls.target
    .clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance)

  // controls.maxDistance = distance * 10;
  controls.target.copy(center)

  camera.near = distance / 100
  camera.far = distance * 100
  camera.updateProjectionMatrix()

  camera.position.copy(controls.target.clone().sub(direction))

  controls.update()

  return box
}

export { ShadowPlane, FitCameraToSelection }
