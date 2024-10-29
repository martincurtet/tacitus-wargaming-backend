const express = require('express')
const { createServer } = require('node:http')
const socket = require('./src/socket')
const { rooms } = require('./src/rooms')
const path = require('path')
require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss')
require('dotenv').config()

const ENV = process.env.NODE_ENV || 'DEV'
const URL = ENV === 'PROD' ? process.env.PROD_URL : process.env.DEV_URL
const PORT = ENV === 'PROD' ? process.env.PROD_PORT : process.env.DEV_PORT
const ADMIN_PWD = 'PROD' ? process.env.PROD_PWD : process.env.DEV_PWD

const app = express()
const server = createServer(app)
socket(server)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/admin', (req, res) => {
  res.render('admin', { rooms })
})

app.get('/rooms', (req, res) => {
  res.send(rooms)
})

server.listen(PORT, () => {
  console.info(`# Server running at ${URL}:${PORT}`)
})
