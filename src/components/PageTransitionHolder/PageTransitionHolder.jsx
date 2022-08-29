import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"

export default function PageTransitionHolder(props) {
  const { children } = props

  return (
    <AnimatePresence>
      <RouteContainer {...AnimationSettings}>{children}</RouteContainer>
    </AnimatePresence>
  )
}

const RouteContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
`

const AnimationSettings = {
  transition: { duration: 0.5 },
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
}
