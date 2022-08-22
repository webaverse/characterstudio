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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const atlasValues = [256, 512, 1024, 2048, 4096, 8192]

function TextureInspector({ model }) {
  if (!model || !model.isGroup) return null;
  const materials = [];
  model.traverse((node) => {
    if (node.material) {
      materials.push(node.material);
    }
  });

  const textureMaps = materials.reduce((acc, material) => {
    if (material.map) {
      acc.push(material.map)
    }
    return acc
  }, [])

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

export default function CharacterEditor(props) {
  const { theme, templates } = props
  const [model, setModel] = useState(Object)
  const [scene, setScene] = useState(Object)
  const [templateInfo, setTemplateInfo] = useState({ file: null, format: null })
  const [loadingModelProgress, setLoadingModelProgress] = useState(0)

  const [loadingModel, setLoadingModel] = useState(false)
  const [modelUrl, setModelUrl] = useState(null)

  const [atlasSize, setAtlasSize] = useState(4096)

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

    // check if we have a url param for model
    const urlParams = new URLSearchParams(window.location.search);
    let model = null;
    if (urlParams.get('model')) {
      setModelUrl(urlParams.get('model'));
      model = urlParams.get('model');
    }
    const setTempInfo = (id) => {
      async function fetchTemplate(id) {
        const filtered = templates.filter((templates) => templates.id === id);
        return filtered[0];
      }
      fetchTemplate(id).then((res) => {
        setTemplateInfo(res)
      })
    }
    setTempInfo("1")
    if (templateInfo && templateInfo.file && templateInfo.format) {
      setLoadingModel(true)
      if (!model) {
        model = templateInfo.file;
        setModelUrl(model);
        // set the model value in the url params
        urlParams.set('model', model);
      }
      const loader = new GLTFLoader()
      loader
        .loadAsync(model, (e) => {
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
    position: "absolute",
    zIndex: "0",
    top: "0",
    backgroundColor: "#111111"
  }

  const downloadModel = (format) => {
    download(model, `${templateInfo.name.replace(" ", "_")}`, format, atlasSize);
  };

  const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }

  // receives array of files that are done uploading when submit button is clicked
  const handleSubmit = (files, allFiles) => {
    console.log(files.map(f => f.meta))
    allFiles.forEach(f => f.remove())
  }

  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme ?? defaultTheme}>
        {templateInfo && (
          <Fragment>
            <TextureInspector model={model} />
            {loadingModel && (
              <LoadingOverlayCircularStatic
                loadingModelProgress={loadingModelProgress}
              />
            )}
            {!loadingModel && (
              <Fragment>
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 10
                }}>
                  <span style={{
                    // white outline and rounded corners
                    border: "1px solid white",
                    borderRadius: "5px",
                    padding: "5px",
                    margin: "5px",
                  }} >
                    {/* a text input box and a button, on click the button will call the current url with the param ?model=<text box value> */}
                    <input type="text" placeholder={modelUrl} onChange={(e) => {
                      setModelUrl(e.target.value)
                    }} />
                    <Button onClick={() => {
                      // go to modelUrl
                      window.location.href = `${window.location.origin}${window.location.pathname}?model=${modelUrl}`
                    }}>
                      Load
                    </Button>
                  </span>
                  {/* a set of radio buttons that call setAtlasSize with the value 512, 1024, 2048, 4096, 8192 */}
                  <span style={{
                    // white outline and rounded corners
                    border: "1px solid white",
                    borderRadius: "5px",
                    padding: "5px",
                    margin: "5px",
                  }} >
                    <RadioGroup defaultValue={atlasSize} row aria-label="position" name="position" style={{
                      display: "inline",
                      color: 'white',
                      width: "100%"
                    }}>
                    <span style={{marginRight: '10px'}}>Atlas Size</span>
                      {atlasValues.map((value, i) => {
                        return (
                          <FormControlLabel
                            value={value}
                            key={i}
                            control={<Radio color="primary" />}
                            label={value}
                            labelPlacement="end"
                            onClick={() => {
                              setAtlasSize(value)
                            }}
                          />
                        )
                      })}
                    </RadioGroup>
                  </span>
                  <span style={{
                    // white outline and rounded corners
                    border: "1px solid white",
                    borderRadius: "5px",
                    padding: "5px",
                    margin: "5px",
                  }} >
                    <Button onClick={() => downloadModel('vrm')}>Download VRM</Button>
                    <Button onClick={() => downloadModel('gltf/glb')}>Download GLB</Button>
                  </span>

                </div>

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
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
