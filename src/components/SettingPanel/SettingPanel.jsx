import { useRef } from "react"
import styled from "styled-components"
import { Button } from "primereact/button"
import { AnimatePresence, motion } from "framer-motion"

import { useStore } from "state/store"
import { SETTING_DATA } from "dataset/settings"
import EnvironmentPanel from "components/EnvironmentPanel"
import LightPanel from "components/LightPanel"
import { ConfigurePanelContent } from "components/ConfigurePanel"

export default function SettingPanel() {
  const activeToolbarIndex = useStore(state => state.activeToolbarIndex)
  const setActiveToolbarIndex = useStore(state => state.setActiveToolbarIndex)
  const contentRef = useRef()

  return (
    <AnimatePresence>
      {activeToolbarIndex >= 0 && (
        <Holder>
          <Header>
            <Title>{SETTING_DATA[activeToolbarIndex].label}</Title>
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-secondary p-button-text"
              onClick={() => {
                setActiveToolbarIndex(-1)
              }}
            />
          </Header>
          <Content ref={contentRef}>
            <TabContent active={activeToolbarIndex === 0 ? 1 : 0}>
              <LightPanel />
              <EnvironmentPanel />
            </TabContent>
            <TabContent active={activeToolbarIndex === 1 ? 1 : 0}>
              <ConfigurePanelContent />
            </TabContent>
          </Content>
        </Holder>
      )}
    </AnimatePresence>
  )
}

const Holder = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 0em;
`

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.7em;
  border-bottom: 2px solid #dadfe8;
`

const Title = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.label};
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`

const TabContent = styled.div`
  display: ${props => (props.active ? "block" : "none")};
`
