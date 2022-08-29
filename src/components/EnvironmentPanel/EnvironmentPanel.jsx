import styled from "styled-components"
import { Panel } from "primereact/panel"
import { RadioButton } from "primereact/radiobutton"

import { useStore } from "state/store"
import { ENVIRONMENT_DATA } from "dataset/environments"
import ValueSlider from "components/ValueSlider"
import ValueCheckbox from "components/ValueCheckbox"

export default function SettingPanel() {
  const activeEnvironmentIndex = useStore(state => state.activeEnvironmentIndex)
  const setActiveEnvironmentIndex = useStore(
    state => state.setActiveEnvironmentIndex,
  )
  const envBackgroundEnabled = useStore(state => state.envBackgroundEnabled)
  const setEnvBackgroundEnabled = useStore(
    state => state.setEnvBackgroundEnabled,
  )
  const currentOrientation = useStore(state => state.currentOrientation)
  const setCurrentOrientation = useStore(state => state.setCurrentOrientation)
  const currentExposure = useStore(state => state.currentExposure)
  const setCurrentExposure = useStore(state => state.setCurrentExposure)

  return (
    <Holder header="3D Environments" toggleable={true} collapsed={true}>
      <HdrList>
        {ENVIRONMENT_DATA.map((category, index) => {
          return (
            <HdrItem
              key={index}
              onClick={() => {
                setActiveEnvironmentIndex(index)
              }}
            >
              <RadioButton
                name="environment"
                inputId={index}
                value={index}
                onChange={e => {
                  setActiveEnvironmentIndex(e.value)
                }}
                checked={activeEnvironmentIndex === index}
                disabled={false}
              />
              <PreviewHolder>
                <Preview image={category.jpg} />
                <div>
                  <label>{category.name}</label>
                </div>
              </PreviewHolder>
            </HdrItem>
          )
        })}
      </HdrList>
      <SetBackgroundCheckbox
        label="Set as background"
        checked={envBackgroundEnabled}
        setChecked={setEnvBackgroundEnabled}
      />
      <OrientationSlider
        label="Orientation"
        value={currentOrientation}
        setValue={setCurrentOrientation}
        unit="°"
        min={0}
        max={360}
        step={0.1}
      />
      <BrightnessSlider
        label="Exposure"
        value={currentExposure}
        setValue={setCurrentExposure}
        unit=""
        min={0}
        max={2}
        step={0.01}
      />
    </Holder>
  )
}

const Holder = styled(Panel)`
  width: 100%;
`

const HdrList = styled.div`
  max-height: 45vh;
  overflow-y: auto;
  border: 1px solid #edf0f5;
`

const HdrItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  padding: 0.5em;
  cursor: pointer;
  transition: background-color 0.3s ease-out;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverPrimary};
  }
`

const PreviewHolder = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
`
const Preview = styled.div`
  width: 9em;
  height: 4em;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border-radius: 0.5em;
`

const OrientationSlider = styled(ValueSlider)`
  margin-top: 1em;
`

const BrightnessSlider = styled(ValueSlider)`
  margin-top: 1em;
`

const SetBackgroundCheckbox = styled(ValueCheckbox)`
  margin-top: 1em;
`
