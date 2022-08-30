import { useEffect, useRef } from "react"
import styled from "styled-components"
import { useMeasure } from "react-use"
import { ContextMenu } from "primereact/contextmenu"

import { useStore } from "state/store"
import { ENVIRONMENT_DATA } from "dataset/environments"
import Loader from "components/Loader"

import ThreeEngine from "./libs/ThreeEngine"

export default function Viewer3D({ file }) {
  //Store states
  const sunInfo = useStore(state => state.sunInfo)
  const setSunInfo = useStore(state => state.setSunInfo)
  const firstEmbientInfo = useStore(state => state.firstEmbientInfo)
  const setFirstEmbientInfo = useStore(state => state.setFirstEmbientInfo)
  const secondEmbientInfo = useStore(state => state.secondEmbientInfo)
  const setSecondEmbientInfo = useStore(state => state.setSecondEmbientInfo)

  const activeEnvironmentIndex = useStore(state => state.activeEnvironmentIndex)
  const envBackgroundEnabled = useStore(state => state.envBackgroundEnabled)
  const currentOrientation = useStore(state => state.currentOrientation)
  const setCurrentOrientation = useStore(state => state.setCurrentOrientation)
  const currentExposure = useStore(state => state.currentExposure)
  const setCurrentExposure = useStore(state => state.setCurrentExposure)

  const selectedGroupNodes = useStore(state => state.selectedGroupNodes)

  const setGroupModel = useStore(state => state.setGroupModel)
  const setSelectedGroupNodes = useStore(state => state.setSelectedGroupNodes)

  const loaderVisible = useStore(state => state.loaderVisible)
  const setLoaderVisible = useStore(state => state.setLoaderVisible)

  const threeEngine = useStore(state => state.threeEngine)
  const setThreeEngine = useStore(state => state.setThreeEngine)

  const pressedKey = useStore(state => state.pressedKey)
  const setPressedKey = useStore(state => state.setPressedKey)

  const currentPrintData = useStore(state => state.currentPrintData)

  //Three Engine's Store Interface to only set store state
  const storeInterface = {
    loaderVisible,
    setLoaderVisible,
    setGroupModel,
    setSelectedGroupNodes,
    setPressedKey,
    setCurrentExposure,
    setSunInfo,
    setFirstEmbientInfo,
    setSecondEmbientInfo,
  }

  const [holderRef, holderMeasure] = useMeasure()

  const canvasHolderRef = useRef(null)
  const contextMenuRef = useRef(null)

  //Context menu
  const contextMenuItems = [
    {
      label: "Select",
      icon: "",
      command: () => {
        threeEngine.setGroupNodeByCandidateMesh()
      },
    },
    {
      label: "Unselect all",
      icon: "",
      command: () => {
        setSelectedGroupNodes([])
      },
    },
    {
      separator: true,
    },
    {
      label: "Quit",
      icon: "pi pi-fw pi-power-off",
    },
  ]

  //Initialize
  useEffect(() => {
    //Three engine
    const newThreeEngine = new ThreeEngine(
      canvasHolderRef.current,
      storeInterface,
    )
    setThreeEngine(newThreeEngine)

    return () => {
      if (threeEngine) {
        threeEngine.dispose()
        setThreeEngine(null)
      }
    }
  }, [])

  //Resize
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.requestRenderIfNotRequested()
  }, [threeEngine, holderMeasure])

  //Load model
  useEffect(() => {
    if (!file) {
      return
    }
    if (!threeEngine) {
      return
    }

    threeEngine.loadZipModel(file)
  }, [threeEngine, file])

  //Update envmap
  useEffect(() => {
    if (!threeEngine) {
      return
    }

    threeEngine.updateEnvmap(activeEnvironmentIndex, envBackgroundEnabled)
    setCurrentOrientation(ENVIRONMENT_DATA[activeEnvironmentIndex].azimuth)
    setCurrentExposure(ENVIRONMENT_DATA[activeEnvironmentIndex].exposure)
  }, [threeEngine, activeEnvironmentIndex])

  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.enableEnvmap(envBackgroundEnabled)
  }, [threeEngine, envBackgroundEnabled])

  //Update sun light
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.updateSunLight(sunInfo)
  }, [threeEngine, sunInfo])

  //Update ambient light1
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.updateAmbientLight1(firstEmbientInfo)
  }, [threeEngine, firstEmbientInfo])

  //Update ambient light2
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.updateAmbientLight2(secondEmbientInfo)
  }, [threeEngine, secondEmbientInfo])

  //Update env orientation
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.updateEnvOrientation(activeEnvironmentIndex, currentOrientation)
  }, [threeEngine, activeEnvironmentIndex, currentOrientation])

  //Update env exposure
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.updateEnvExposure(currentExposure)
  }, [threeEngine, currentExposure])

  //Node highlight
  useEffect(() => {
    if (!threeEngine) {
      return
    }
    threeEngine.setHighlightMeshByGroupNode(selectedGroupNodes)
  }, [threeEngine, selectedGroupNodes])

  //Update print
  useEffect(() => {
    if (!threeEngine) {
      return
    }

    if (!currentPrintData) {
      return
    }

    threeEngine.updatePrint(currentPrintData)
  }, [threeEngine, currentPrintData])

  return (
    <Holder ref={holderRef}>
      <Loader visible={loaderVisible} label="Loading a 3D model" />
      <ContextMenu model={contextMenuItems} ref={contextMenuRef} />
      <KeyLabel>{pressedKey}</KeyLabel>
      <CanvasHolder
        ref={canvasHolderRef}
        onContextMenu={e => {
          e.preventDefault()
          if (threeEngine?.candidateMesh) {
            contextMenuRef.current.show(e)
          }
        }}
      />
    </Holder>
  )
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 0;
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

const KeyLabel = styled.p`
  position: absolute;
  bottom: 1em;
  right: 1em;
  z-index: 1;
  font-size: 3em;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #989898;
  pointer-events: none;
  padding: 0;
  margin: 0;
  line-height: 1;
`
