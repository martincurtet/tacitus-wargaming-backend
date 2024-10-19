const express = require('express')
const { createServer } = require('node:http')
const socket = require('./src/socket')
const { rooms } = require('./src/rooms')
require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss')

const URL = 'https://luminous-crumble-c87247.netlify.app/'
const PORT = 8080

const app = express()
const server = createServer(app)
socket(server)

app.get('/', (req, res) => {
  res.json(rooms)
})

server.listen(PORT, () => {
  console.info(`# Server running at ${URL}:${PORT}`)
})
