const ArrayBufferToBase64 = arrayBuffer => {
  let b64encoded = btoa(
    [].reduce.call(
      new Uint8Array(arrayBuffer),
      function (p, c) {
        return p + String.fromCharCode(c)
      },
      "",
    ),
  )
  let mimetype = "image/jpeg"
  return "data:" + mimetype + ";base64," + b64encoded
}

export default ArrayBufferToBase64
