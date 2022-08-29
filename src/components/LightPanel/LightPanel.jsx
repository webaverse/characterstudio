import { useEffect, useState } from "react"
import styled from "styled-components"
import { SketchPicker } from "react-color"
import { Panel } from "primereact/panel"
import { useStore } from "state/store"
import ValueSlider from "components/ValueSlider"

export default function LightPanel() {
  const sunInfo = useStore(state => state.sunInfo)
  const setSunInfo = useStore(state => state.setSunInfo)

  const firstEmbientInfo = useStore(state => state.firstEmbientInfo)
  const setFirstEmbientInfo = useStore(state => state.setFirstEmbientInfo)

  const secondEmbientInfo = useStore(state => state.secondEmbientInfo)
  const setSecondEmbientInfo = useStore(state => state.setSecondEmbientInfo)

  const [activeIndex, setActiveIndex] = useState(-1)
  const [color, setColor] = useState({
    hex: "#000000",
  })
  const [intensity, setIntensity] = useState(1)

  useEffect(() => {
    switch (activeIndex) {
      case 0:
        setColor({ ...color, hex: sunInfo.color })
        setIntensity(sunInfo.intensity)
        break
      case 1:
        setColor({ ...color, hex: firstEmbientInfo.color })
        setIntensity(firstEmbientInfo.intensity)
        break
      case 2:
        setColor({ ...color, hex: secondEmbientInfo.color })
        setIntensity(secondEmbientInfo.intensity)
        break
      default:
        break
    }
  }, [activeIndex])

  useEffect(() => {
    switch (activeIndex) {
      case 0:
        setSunInfo({ ...sunInfo, color: color.hex })
        break
      case 1:
        setFirstEmbientInfo({ ...firstEmbientInfo, color: color.hex })
        break
      case 2:
        setSecondEmbientInfo({
          ...secondEmbientInfo,
          color: color.hex,
        })
        break
      default:
        break
    }
  }, [color])

  useEffect(() => {
    switch (activeIndex) {
      case 0:
        setSunInfo({ ...sunInfo, intensity: intensity })
        break
      case 1:
        setFirstEmbientInfo({ ...firstEmbientInfo, intensity: intensity })
        break
      case 2:
        setSecondEmbientInfo({
          ...secondEmbientInfo,
          intensity: intensity,
        })
        break
      default:
        break
    }
  }, [intensity])

  return (
    <Holder header="Lights" toggleable={true} collapsed={true}>
      <LightList>
        <LightItem
          active={activeIndex === 0}
          onClick={() => {
            setActiveIndex(0)
          }}
        >
          <div className="flex align-items-center gap-3">
            <Circle color={sunInfo.color} />
            <p>1: Sun</p>
          </div>
          <i
            className={`pi ${sunInfo.enabled ? "pi-eye" : "pi-eye-slash"}`}
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              setSunInfo({ ...sunInfo, enabled: !sunInfo.enabled })
            }}
          ></i>
        </LightItem>
        <LightItem
          active={activeIndex === 1}
          onClick={() => {
            setActiveIndex(1)
          }}
        >
          <div className="flex align-items-center gap-3">
            <Circle color={firstEmbientInfo.color} />
            <p>2: Ambient Light</p>
          </div>
          <i
            className={`pi ${
              firstEmbientInfo.enabled ? "pi-eye" : "pi-eye-slash"
            }`}
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              setFirstEmbientInfo({
                ...firstEmbientInfo,
                enabled: !firstEmbientInfo.enabled,
              })
            }}
          ></i>
        </LightItem>
        <LightItem
          active={activeIndex === 2}
          onClick={() => {
            setActiveIndex(2)
          }}
        >
          <div className="flex align-items-center gap-3">
            <Circle color={secondEmbientInfo.color} />
            <p>3: Ambient Light</p>
          </div>
          <i
            className={`pi ${
              secondEmbientInfo.enabled ? "pi-eye" : "pi-eye-slash"
            }`}
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              setSecondEmbientInfo({
                ...secondEmbientInfo,
                enabled: !secondEmbientInfo.enabled,
              })
            }}
          ></i>
        </LightItem>
      </LightList>
      {activeIndex >= 0 && (
        <>
          <Picker
            color={color}
            disableAlpha
            onChange={(color, event) => {
              setColor(color)
            }}
          ></Picker>
          <IntensitySlider
            label="Intensity"
            value={intensity}
            setValue={setIntensity}
            unit=""
            min={0}
            max={15}
            step={0.1}
          />
        </>
      )}
    </Holder>
  )
}

const Holder = styled(Panel)`
  width: 100%;
`

const LightList = styled.div`
  max-height: 45vh;
  overflow-y: auto;
  border: 1px solid #edf0f5;
`

const LightItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  padding: 0.8em;
  cursor: pointer;
  transition: background-color 0.3s ease-out;
  background-color: ${props => (props.active ? "#daedfe" : "transparent")};
  &:hover {
    background-color: ${({ theme, active }) =>
      active ? "#daedfe" : theme.colors.hoverPrimary};
  }
`

const Circle = styled.span`
  width: 1em;
  height: 1em;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`

const IntensitySlider = styled(ValueSlider)`
  margin-top: 3em;
`

const Picker = styled(SketchPicker)`
  padding: 0 !important;
  width: 100% !important;
  max-width: 40em;
  box-shadow: unset !important;
  margin-top: 1em;
`
