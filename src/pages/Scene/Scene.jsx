import React from "react"
import styled from "styled-components"
import { Splitter, SplitterPanel } from "primereact/splitter"

import PageTransitionHolder from "components/PageTransitionHolder"
import Toolbar from "components/Toolbar"
import SettingPanel from "components/SettingPanel"
import Scene3D from "components/Scene3D"

export default function Scene() {
  return (
    <PageTransitionHolder>
      <Holder>
        <Splitter className="w-full h-full" layout="horizontal" gutterSize={6}>
          <SplitterPanel size={70}>
            <Scene3D />
          </SplitterPanel>
          <SplitterPanel className="flex" size={30} minSize={20}>
            <Toolbar />
            <SettingPanel />
          </SplitterPanel>
        </Splitter>
      </Holder>
    </PageTransitionHolder>
  )
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`
