import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import styled from "styled-components"
import { AnimatePresence, motion } from "framer-motion"
import { useMeasure } from "react-use"
import { Button } from "primereact/button"

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { PMREMGenerator } from "three/src/extras/PMREMGenerator"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { useStore } from "state/store"
import { ENVIRONMENT_DATA } from "dataset/environments"

import Loader from "components/Loader"

import Composer from "./libs/Composer"
import Lights from "./libs/Lights"
import { FitCameraToSelection, ShadowPlane } from "./libs/Helpers"

import fabricGLB from "assets/models/fabric.glb"

const SPACE_SIZE = 10
export default function MaterialViewer() {
  const activeEnvironmentIndex = useStore(state => state.activeEnvironmentIndex)
  const envBackgroundEnabled = useStore(state => state.envBackgroundEnabled)
  const currentOrientation = useStore(state => state.currentOrientation)
  const setCurrentOrientation = useStore(state => state.setCurrentOrientation)
  const currentExposure = useStore(state => state.currentExposure)
  const setCurrentExposure = useStore(state => state.setCurrentExposure)

  const materialViewerVisible = useStore(state => state.materialViewerVisible)
  const setMaterialViewerVisible = useStore(
    state => state.setMaterialViewerVisible,
  )
  const previewMaterialData = useStore(state => state.previewMaterialData)

  const [holderRef, holderMeasure] = useMeasure()
  const [loaderVisible, setLoaderVisible] = useState(false)
  const [glbFile, setGlbFile] = useState(null)

  const canvasHolderRef = useRef(null)
  const gltfLoader = useRef(null)
  const rgbeLoader = useRef(null)
  const textureLoader = useRef(null)
  const scene = useRef(null)
  const camera = useRef(null)
  const cameraController = useRef(null)
  const renderer = useRef(null)
  const renderScene = useRef(null)
  const loadingManager = useRef(null)
  const composer = useRef(null)
  const lights = useRef(null)
  const envMap = useRef(null)
  const rootModel = useRef(null)
  const meshes = useRef([])
  const assets = useRef({ "pattern-color": null })
  const isLoadModel = useRef(false)

  //Init
  useEffect(() => {
    let width = canvasHolderRef.current.offsetWidth
    let height = canvasHolderRef.current.offsetHeight

    let renderRequested = false

    const clock = new THREE.Clock()

    const rayCaster = new THREE.Raycaster()
    const intersects = []

    /**
     * Scene
     */
    scene.current = new THREE.Scene()
    // scene.current.background = new THREE.Color("#131313")
    // scene.current.fog = new THREE.Fog(0xa0a0a0, SPACE_SIZE * 0.9, SPACE_SIZE)

    //Create root model
    rootModel.current = new THREE.Object3D()
    scene.current.add(rootModel.current)

    /**
     * Lights
     */
    lights.current = new Lights()
    scene.current.add(lights.current)

    /**
     * Helper
     */
    // const axisHelper = new THREE.AxesHelper(5)
    // scene.current.add(axisHelper)

    const shadowPlane = new ShadowPlane()
    scene.current.add(shadowPlane)

    /**
     * Camera
     */
    camera.current = new THREE.PerspectiveCamera(
      35,
      width / height,
      0.01,
      SPACE_SIZE * 100,
    )
    camera.current.position.set(-SPACE_SIZE * 0.2, SPACE_SIZE, SPACE_SIZE)
    camera.current.lookAt(0, 0, 0)

    /**
     * Resize & Render
     */
    function resizeRendererToDisplaySize() {
      const canvasWidth = renderer.current.domElement.offsetWidth
      const canvasHeight = renderer.current.domElement.offsetHeight
      const needResize = canvasWidth !== width || canvasHeight !== height
      if (needResize) {
        width = canvasWidth
        height = canvasHeight
        camera.current.aspect = width / height
        camera.current.updateProjectionMatrix()
        renderer.current.setSize(width, height)
        if (composer.current) {
          composer.current.outlineEffect.setSize(width, height)
          composer.current.setSize(width, height)
        }
        requestRenderIfNotRequested()
      }
    }

    function render() {
      renderRequested = false
      resizeRendererToDisplaySize()
      cameraController.current.update()
      renderer.current.render(scene.current, camera.current)
      if (composer.current) {
        composer.current.render(clock.getDelta())
      }
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true
        requestAnimationFrame(render)
      }
    }

    renderScene.current = requestRenderIfNotRequested

    /**
     * Renderer
     */
    renderer.current = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
    })
    renderer.current.setPixelRatio(window.devicePixelRatio)
    renderer.current.setClearColor(0x000000, 0)
    renderer.current.physicallyCorrectLights = true
    renderer.current.toneMapping = THREE.ACESFilmicToneMapping
    renderer.current.outputEncoding = THREE.sRGBEncoding
    renderer.current.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.current.shadowMap.enabled = true
    renderer.current.setSize(width, height, false)

    canvasHolderRef.current.appendChild(renderer.current.domElement)

    //Mouse&Touch event
    function onMouseDown(event) {}
    function onMouseUp(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1,
      )
      rayCaster.setFromCamera(pickedPoint, camera.current)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
      }
    }
    function onMouseMove(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1,
      )

      rayCaster.setFromCamera(pickedPoint, camera.current)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
        document.body.style.cursor = "pointer"
      } else {
        document.body.style.cursor = "default"
      }
    }

    function onTouchStart(event) {}
    function onTouchEnd(event) {
      const pickedPoint = new THREE.Vector2(
        (event.changedTouches[0].pageX / width) * 2 - 1,
        -(event.changedTouches[0].pageY / height) * 2 + 1,
      )
      rayCaster.setFromCamera(pickedPoint, camera.current)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
      }
    }
    function onTouchMove() {}

    renderer.current.domElement.addEventListener("mousedown", onMouseDown)
    renderer.current.domElement.addEventListener("mouseup", onMouseUp)
    renderer.current.domElement.addEventListener("mousemove", onMouseMove)

    renderer.current.domElement.addEventListener("touchstart", onTouchStart)
    renderer.current.domElement.addEventListener("touchend", onTouchEnd)
    renderer.current.domElement.addEventListener("touchmove", onTouchMove)

    /**
     * Camera Controller
     */
    cameraController.current = new OrbitControls(
      camera.current,
      renderer.current.domElement,
    )
    cameraController.current.minAzimuthAngle = -180
    cameraController.current.maxAzimuthAngle = 180
    cameraController.current.dampingFactor = 0.05
    cameraController.current.screenSpacePanning = true
    cameraController.current.minDistance = 0.5
    cameraController.current.maxDistance = 2
    cameraController.current.minZoom = 0.5
    cameraController.current.maxZoom = 2
    cameraController.current.minPolarAngle = 0
    cameraController.current.maxPolarAngle = Math.PI / 2
    cameraController.current.enableDamping = true
    cameraController.current.enableZoom = true
    cameraController.current.enablePan = false

    /**
     * Load Assets
     */
    loadingManager.current = new THREE.LoadingManager()
    loadingManager.current.onStart = (url, itemsLoaded, itemsTotal) => {
      setLoaderVisible(true)
    }
    loadingManager.current.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (!loaderVisible) {
        setLoaderVisible(true)
      }
    }
    loadingManager.current.onLoad = () => {
      //Install composer
      composer.current = new Composer(
        renderer.current,
        scene.current,
        camera.current,
        assets.current,
      )

      //Camera setup
      if (isLoadModel.current) {
        camera.current.position.set(
          SPACE_SIZE * 0.01,
          SPACE_SIZE * 0.5,
          SPACE_SIZE,
        )
        camera.current.lookAt(0, 0, 0)
        FitCameraToSelection(
          camera.current,
          [rootModel.current],
          1.25,
          cameraController.current,
        )
        isLoadModel.current = false
      }

      setLoaderVisible(false)

      requestRenderIfNotRequested()
    }

    //Load outline pattern image
    textureLoader.current = new THREE.TextureLoader(loadingManager.current)

    rgbeLoader.current = new RGBELoader(loadingManager.current)

    gltfLoader.current = new GLTFLoader(loadingManager.current)
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    gltfLoader.current.setDRACOLoader(dracoLoader)

    //Load model
    setGlbFile(fabricGLB)

    /**
     * RenderEvent & Dispose
     */
    cameraController.current.addEventListener(
      "change",
      requestRenderIfNotRequested,
    )
    window.addEventListener("resize", requestRenderIfNotRequested)
    return () => {
      cameraController.current.removeEventListener(
        "change",
        requestRenderIfNotRequested,
      )
      window.removeEventListener("resize", requestRenderIfNotRequested)
      if (canvasHolderRef.current) canvasHolderRef.current.innerHTML = ""
    }
  }, [])

  //Resize
  useEffect(() => {
    if (renderScene.current) {
      renderScene.current()
    }
  }, [holderMeasure])

  //Update model
  useEffect(() => {
    if (!glbFile) {
      return
    }

    isLoadModel.current = true

    //Clear scene
    rootModel.current.children.forEach(node => {
      node.children.forEach(child => {
        child.geometry.dispose()
        child.material.dispose()
        node.remove(child)
      })
      rootModel.current.remove(node)
    })
    rootModel.current.children = []

    //Load model
    gltfLoader.current.load(glbFile, gltf => {
      if (gltf.scene) {
        meshes.current = []
        gltf.scene.traverse(child => {
          if (child.type === "Mesh") {
            child.castShadow = true
            meshes.current.push(child)
          }
        })
        rootModel.current.add(gltf.scene)
      }
    })
  }, [glbFile])

  //Update envmap
  useEffect(() => {
    const envTexture = ENVIRONMENT_DATA[activeEnvironmentIndex].hdr
    const pg = new PMREMGenerator(renderer.current)
    rgbeLoader.current.load(envTexture, texture => {
      texture.rotation = Math.PI
      texture.offset = new THREE.Vector2(0.5, 0)
      texture.needsUpdate = true
      texture.updateMatrix()

      pg.compileEquirectangularShader()
      envMap.current = pg.fromEquirectangular(texture).texture
      scene.current.environment = envMap.current
      scene.current.background = envBackgroundEnabled ? envMap.current : null
      texture.dispose()
      pg.dispose()
    })

    setCurrentOrientation(ENVIRONMENT_DATA[activeEnvironmentIndex].azimuth)
    setCurrentExposure(ENVIRONMENT_DATA[activeEnvironmentIndex].exposure)
  }, [activeEnvironmentIndex])

  useEffect(() => {
    scene.current.background = envBackgroundEnabled ? envMap.current : null
    renderScene.current()
  }, [envBackgroundEnabled])

  //Update env orientation
  useEffect(() => {
    const radius =
      Math.cos(
        THREE.MathUtils.degToRad(
          ENVIRONMENT_DATA[activeEnvironmentIndex].zenith,
        ),
      ) * SPACE_SIZE

    lights.current.sunLight.position.x =
      Math.sin(THREE.MathUtils.degToRad(currentOrientation)) * radius

    lights.current.sunLight.position.z =
      Math.cos(THREE.MathUtils.degToRad(currentOrientation)) * radius

    renderScene.current()
  }, [currentOrientation])

  //Update env exposure
  useEffect(() => {
    if (renderer.current && composer.current) {
      renderer.current.toneMappingExposure = currentExposure
      renderScene.current()
    }
  }, [currentExposure])

  //Set material
  useEffect(() => {
    if (meshes.current.length === 0) {
      // toast.info(`No mesh selected`)
      return
    }

    if (!previewMaterialData) {
      // toast.info(`No material selected`)
      return
    }

    //Set material
    const newMaterial = new THREE.MeshStandardMaterial()
    //Color
    if (previewMaterialData.color === "") {
      newMaterial.color.set(null)
    } else {
      newMaterial.color.set(previewMaterialData.color)
    }

    //Albedo
    if (previewMaterialData.map === "") {
      newMaterial.map = null
    } else {
      const texture =
        typeof previewMaterialData.map === "string"
          ? textureLoader.current.load(previewMaterialData.map)
          : previewMaterialData.map

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }

      newMaterial.map = texture
    }

    //Normal
    if (previewMaterialData.normalMap === "") {
      newMaterial.normalMap = null
    } else {
      const texture =
        typeof previewMaterialData.normalMap === "string"
          ? textureLoader.current.load(previewMaterialData.normalMap)
          : previewMaterialData.normalMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.normalMap = texture

      newMaterial.normalScale = new THREE.Vector2(
        previewMaterialData.normalScale.x,
        previewMaterialData.normalScale.y,
      )
    }

    //Bump
    if (previewMaterialData.bumpMap === "") {
      newMaterial.bumpMap = null
    } else {
      const texture =
        typeof previewMaterialData.bumpMap === "string"
          ? textureLoader.current.load(previewMaterialData.bumpMap)
          : previewMaterialData.bumpMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.bumpMap = texture

      newMaterial.bumpScale = previewMaterialData.bumpScale
    }

    //Displacement
    if (previewMaterialData.displacementMap === "") {
      newMaterial.displacementMap = null
    } else {
      const texture =
        typeof previewMaterialData.displacementMap === "string"
          ? textureLoader.current.load(previewMaterialData.displacementMap)
          : previewMaterialData.displacementMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.displacementMap = texture

      newMaterial.displacementScale = previewMaterialData.displacementScale
      newMaterial.displacementBias = previewMaterialData.displacementBias
    }

    //Roughness
    if (previewMaterialData.roughnessMap === "") {
      newMaterial.roughnessMap = null
    } else {
      const texture =
        typeof previewMaterialData.roughnessMap === "string"
          ? textureLoader.current.load(previewMaterialData.roughnessMap)
          : previewMaterialData.roughnessMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.roughnessMap = texture
    }

    newMaterial.roughness = previewMaterialData.roughness

    //Metalness
    if (previewMaterialData.metalnessMap !== "") {
      newMaterial.metalnessMap = null
    } else {
      const texture =
        typeof previewMaterialData.metalnessMap === "string"
          ? textureLoader.current.load(previewMaterialData.metalnessMap)
          : previewMaterialData.metalnessMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.metalnessMap = texture
    }

    newMaterial.metalness = previewMaterialData.metalness

    //Alpha
    if (previewMaterialData.alphaMap === "") {
      newMaterial.alphaMap = null
    } else {
      const texture =
        typeof previewMaterialData.alphaMap === "string"
          ? textureLoader.current.load(previewMaterialData.alphaMap)
          : previewMaterialData.alphaMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.alphaMap = texture
    }

    newMaterial.opacity = previewMaterialData.opacity

    //AO
    if (previewMaterialData.aoMap === "") {
      newMaterial.aoMap = null
    } else {
      const texture =
        typeof previewMaterialData.aoMap === "string"
          ? textureLoader.current.load(previewMaterialData.aoMap)
          : previewMaterialData.aoMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.aoMap = texture

      newMaterial.aoMapIntensity = previewMaterialData.aoMapIntensity
    }

    //Emissive
    if (previewMaterialData.emissiveMap === "") {
      newMaterial.emissiveMap = null
    } else {
      const texture =
        typeof previewMaterialData.emissiveMap === "string"
          ? textureLoader.current.load(previewMaterialData.emissiveMap)
          : previewMaterialData.emissiveMap

      if (previewMaterialData.repeat) {
        texture.repeat.set(
          previewMaterialData.repeat.x,
          previewMaterialData.repeat.y,
        )
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
      }
      newMaterial.emissiveMap = texture

      newMaterial.emissiveIntensity = previewMaterialData.emissiveIntensity
    }
    newMaterial.emissive.set(previewMaterialData.emissive)

    //Env
    newMaterial.envMapIntensity = previewMaterialData.envMapIntensity

    newMaterial.wireframe = previewMaterialData.wireframe
    newMaterial.transparent = previewMaterialData.transparent
    newMaterial.needsUpdate = true

    //Set material
    meshes.current.forEach(mesh => {
      mesh.material = newMaterial
    })
  }, [previewMaterialData])

  return (
    <AnimatePresence>
      <Container
        initial="hidden"
        animate={materialViewerVisible ? "visible" : "hidden"}
        variants={{
          visible: {
            y: 0,
          },
          hidden: {
            y: "-100%",
          },
        }}
        transition={{
          duration: 0.6,
        }}
      >
        <Holder ref={holderRef}>
          <Loader visible={loaderVisible} />
          <CanvasHolder ref={canvasHolderRef} />
          <CloseButton
            icon="pi pi-times"
            className="p-button-rounded"
            aria-label="Cancel"
            onClick={() => {
              setMaterialViewerVisible(false)
            }}
          />
        </Holder>
      </Container>
    </AnimatePresence>
  )
}

const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
`

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const CanvasHolder = styled.div`
  width: 100%;
  height: 100%;
  canvas {
    width: 100% !important;
    height: 100% !important;
    background-color: #2d2d2d;
  }
`

const CloseButton = styled(Button)`
  position: absolute;
  top: 2em;
  right: 2em;
  z-index: 1;
`
