function componentToHex(c) {
  var hex = c.toString(16)
  return hex.length === 1 ? "0" + hex : hex
}

/**
 * {r, g, b} : {0.1, 0.1, 0.1}
 * @param {JSON} rgb
 * @returns
 */
function RgbToHex(rgb) {
  const { r, g, b } = rgb
  return (
    "#" +
    componentToHex(Math.floor(r * 255)) +
    componentToHex(Math.floor(g * 255)) +
    componentToHex(Math.floor(b * 255))
  )
}

export default RgbToHex
