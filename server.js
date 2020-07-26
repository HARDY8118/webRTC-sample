const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const cookie = require('cookie')

const app = express()

app.use(express.static(path.join(__dirname, 'src')))

const server = http.createServer(app)

io = socketio(server)

const PORT = process.env.PORT || 5000

io.on('connection', socket => {
    socket.on('room', e => {
        socket.join(e)
        const cookies = cookie.parse(socket.request.headers.cookie)
        // console.log(cookies)
    })
    socket.on('icecandidate', e => {
        console.log('ICE Candidate')
        socket.broadcast.to(e.room).emit('icecandidate', e.candidate)
        // socket.broadcast.emit('icecandidate', e.candidate)
    })
    socket.on('offer', e => {
        console.log('Offer')
        socket.broadcast.to(e.room).emit('offer', e.description)
        // socket.broadcast.emit('offer', e.description)
    })
    socket.on('answer', e => {
        console.log('Answer')
        socket.broadcast.to(e.room).emit('answer', e.description)
    })
    socket.on('datachannel', e => {
        console.log('DataChannel')
        socket.broadcast.to(e.room).emit('datachannel', e.dataChannel)
    })
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})