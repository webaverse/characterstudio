import { useState } from "react"
import styled from "styled-components"
import { Tree } from "primereact/tree"

import { useStore } from "state/store"

export default function ConfigurePanelContent() {
  const groupModel = useStore(state => state.groupModel)
  const setGroupModel = useStore(state => state.setGroupModel)
  const selectedGroupNodes = useStore(state => state.selectedGroupNodes)
  const setSelectedGroupNodes = useStore(state => state.setSelectedGroupNodes)

  const [loadingVisible, setLoadingVisible] = useState(false)

  function handleDragDrop(e) {
    setGroupModel(e.value)
  }

  const handleSelectionChange = e => {
    setSelectedGroupNodes(e.value)
  }

  return (
    <StyledTree
      value={groupModel}
      selectionMode="checkbox"
      selectionKeys={selectedGroupNodes}
      onSelectionChange={handleSelectionChange}
      dragdropScope="configure-group-tree"
      onDragDrop={handleDragDrop}
      loading={loadingVisible}
      loadingIcon="pi pi-spinner"
      filter={true}
    />
  )
}

const StyledTree = styled(Tree)`
  border: none;
  padding: 0;
`
