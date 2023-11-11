const express = require('express')

const URL = 'http://localhost'
const PORT = 8080

const app = express()

app.listen(PORT, () => {
  console.log(`# Server running at ${URL}:${PORT}`)
})
