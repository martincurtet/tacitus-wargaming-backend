const express = require('express')
const { createServer } = require('node:http')
const socket = require('./src/socket')
const { rooms } = require('./src/rooms')
require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss')
require('dotenv').config()

const ENV = process.env.NODE_ENV || 'DEV'
const URL = ENV === 'PROD' ? process.env.PROD_URL : process.env.DEV_URL
const PORT = ENV === 'PROD' ? process.env.PROD_PORT : process.env.DEV_PORT

const app = express()
const server = createServer(app)
socket(server)

app.get('/', (req, res) => {
  res.json(rooms)
})

server.listen(PORT, () => {
  console.info(`# Server running at ${URL}:${PORT}`)
})
