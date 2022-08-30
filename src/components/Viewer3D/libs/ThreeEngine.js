import { nanoid } from "nanoid"
import {
  ACESFilmicToneMapping,
  AxesHelper,
  Clock,
  Color,
  Fog,
  ImageLoader,
  LoadingManager,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  sRGBEncoding,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  BoxBufferGeometry,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { strFromU8, unzipSync } from "three/examples/jsm/libs/fflate.module"

import { ENVIRONMENT_DATA } from "dataset/environments"
import Lights from "./Lights"
import { FitCameraToSelection, ShadowPlane } from "./Helpers"
import Composer from "./Composer"
import { MESH_HIGHLIGHT_COLOR, SPACE_SIZE } from "./Constants"
import LoadFileAsBlob from "utils/LoadFileAsBlob"

export default class ThreeEngine {
  /**
   * @param {HTMLDivElement} canvasHolder
   * @param {Object} storeInterface
   */
  constructor(canvasHolder, storeInterface) {
    this.canvasHolder = canvasHolder
    this.storeInterface = storeInterface

    this.canvasWidth = canvasHolder.offsetWidth
    this.canvasHeight = canvasHolder.offsetHeight
    this.renderRequested = false
    this.clock = new Clock()
    this.rayCaster = new Raycaster()
    this.envMap = null
    this.meshes = []
    this.pickedUV = new Vector2()
    this.candidateMesh = null
    this.selectedMeshes = []
    this.assets = {
      "pattern-color": null,
    }
    this.mouseDownPosition = new Vector2()
    this.mouseUpPosition = new Vector2()
    this.isShiftPressed = false

    //Loading manager
    this.loadingManager = new LoadingManager()
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.storeInterface.setLoaderVisible(true)
    }
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (!this.storeInterface.loaderVisible) {
        this.storeInterface.setLoaderVisible(true)
      }
    }
    this.loadingManager.onLoad = () => {
      this.setupComposer()

      setTimeout(() => {
        this.requestRenderIfNotRequested()
        this.storeInterface.setLoaderVisible(false)
      }, [1500])
    }

    /////////////////////////////////////////////////////////////////////////////
    //Scene
    this.scene = new Scene()
    // this.scene.background = new Color("#131313")
    // this.scene.fog = new Fog(0xa0a0a0, SPACE_SIZE * 0.9, SPACE_SIZE)

    /////////////////////////////////////////////////////////////////////////////
    //Root model
    this.rootModel = new Object3D()
    this.scene.add(this.rootModel)

    /////////////////////////////////////////////////////////////////////////////
    //Lights
    this.lights = new Lights()
    this.scene.add(this.lights)

    /////////////////////////////////////////////////////////////////////////////
    //Primitives
    this.unitBox = new Mesh(
      new BoxBufferGeometry(1, 1, 1),
      new MeshStandardMaterial({ color: 0xffffff }),
    )
    this.unitBox.visible = false
    this.scene.add(this.unitBox)

    /////////////////////////////////////////////////////////////////////////////
    //Helpers
    // this.axesHelper = new AxesHelper(5)
    // this.scene.add(this.axesHelper)

    this.shadowPlane = new ShadowPlane()
    this.scene.add(this.shadowPlane)

    /////////////////////////////////////////////////////////////////////////////
    //Camera
    this.camera = new PerspectiveCamera(
      35,
      this.canvasWidth / this.canvasHeight,
      0.01,
      SPACE_SIZE * 100,
    )
    this.camera.position.set(-SPACE_SIZE * 0.2, SPACE_SIZE, SPACE_SIZE)
    this.camera.lookAt(0, 0, 0)

    /////////////////////////////////////////////////////////////////////////////
    //Renderer
    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.physicallyCorrectLights = true
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.shadowMap.enabled = true
    this.renderer.setSize(this.canvasWidth, this.canvasHeight, false)
    this.canvasHolder.appendChild(this.renderer.domElement)
    this.renderer.domElement.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this),
    )
    this.renderer.domElement.addEventListener(
      "mouseup",
      this.onMouseUp.bind(this),
    )
    this.renderer.domElement.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
    )
    window.addEventListener("keydown", this.onKeyDown.bind(this))
    window.addEventListener("keyup", this.onKeyUp.bind(this))
    window.addEventListener(
      "resize",
      this.requestRenderIfNotRequested.bind(this),
    )

    /////////////////////////////////////////////////////////////////////////////
    //Camera Controller
    this.cameraController = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    )
    this.cameraController.minAzimuthAngle = -180
    this.cameraController.maxAzimuthAngle = 180
    this.cameraController.dampingFactor = 0.05
    this.cameraController.enableDamping = false
    this.cameraController.screenSpacePanning = true
    // this.cameraController.minDistance = 1
    // this.cameraController.maxDistance = 500
    // this.cameraController.minZoom = 1
    // this.cameraController.maxZoom = 500
    this.cameraController.minPolarAngle = 1
    this.cameraController.maxPolarAngle = Math.PI / 1.5
    this.cameraController.enableDamping = true
    this.cameraController.enableZoom = true
    // this.cameraController.enablePan = false
    this.cameraController.addEventListener(
      "change",
      this.requestRenderIfNotRequested.bind(this),
    )

    /////////////////////////////////////////////////////////////////////////////
    //Load assets
    //Load outline pattern image
    this.textureLoader = new TextureLoader(this.loadingManager)
    this.textureLoader.load("/textures/pattern.png", pattern => {
      this.assets["pattern-color"] = pattern
    })
    this.rgbeLoader = new RGBELoader(this.loadingManager)
    this.objLoader = new OBJLoader(this.loadingManager)
    this.mtlLoader = new MTLLoader(this.loadingManager)
    this.fbxLoader = new FBXLoader(this.loadingManager)
    this.gltfLoader = new GLTFLoader(this.loadingManager)
    this.imageLoader = new ImageLoader(this.loadingManager)
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    this.gltfLoader.setDRACOLoader(dracoLoader)
  }

  dispose() {
    this.renderer.dispose()
    this.cameraController.dispose()
    this.assets = {}
    this.rootModel.children = []
    this.selectedMeshes = []

    this.cameraController.removeEventListener(
      "change",
      this.requestRenderIfNotRequested.bind(this),
    )
    window.removeEventListener("keydown", this.onKeyDown.bind(this))
    window.removeEventListener("keyup", this.onKeyUp.bind(this))
    window.removeEventListener(
      "resize",
      this.requestRenderIfNotRequested.bind(this),
    )
    this.canvasHolder.removeChild(this.renderer.domElement)
    this.canvasHolder.innerHTML = ""
  }

  //Install composer
  setupComposer() {
    this.composer = new Composer(
      this.renderer,
      this.scene,
      this.camera,
      this.assets,
    )
    this.composer.outlineEffect.selection.set([this.unitBox])
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseDown(event) {
    const pickedPoint = new Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    )
    this.mouseDownPosition.copy(pickedPoint)
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseUp(event) {
    const pickedPoint = new Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    )
    this.mouseUpPosition.copy(pickedPoint)

    this.rayCaster.setFromCamera(pickedPoint, this.camera)
    let pickedObjs = this.rayCaster.intersectObjects(this.meshes)
    if (pickedObjs.length > 0) {
      if (pickedPoint.distanceTo(this.mouseDownPosition) < 0.01) {
        if (event.which === 1) {
          //Left click
          this.setGroupNodeByPickedMesh(pickedObjs[0].object)
        }
      }
    }
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseMove(event) {
    const pickedPoint = new Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    )

    this.rayCaster.setFromCamera(pickedPoint, this.camera)
    const pickedObjs = this.rayCaster.intersectObjects(this.meshes)
    if (pickedObjs.length > 0) {
      this.pickedUV.copy(pickedObjs[0].uv)
      this.setCandidateMesh(pickedObjs[0].object)
    } else {
      this.setCandidateMesh(null)
    }
  }

  /**
   * Event handler for key down event
   * @param {Object} event
   */
  onKeyDown(event) {
    this.storeInterface.setPressedKey(event.key)

    if (event.key === "Shift") {
      this.isShiftPressed = true
    }
  }

  /**
   * Event handler for key up event
   * @param {Object} event
   */
  onKeyUp(event) {
    this.storeInterface.setPressedKey("")

    if (event.key === "Shift") {
      this.isShiftPressed = false
    }
  }

  resizeRendererToDisplaySize() {
    const canvasWidth = this.renderer.domElement.offsetWidth
    const canvasHeight = this.renderer.domElement.offsetHeight
    const needResize =
      canvasWidth !== this.canvasWidth || canvasHeight !== this.canvasHeight
    if (needResize) {
      this.canvasWidth = canvasWidth
      this.canvasHeight = canvasHeight
      this.camera.aspect = this.canvasWidth / this.canvasHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.canvasWidth, this.canvasHeight)
      if (this.composer) {
        this.composer.outlineEffect.setSize(this.canvasWidth, this.canvasHeight)
        this.composer.setSize(this.canvasWidth, this.canvasHeight)
      }
      this.requestRenderIfNotRequested()
    }
  }

  render() {
    this.renderRequested = false
    this.resizeRendererToDisplaySize()
    this.cameraController.update()
    this.renderer.render(this.scene, this.camera)
    if (this.composer) {
      this.composer.render(this.clock.getDelta())
    }
  }

  requestRenderIfNotRequested() {
    if (!this.renderRequested) {
      this.renderRequested = true
      requestAnimationFrame(this.render.bind(this))
    }
  }

  clearScene() {
    this.rootModel.children.forEach(node => {
      node.children.forEach(child => {
        child?.geometry?.dispose()
        child?.material?.dispose()
        node.remove(child)
      })
      this.rootModel.remove(node)
    })
    this.rootModel.children = []
  }

  /**
   * Zip file
   * @param {Uint8Array} file
   */
  loadZipModel(file) {
    //Clear scene
    this.clearScene()

    //Load zip file
    const zip = unzipSync(file)
    for (const path in zip) {
      const file = zip[path]

      this.loadingManager.setURLModifier(function (url) {
        const file = zip[url]
        if (file) {
          const blob = new Blob([file.buffer], {
            type: "application/octet-stream",
          })
          return URL.createObjectURL(blob)
        }
        return url
      })

      const extension = path.split(".").pop().toLowerCase()

      switch (extension) {
        case "obj": {
          let mtlFile = null
          for (const pp in zip) {
            const f = zip[pp]
            const ext = pp.split(".").pop().toLowerCase()
            if (ext === "mtl") {
              mtlFile = f
            }
          }

          const materials = this.mtlLoader.parse(strFromU8(mtlFile))

          const object = this.objLoader
            .setMaterials(materials)
            .parse(strFromU8(file))

          this.loadScene(object)
          break
        }
        case "fbx": {
          const self = this
          const scene = this.fbxLoader.parse(file.buffer)
          this.loadScene(scene)
          break
        }
        case "glb": {
          const self = this
          this.gltfLoader.parse(file.buffer, "", function (result) {
            const scene = result.scene
            if (scene) {
              scene.userData.asset = result.asset
              self.loadScene(scene)
            }
          })
          break
        }
        case "gltf": {
          const self = this
          this.gltfLoader.parse(strFromU8(file), "", function (result) {
            const scene = result.scene
            if (scene) {
              scene.userData.asset = result.asset
              self.loadScene(scene)
            }
          })
          break
        }
      }
    }
  }

  /**
   * Change material of mesh to MeshStandardMaterial
   * @param {Mesh} mesh
   */
  changeMaterial(mesh) {
    switch (mesh.material.type) {
      case "MeshPhongMaterial":
        const material = new MeshStandardMaterial({
          name: mesh.material.name,
          color: mesh.material.color,
          map: mesh.material.map,
          bumpMap: mesh.material.bumpMap,
          userData: mesh.material.userData,
        })
        mesh.material = material
        break

      default:
        break
    }
  }

  /**
   * @param {*} scene
   */
  loadScene(scene) {
    //Parse the scene
    const matList = []
    this.meshes = []
    scene.traverse(child => {
      if (child.type === "Mesh") {
        const treeId = nanoid(4)
        child.userData.treeId = treeId
        child.material.userData.oldColor = child.material.color.getHex()
        child.castShadow = true

        let idx = matList.findIndex(mat => mat.label === child.material.name)

        this.changeMaterial(child)

        //Compare of material props
        if (idx === -1) {
          for (let i = 0; i < matList.length; i++) {
            let isSameMaterial = true
            const m = matList[i].data

            for (let j = 0; j < Object.keys(m).length; j++) {
              const key = Object.keys(m)[j]

              if (
                key === "uuid" ||
                key === "name" ||
                key === "userData" ||
                key === "version" ||
                key === "defines" ||
                key === "_alphaTest"
              ) {
                continue
              }

              if (typeof m[key] === "object" && m[key] !== null) {
                for (let k = 0; k < Object.keys(m[key]).length; k++) {
                  const key2 = Object.keys(m[key])[k]
                  if (m[key][key2] !== child.material[key]?.[key2]) {
                    isSameMaterial = false
                    break
                  }
                }
              } else {
                if (m[key] !== child.material[key]) {
                  isSameMaterial = false
                  break
                }
              }
            }

            if (isSameMaterial) {
              if (i === matList.length - 1) {
                idx = i
              }
            }
          }
        }

        //Create new material
        if (idx === -1) {
          matList.push({
            key: nanoid(4),
            label: child.material.name,
            data: child.material,
            icon: "pi pi-fw pi-folder",
            children: [
              {
                key: treeId,
                label: child.name,
                data: child,
                icon: "pi pi-fw pi-file",
              },
            ],
          })
        } else {
          matList[idx].children.push({
            key: treeId,
            label: child.name,
            data: child,
            icon: "pi pi-fw pi-file",
          })
        }

        this.meshes.push(child)
      }
    })

    this.storeInterface.setGroupModel(matList)
    this.rootModel.add(scene)

    //Set camera
    this.fitCameraAndShadow()

    //Render scene
    this.requestRenderIfNotRequested()
  }

  /**
   * Fit camera and shadowPlane to model
   */
  fitCameraAndShadow() {
    //Reset camera
    this.camera.position.set(SPACE_SIZE * 0.01, SPACE_SIZE * 0.5, SPACE_SIZE)
    this.camera.lookAt(0, 0, 0)

    //Fit camera to model
    const box = FitCameraToSelection(
      this.camera,
      [this.rootModel],
      1.25,
      this.cameraController,
    )

    //Fit shadowPlane to model
    this.shadowPlane.position.y = box.min.y - 0.1
  }

  /**
   * @param {*} info
   */
  updateSunLight(info) {
    this.lights.sunLight.visible = info.enabled
    const color = new Color(info.color)
    this.lights.sunLight.color.set(color)
    this.lights.sunLight.intensity = info.intensity
    this.requestRenderIfNotRequested()
  }

  /**
   * @param {*} info
   */
  updateAmbientLight1(info) {
    this.lights.ambientLight1.visible = info.enabled
    const color = new Color(info.color)
    this.lights.ambientLight1.color.set(color)
    this.lights.ambientLight1.intensity = info.intensity
    this.requestRenderIfNotRequested()
  }

  /**
   * @param {*} info
   */
  updateAmbientLight2(info) {
    this.lights.ambientLight2.visible = info.enabled
    const color = new Color(info.color)
    this.lights.ambientLight2.color.set(color)
    this.lights.ambientLight2.intensity = info.intensity
    this.requestRenderIfNotRequested()
  }

  /**
   * @param {Number} index
   * @param {Boolean} enabled
   */
  updateEnvmap(index, enabled) {
    const envTexture = ENVIRONMENT_DATA[index].hdr
    const pg = new PMREMGenerator(this.renderer)
    this.rgbeLoader.load(envTexture, texture => {
      texture.rotation = Math.PI
      texture.offset = new Vector2(0.5, 0)
      texture.needsUpdate = true
      texture.updateMatrix()

      pg.compileEquirectangularShader()
      this.envMap = pg.fromEquirectangular(texture).texture
      this.scene.environment = this.envMap
      this.scene.background = enabled ? this.envMap : null
      texture.dispose()
      pg.dispose()
    })
  }

  /**
   * @param {Boolean} enabled
   */
  enableEnvmap(enabled) {
    this.scene.background = enabled ? this.envMap : null
    this.requestRenderIfNotRequested()
  }

  updateEnvOrientation(index, orientation) {
    const radius =
      Math.cos(MathUtils.degToRad(ENVIRONMENT_DATA[index].zenith)) * SPACE_SIZE

    this.lights.sunLight.position.x =
      Math.sin(MathUtils.degToRad(orientation)) * radius

    this.lights.sunLight.position.z =
      Math.cos(MathUtils.degToRad(orientation)) * radius

    this.requestRenderIfNotRequested()
  }

  /**
   * @param {Number} brightness
   */
  updateEnvExposure(brightness) {
    if (this.renderer && this.composer) {
      this.renderer.toneMappingExposure = brightness
      this.requestRenderIfNotRequested()
    }
  }

  /**
   * @param {Mesh} mesh
   */
  setCandidateMesh(mesh) {
    // //Reset color
    // if (this.candidateMesh) {
    //   const color = new Color(this.candidateMesh.material.userData.oldColor)
    //   this.candidateMesh.material.color.set(color)
    // }

    // //Set color
    // if (mesh) {
    //   const color = new Color(MESH_HIGHLIGHT_COLOR)
    //   mesh.material.color.set(color)
    // }

    //Update candidate mesh
    this.candidateMesh = mesh

    this.requestRenderIfNotRequested()
  }

  /**
   * @param {Array} selectedGroupNodes
   */
  setHighlightMeshByGroupNode(selectedGroupNodes) {
    if (!selectedGroupNodes || this.meshes.length === 0 || !this.composer) {
      return
    }

    // /**
    //  * Highlight by Color
    //  */
    // //Reset color
    // this.meshes.forEach(mesh => {
    //   mesh.material.color.setHex(mesh.material.userData.oldColor)
    // })

    // //Highlight selected nodes
    // Object.keys(selectedGroupNodes).forEach(key => {
    //   const mesh = this.meshes.find(mesh => mesh.userData.treeId === key)
    //   if (mesh) {
    //     mesh.material.color.setHex(0xaaaa00)
    //   }
    // })

    /**
     * Highlight by Outline
     */
    const newSelectedMeshes = []
    Object.keys(selectedGroupNodes).forEach(key => {
      const mesh = this.meshes.find(mesh => mesh.userData.treeId === key)
      if (mesh) {
        newSelectedMeshes.push(mesh)
      }
    })

    const outlineMeshes = newSelectedMeshes.concat(this.unitBox)
    this.composer.outlineEffect.selection.set(outlineMeshes)

    /**
     * Highlight by Opacity
     */
    if (newSelectedMeshes.length === 0) {
      this.meshes.forEach(mesh => {
        mesh.material.transparent = false
        mesh.material.opacity = 1
        mesh.needsUpdate = true
      })
    } else {
      this.meshes.forEach(mesh => {
        mesh.material.transparent = true
        mesh.material.opacity = 0.8
        mesh.needsUpdate = true
      })
    }
    Object.keys(selectedGroupNodes).forEach(key => {
      const mesh = this.meshes.find(mesh => mesh.userData.treeId === key)
      if (mesh) {
        mesh.material.transparent = false
        mesh.material.opacity = 1
        mesh.needsUpdate = true
      }
    })

    this.selectedMeshes = newSelectedMeshes

    this.requestRenderIfNotRequested()
  }

  /**
   * @param {Object} materialData
   */
  setMaterialToSelectedMeshes(materialData) {
    if (this.selectedMeshes.length === 0) {
      return
    }

    if (!materialData) {
      return
    }

    //Set material
    const newMaterial = new MeshStandardMaterial()
    //Color
    if (materialData.color === "") {
      newMaterial.color.set(null)
    } else {
      newMaterial.color.set(materialData.color)
    }

    //Albedo
    if (materialData.map === "") {
      newMaterial.map = null
    } else {
      const texture =
        typeof materialData.map === "string"
          ? this.textureLoader.load(materialData.map)
          : materialData.map

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }

      newMaterial.map = texture
    }

    //Normal
    if (materialData.normalMap === "") {
      newMaterial.normalMap = null
    } else {
      const texture =
        typeof materialData.normalMap === "string"
          ? this.textureLoader.load(materialData.normalMap)
          : materialData.normalMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.normalMap = texture

      newMaterial.normalScale = new Vector2(
        materialData.normalScale.x,
        materialData.normalScale.y,
      )
    }

    //Bump
    if (materialData.bumpMap === "") {
      newMaterial.bumpMap = null
    } else {
      const texture =
        typeof materialData.bumpMap === "string"
          ? this.textureLoader.load(materialData.bumpMap)
          : materialData.bumpMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.bumpMap = texture

      newMaterial.bumpScale = materialData.bumpScale
    }

    //Displacement
    if (materialData.displacementMap === "") {
      newMaterial.displacementMap = null
    } else {
      const texture =
        typeof materialData.displacementMap === "string"
          ? this.textureLoader.load(materialData.displacementMap)
          : materialData.displacementMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.displacementMap = texture

      newMaterial.displacementScale = materialData.displacementScale
      newMaterial.displacementBias = materialData.displacementBias
    }

    //Roughness
    if (materialData.roughnessMap === "") {
      newMaterial.roughnessMap = null
    } else {
      const texture =
        typeof materialData.roughnessMap === "string"
          ? this.textureLoader.load(materialData.roughnessMap)
          : materialData.roughnessMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.roughnessMap = texture
    }

    newMaterial.roughness = materialData.roughness

    //Metalness
    if (materialData.metalnessMap !== "") {
      newMaterial.metalnessMap = null
    } else {
      const texture =
        typeof materialData.metalnessMap === "string"
          ? this.textureLoader.load(materialData.metalnessMap)
          : materialData.metalnessMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.metalnessMap = texture
    }

    newMaterial.metalness = materialData.metalness

    //Alpha
    if (materialData.alphaMap === "") {
      newMaterial.alphaMap = null
    } else {
      const texture =
        typeof materialData.alphaMap === "string"
          ? this.textureLoader.load(materialData.alphaMap)
          : materialData.alphaMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.alphaMap = texture
    }

    newMaterial.opacity = materialData.opacity

    //AO
    if (materialData.aoMap === "") {
      newMaterial.aoMap = null
    } else {
      const texture =
        typeof materialData.aoMap === "string"
          ? this.textureLoader.load(materialData.aoMap)
          : materialData.aoMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.aoMap = texture

      newMaterial.aoMapIntensity = materialData.aoMapIntensity
    }

    //Emissive
    if (materialData.emissiveMap === "") {
      newMaterial.emissiveMap = null
    } else {
      const texture =
        typeof materialData.emissiveMap === "string"
          ? this.textureLoader.load(materialData.emissiveMap)
          : materialData.emissiveMap

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
      newMaterial.emissiveMap = texture

      newMaterial.emissiveIntensity = materialData.emissiveIntensity
    }
    newMaterial.emissive.set(materialData.emissive)

    //Env
    newMaterial.envMapIntensity = materialData.envMapIntensity

    newMaterial.wireframe = materialData.wireframe
    newMaterial.transparent = materialData.transparent
    newMaterial.needsUpdate = true

    //Set material
    this.selectedMeshes.forEach(mesh => {
      mesh.material = newMaterial.clone()
    })

    //Remove outline effect because of the overlap issue
    this.composer.outlineEffect.selection.set([this.unitBox])

    this.requestRenderIfNotRequested()
  }

  /**
   * @param {String} color: ;
   */
  setColorToSelectedMeshes(color) {
    this.selectedMeshes.forEach(mesh => {
      mesh.material.color.set(color)
      mesh.material.map = null
    })

    //Remove outline effect because of the overlap issue
    this.composer.outlineEffect.selection.set([this.unitBox])

    this.requestRenderIfNotRequested()
  }

  /**
   * @param {Mesh} mesh
   */
  setGroupNodeByPickedMesh(mesh) {
    const meshes = [mesh]

    if (this.isShiftPressed) {
      meshes.push(...this.selectedMeshes)
    }

    const groupNode = {}
    meshes.forEach(mesh => {
      const key = mesh.userData.treeId
      groupNode[key] = { checked: true, partialChecked: false }
    })

    this.storeInterface.setSelectedGroupNodes(groupNode)
  }

  setGroupNodeByCandidateMesh() {
    const key = this.candidateMesh.userData.treeId
    const groupNode = {}
    groupNode[key] = { checked: true, partialChecked: false }

    this.storeInterface.setSelectedGroupNodes(groupNode)
  }

  /**
   * @param {Object} data
   * @param {Function} callback
   */
  insertPrint(data, callback) {
    if (this.selectedMeshes.length === 0) {
      callback(false)
      return
    }

    LoadFileAsBlob(data.map, blob => {
      this.textureLoader.load(blob, texture => {
        texture.userData = data

        texture.offset.set(data.offset.x, data.offset.y)
        texture.repeat.set(data.repeat.x, data.repeat.y)
        texture.wrapS = texture.wrapT = RepeatWrapping
        texture.rotation = MathUtils.degToRad(data.rotation)

        texture.needsUpdate = true

        this.selectedMeshes.forEach(mesh => {
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        })

        callback(true)

        //Remove outline effect because of the overlap issue
        this.composer.outlineEffect.selection.set([this.unitBox])

        this.requestRenderIfNotRequested()
      })
    })
  }

  /**
   * @param {Object} data
   */
  updatePrint(data) {
    this.meshes.forEach(mesh => {
      if (mesh.material.map) {
        if (mesh.material.map.userData.code === data.code) {
          mesh.material.map.userData = data
          mesh.material.map.offset.set(data.offset.x, data.offset.y)
          mesh.material.map.repeat.set(data.repeat.x, data.repeat.y)
          mesh.material.map.wrapS = mesh.material.map.wrapT = RepeatWrapping
          mesh.material.map.rotation = MathUtils.degToRad(data.rotation)
          mesh.material.map.needsUpdate = true
          mesh.material.needsUpdate = true
        }
      }
    })

    this.requestRenderIfNotRequested()
  }
}
