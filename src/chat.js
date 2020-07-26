const socket = io()
let connection, dataChannel

connection = new RTCPeerConnection()
console.debug("RTCPeerConnetion created")
document.querySelector('#connection_created').checked = true
let room
if (window.location.hash) {
    room = window.location.hash.slice(1)
    socket.emit('room', room)
    console.debug("Set room from hash")
    document.querySelector('#room_set').checked = true
    document.querySelector('label[for=channel_created]').innerHTML = document.querySelector('label[for=channel_created]').textContent.strike()
}
else {
    room = window.prompt("Room to connect")
    socket.emit('room', room)
    console.debug("Set room")
    document.querySelector('#room_set').checked = true
    dataChannel = connection.createDataChannel(room, { reliable: false })
    console.debug("Created data channel")
    document.querySelector('#channel_created').checked = true
}

connection.addEventListener('icecandidate', event => {
    console.log('Ice candidate')
    if (event.candidate) {
        socket.emit('icecandidate', { room, "candidate": event.candidate })
        console.debug("Sent ICE candidate")
    }
})
connection.addEventListener('datachannel', event => {
    dataChannel = event.channel
    console.debug("Data channel open")
    document.querySelector('#channel_open').checked = true
    if (dataChannel.readyState === 'open') {
        console.debug("Data channel Ready")
        document.querySelector('#channel_ready').checked = true
    }
    else if (dataChannel.readyState === 'connecting') {
        console.debug("Data channel connecting")
    }
    dataChannel.addEventListener('message', message => {
        console.log("%c" + message.data, "background-color:blue;color:white;")
        document.querySelector('#rec').value = message.data
    })
    dataChannel.addEventListener('close', () => {
        console.debug("Data channel closed")
    })
})
if (dataChannel) {
    dataChannel.addEventListener('open', event => {
        console.debug("Data channel open")
        document.querySelector('#channel_open').checked = true
        if (dataChannel.readyState === 'open') {
            console.debug("Data channel Ready")
            document.querySelector('#channel_ready').checked = true
        }
        else if (dataChannel.readyState === 'connecting') {
            console.debug("Data channel connecting")
        }
    })
    dataChannel.addEventListener('message', message => {
        console.log("%c" + message.data, "background-color:blue;color:white;")
        document.querySelector('#rec').value = message.data
    })
    dataChannel.addEventListener('close', () => {
        console.debug("Data channel closed")
    })
}
socket.on('icecandidate', candidate => {
    connection.addIceCandidate(candidate)
        .then(() => {
            console.debug("Added ICE candidate")
            document.querySelector('#candidate_added').checked = true
        }, error => {
            console.error(error)
        })
})

if (!(window.location.hash.slice(1))) {
    connection.createOffer().then(description => {
        connection.setLocalDescription(description)
        document.querySelector('#local_description_set').checked = true
        socket.emit('offer', { room, description })
    })
    socket.emit('datachannel', { room, dataChannel })
}

socket.on('offer', description => {
    connection.setRemoteDescription(description)
    document.querySelector('#remote_description_set').checked = true
    connection.createAnswer()
        .then(description => {
            connection.setLocalDescription(description)
            document.querySelector('#local_description_set').checked = true
            socket.emit('answer', { room, description })
        })
})
socket.on('answer', description => {
    connection.setRemoteDescription(description)
    document.querySelector('#remote_description_set').checked = true
})

function sendMsg() {
    let msg = document.querySelector('#msg')
    if (msg.value)
        dataChannel.send(msg.value.toString())
    msg.value = ""
}