import styled, { keyframes } from "styled-components"
import theme from "theme/theme"

export default function Spiner({ size = 50, color = theme.colors.primary }) {
  return (
    <Holder size={size}>
      <Spin viewBox="0 0 50 50">
        <Path
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          color={color}
        ></Path>
      </Spin>
    </Holder>
  )
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`
const rotate = keyframes`
  100% {
      transform: rotate(360deg);
  }
`
const Spin = styled.svg`
  animation: ${rotate} 2s linear infinite;
  z-index: 2;
`
const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`
const Path = styled.circle`
  stroke: ${props => props.color};
  stroke-linecap: round;
  animation: ${dash} 1.5s ease-in-out infinite;
`
