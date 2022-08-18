import { createTheme, ThemeProvider } from "@mui/material"
import { VRM, VRMSchema } from "@pixiv/three-vrm"
import React, { Suspense, useState, useEffect, Fragment } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import DownloadCharacter from "./Download"
import LoadingOverlayCircularStatic from "./LoadingOverlay"
import { setAvatarTraits, setAvatarModel } from "./scene-utils"
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Canvas } from "@react-three/fiber";
import { TemplateModel } from "./Models";


interface Avatar{
  hair:{},
  face:{},
  tops:{},
  arms:{},
  shoes:{},
  legs:{}
}

export default function CharacterEditor(props: any) {
  // State Hooks For Character Editor ( Base ) //
  // ---------- //
  // Charecter Name State Hook ( Note: this state will also update the name over the 3D model. )
  // const [characterName, setCharacterName] =
  //   useState<string>("Character Name");
  // Categories State and Loaded Hooks
  // const [categories, setCategories] = useState([]);
  // const [categoriesLoaded, setCategoriesLoaded] =
  //   useState<boolean>(false);
  // TODO: Where is setNodes
  // const [nodes, setNodes] = useState<object>(Object);
  // const [materials, setMaterials] = useState<object>(Object);
  // const [animations, setAnimations] = useState<object>(Object);
  // const [body, setBody] = useState<any>();

  const { theme, templates, mintPopup } = props
  // Selected category State Hook
  const [category, setCategory] = useState("color")
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //
  const [model, setModel] = useState<object>(Object)

  const [scene, setScene] = useState<object>(Object)
  // States Hooks used in template editor //
  const [templateInfo, setTemplateInfo] = useState({ file: null, format: null })

  const [downloadPopup, setDownloadPopup] = useState<boolean>(false)
  const [template, setTemplate] = useState<number>(1)
  const [loadingModelProgress, setLoadingModelProgress] = useState<number>(0)
  const [ avatar,setAvatar] = useState<Avatar>({
    hair:{},
    face:{},
    tops:{},
    arms:{},
    shoes:{},
    legs:{}
  })
  const [loadingModel, setLoadingModel] = useState<boolean>(false)

  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#de2a5e",
      },
    },
  })
  useEffect(() => {
    if(avatar){
      setAvatarTraits(avatar);
    }
  }, [avatar])

  useEffect(() => {
    if(model)
    setAvatarModel(model);
  }, [model])
  useEffect(() => {
    console.log('templateInfo', templateInfo)
    const setTempInfo = (id) => {
      async function fetchTemplate(id: any) {
        const filtered = templates.filter((templates: any) => templates.id === id);
        return filtered[0];
      }
      fetchTemplate(id).then((res) => {
        console.log("res is", res)
        setTemplateInfo(res)
      })
    }
    setTempInfo("2")
    if (templateInfo && templateInfo.file && templateInfo.format) {
      setLoadingModel(true)
      const loader = new GLTFLoader()
      loader
        .loadAsync(templateInfo.file, (e) => {
          setLoadingModelProgress((e.loaded * 100) / e.total)
        })
        .then((gltf) => {
          const vrm = gltf;
          // VRM.from(gltf).then((vrm) => {
            vrm.scene.traverse((o) => {
              o.frustumCulled = false
            })
            // vrm.humanoid.getBoneNode(
            //   VRMSchema.HumanoidBoneName.Hips,
            // ).rotation.y = Math.PI
            setLoadingModel(false)
            setScene(vrm.scene)
            setModel(vrm)
          // })
        })
    }
  }, [templateInfo?.file])

  const canvasWrap = {
    height: "100vh",
    width: "100vw",
    position: "absolute" as "absolute",
    zIndex: "0",
    top: "0",
    backgroundColor: "#111111"
  }

  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme ?? defaultTheme}>
        {templateInfo && (
          <Fragment>
            {loadingModel && (
              <LoadingOverlayCircularStatic
                loadingModelProgress={loadingModelProgress}
              />
            )}
            <DownloadCharacter
              scene={scene}
              templateInfo={templateInfo}
              model={model}
              downloadPopup={downloadPopup}
              setDownloadPopup={setDownloadPopup}
            />
        <div
          id="canvas-wrap"
          className={`canvas-wrap ${'generator'}`}
          style={{ ...canvasWrap, height: window.innerHeight - 89 }}
        >
          <Canvas
            className="canvas"
            id="editor-scene"
          >
            <gridHelper
              args={[50, 25, "#101010", "#101010"]}
              position={[0, 0, 0]}
            />
            <spotLight
              intensity={1}
              position={[0, 3.5, 2]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              castShadow
            />
            <spotLight
              intensity={0.2}
              position={[-5, 2.5, 4]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight
              intensity={0.2}
              position={[5, 2.5, 4]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight
              intensity={0.3}
              position={[0, -2, -8]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              castShadow
            />
            <OrbitControls
              minDistance={1}
              maxDistance={3}
              minPolarAngle={0.0}
              maxPolarAngle={Math.PI / 2 - 0.1}
              enablePan={false}
              target={[0, 1, 0]}
            />
            <PerspectiveCamera
            >
              {!downloadPopup && !mintPopup && (
                <TemplateModel scene={scene} />
              )}
            </PerspectiveCamera>
          </Canvas>
        </div>
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
