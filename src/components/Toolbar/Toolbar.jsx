import { SETTING_DATA } from "dataset/settings"
import { useStore } from "state/store"
import styled from "styled-components"

export default function Toolbar() {
  const activeToolbarIndex = useStore(state => state.activeToolbarIndex)
  const setActiveToolbarIndex = useStore(state => state.setActiveToolbarIndex)

  return (
    <Holder>
      {SETTING_DATA.map((item, index) => (
        <Item
          key={index}
          actived={index === activeToolbarIndex}
          onClick={() => {
            setActiveToolbarIndex(index)
          }}
        >
          <img src={item.icon}></img>
        </Item>
      ))}
    </Holder>
  )
}

const Holder = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 0em;
  border: 1px solid #edf0f5;
`
const Item = styled.div`
  position: relative;
  width: 3em;
  height: 3em;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease-out;
  background-color: ${({ theme, actived }) =>
    actived ? theme.colors.lightPrimary : "transparent"};
  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverPrimary};
  }
  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    opacity: ${({ actived }) => (actived ? 1 : 0)};
    background-color: ${({ theme }) => theme.colors.primary};
    transition: opacity 0.3s ease-out;
  }
  img {
    width: 50%;
    height: 50%;
  }
`
