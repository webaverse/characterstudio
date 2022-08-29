import { useEffect, useState } from "react"
import styled from "styled-components"
import { InputNumber } from "primereact/inputnumber"

export default function Vec2Input({
  title,
  value,
  setValue,
  step = 1,
  min = -100,
  max = 100,
}) {
  const [x, setX] = useState(value.x)
  const [y, setY] = useState(value.y)

  useEffect(() => {
    setValue({ x, y })
  }, [x, y])

  return (
    <Holder className="grid grid-nogutter">
      <div className="col-3">
        <Title>{title}</Title>
      </div>
      <div className="col-9 p-fluid grid grid-nogutter">
        <div className="col-12 grid grid-nogutter flex align-items-center">
          <label className="col-2 text-right pr-2" htmlFor="x-input">
            X
          </label>
          <div className="col-10">
            <InputNumber
              inputId="x-input"
              value={x}
              onValueChange={e => {
                setX(e.value)
              }}
              mode="decimal"
              step={step}
              min={min}
              max={max}
              showButtons
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
            />
          </div>
        </div>
        <div className="col-12 grid grid-nogutter flex align-items-center mt-1">
          <label className="col-2 text-right pr-2" htmlFor="y-input">
            Y
          </label>
          <div className="col-10">
            <InputNumber
              inputId="y-input"
              value={y}
              onValueChange={e => {
                setY(e.value)
              }}
              mode="decimal"
              step={step}
              min={min}
              max={max}
              showButtons
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
            />
          </div>
        </div>
      </div>
    </Holder>
  )
}

const Holder = styled.div``

const Title = styled.p`
  font-size: 1em;
  font-weight: 400;
  color: #222;
  margin: 0;
  padding-top: 0.6em;
`
