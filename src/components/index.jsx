import { createTheme, ThemeProvider } from "@mui/material"
import { VRM, VRMSchema } from "@pixiv/three-vrm"
import React, { Suspense, useState, useEffect, Fragment } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import LoadingOverlayCircularStatic from "./LoadingOverlay"
import { setAvatarModel } from "./scene-utils"
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Canvas } from "@react-three/fiber";
import { TemplateModel } from "./Models";
import Button from "@mui/material/Button";
import { download } from "./scene-utils";

function TextureInspector ({ model }) {
  if(!model || !model.isGroup) return null;
  const materials = [];
  model.traverse((node) => {
    if(node.material) {
      materials.push(node.material);
    }
  } );

  const textureMaps = materials.reduce((acc, material) => {
    if (material.map) {
      acc.push(material.map)
    }
    return acc
  } , [])
  
  console.log('textureMaps', textureMaps)

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: "500px", height: "100vh", zIndex: 1000 }}>
      {textureMaps.map((textureMap, i) => {
        return (
          <div key={i}>
            <img src={textureMap.image.src} />
            </div>
        )
      })
    }
    </div>
  )
}

export default function CharacterEditor(props: any) {
  const { theme, templates } = props
  const [model, setModel] = useState<object>(Object)
  const [scene, setScene] = useState<object>(Object)
  const [templateInfo, setTemplateInfo] = useState({ file: null, format: null })
  const [loadingModelProgress, setLoadingModelProgress] = useState<number>(0)

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
    if (model)
      setAvatarModel(model);
  }, [model]);

  useEffect(() => {
    const setTempInfo = (id) => {
      async function fetchTemplate(id: any) {
        const filtered = templates.filter((templates: any) => templates.id === id);
        return filtered[0];
      }
      fetchTemplate(id).then((res) => {
        setTemplateInfo(res)
      })
    }
    setTempInfo("1")
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

  const downloadModel = (format: any) => {
    download(model, `CC_Model_${(templateInfo as any).name.replace(" ", "_")}`, format);
  };

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
            <div style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10
            }}>
              <Button onClick={() => downloadModel('vrm')}>Download VRM</Button>
              <Button onClick={() => downloadModel('gltf/glb')}>Download GLB</Button>
            </div>
            <TextureInspector model={model} />
            <div
              id="canvas-wrap"
              className={`canvas-wrap ${'generator'}`}
              style={{ ...canvasWrap }}
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
                <OrbitControls
                  minDistance={1}
                  maxDistance={3}
                  minPolarAngle={0.0}
                  maxPolarAngle={Math.PI / 2 - 0.1}
                  enablePan={false}
                  target={[0, 1, 0]}
                />
                <PerspectiveCamera>
                  <TemplateModel scene={scene} />
                </PerspectiveCamera>
              </Canvas>
            </div>
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
