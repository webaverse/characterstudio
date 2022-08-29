import * as THREE from "three"
import { SPACE_SIZE } from "./Constants"

class Lights extends THREE.Group {
  constructor() {
    super()

    this.name = "LightGroup"

    const light1 = new THREE.DirectionalLight(0xffe7df, 4)
    light1.position.set(SPACE_SIZE, SPACE_SIZE, SPACE_SIZE)
    light1.castShadow = false
    light1.target.position.set(0, 0, 0)
    this.add(light1)
    this.ambientLight1 = light1

    const light2 = new THREE.DirectionalLight(0xffe7df, 4)
    light2.position.set(-SPACE_SIZE, -SPACE_SIZE, -SPACE_SIZE)
    light2.castShadow = false
    light2.target.position.set(0, 0, 0)
    this.add(light2)
    this.ambientLight2 = light2

    //Sun
    const sunLight = new THREE.DirectionalLight(0x8e867c, 6)
    sunLight.position.set(0, SPACE_SIZE, 0)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 512
    sunLight.shadow.mapSize.height = 512
    sunLight.shadow.bias = 0.001
    sunLight.shadow.blurSamples = 16
    sunLight.shadow.camera.near = 0.01
    sunLight.shadow.camera.far = SPACE_SIZE * 2
    sunLight.target.position.set(0, 0, 0)
    this.add(sunLight)
    this.sunLight = sunLight

    // const cameraHelper = new THREE.CameraHelper(sunLight.shadow.camera)
    // this.add(cameraHelper)

    // const lightHelper = new THREE.DirectionalLightHelper(sunLight)
    // this.add(lightHelper)
  }
}

export default Lights
