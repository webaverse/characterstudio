import styled from "styled-components"
import { useStore } from "state/store"

export default function StyleInfo() {
  const currentStyleDocumentData = useStore(
    state => state.currentStyleDocumentData,
  )

  const generatorInfo = useStore(state => state.generatorInfo)

  return (
    <Holder>
      <p style={{ fontSize: "1.5em", color: "#c2c2c2" }}>
        {currentStyleDocumentData.document.node_name}
      </p>
      <p>{currentStyleDocumentData.revision.file_name}</p>
      <p>{currentStyleDocumentData.revision.state}</p>
      <p className="mt-4">{generatorInfo?.generator}</p>
      <p>{generatorInfo?.copyright}</p>
      <p>{generatorInfo?.version}</p>
    </Holder>
  )
}

const Holder = styled.div`
  position: absolute;
  top: 1em;
  right: 1em;
  z-index: 1;
  font-size: 0.8em;
  font-weight: 100;
  letter-spacing: 0.05em;
  color: #a2a2a2;
  pointer-events: none;
  padding: 0;
  margin: 0;
  line-height: 1;
  text-align: right;
  > p {
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }
`
