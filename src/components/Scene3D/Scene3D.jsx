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
        console.log(result)
        setFile(result)
      })
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <Holder onDragOver={onDragOver} onDrop={onDrop}>
      <Viewer3D file={file} />
    </Holder>
  )
}

const Holder = styled.div`
  flex: 1;
  height: 100%;
  background-color: #212121;
`
