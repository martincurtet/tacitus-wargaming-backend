const express = require('express')
const { createServer } = require('node:http')
const socket = require('./src/socket')

const URL = 'http://localhost'
const PORT = 8080

const app = express()
const server = createServer(app)
socket(server)

server.listen(PORT, () => {
  console.log(`# Server running at ${URL}:${PORT}`)
})
