import { Slider } from "primereact/slider"
import { InputText } from "primereact/inputtext"
import styled from "styled-components"

export default function ValueSlider({
  value,
  setValue,
  label = "Label",
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  className,
}) {
  return (
    <Holder className={className}>
      <Label>{label}</Label>
      <StyledSlider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => {
          setValue(e.value)
        }}
      />
      <StyledInputText
        value={value + "" + unit}
        onChange={e => {
          let newValue = e.target.value.replace(unit, "")
          newValue = Number(newValue)
          setValue(newValue)
        }}
      />
    </Holder>
  )
}

const Holder = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
`
const Label = styled.div`
  width: 5em;
`

const StyledSlider = styled(Slider)`
  flex: 1;
`

const StyledInputText = styled(InputText)`
  width: 4em;
`
