import { useState } from "react"
import styled from "styled-components"
import Viewer3D from "components/Viewer3D"
import ArrayButterToUint from "utils/ArrayButterToUint"

export default function Scene3D() {
  const [file, setFile] = useState(null)

  const onDragOver = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = e => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    const reader = new FileReader()

    reader.onload = function (event) {
      ArrayButterToUint(event.target.result).then(function (result) {
        setFile(result)
      })
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <Holder onDragOver={onDragOver} onDrop={onDrop}>
      {!file && <Status>Drag and drop a zip of glb, gltf and fbx</Status>}
      <Viewer3D file={file} />
    </Holder>
  )
}

const Holder = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  background-color: #212121;
`

const Status = styled.p`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  color: #e2e2e2;
  font-size: 1.5em;
`
