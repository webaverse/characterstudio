import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
} from "styled-components"
import { normalize } from "polished"
import Div100vh from "react-div-100vh"
import { isMobile } from "react-device-detect"

import theme from "./theme"

import "react-toastify/dist/ReactToastify.css"

//primereact styles
import "theme/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import "primeflex/primeflex.css"

import PrimeReact from "primereact/api"
PrimeReact.ripple = true
PrimeReact.inputStyle = "filled"

const GlobalStyle = createGlobalStyle`
  ${normalize()}

  body {
    color: #000000;
    font-family: Proxima-Nova;
    font-Size: 14px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
    user-select: none;
    padding: 0;
    margin: 0;
    -webkit-touch-callout: none;
  }

  *::-webkit-scrollbar {
    width: 10px;
  }

  *::-webkit-scrollbar-track {
    background-color: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background-color: #848484;
    border-radius: 10px;
    border: 3px solid white;
  }
`

const MobileContainer = styled(Div100vh)`
  width: 100vw;
`

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
`

export default function ThemeProvider({ children }) {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      <GlobalStyle />
      {isMobile ? (
        <MobileContainer> {children} </MobileContainer>
      ) : (
        <DesktopContainer> {children} </DesktopContainer>
      )}
    </StyledComponentsThemeProvider>
  )
}
