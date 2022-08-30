import styled from "styled-components"
import { Panel } from "primereact/panel"
import ConfigurePanelContent from "./ConfigurePanelContent"

export default function ConfigurePanel() {
  return (
    <Holder header="Configure Groups" toggleable={true} collapsed={true}>
      <ConfigurePanelContent />
    </Holder>
  )
}

const Holder = styled(Panel)`
  width: 100%;
`
