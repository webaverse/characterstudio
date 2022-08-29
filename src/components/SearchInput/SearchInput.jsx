import styled from "styled-components"
import { InputText } from "primereact/inputtext"

export default function SearchInput({ value, onChange }) {
  return (
    <Holder className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText value={value} onChange={onChange} placeholder="Search" />
    </Holder>
  )
}

const Holder = styled.span`
  padding: 0.5em;
  width: 100%;
  > i {
    margin-left: 0.5em;
  }
  > input {
    width: 100%;
  }
`
