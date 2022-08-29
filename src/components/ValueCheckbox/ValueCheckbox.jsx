import { Checkbox } from "primereact/checkbox"
import styled from "styled-components"

export default function ValueCheckbox({
  checked,
  setChecked,
  label = "Label",
  className,
}) {
  return (
    <Holder className={className}>
      <Label>{label}</Label>
      <StyledCheckbox
        checked={checked}
        onChange={e => {
          setChecked(e.checked)
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
  flex: 1;
`

const StyledCheckbox = styled(Checkbox)`
  width: 4em;
`
