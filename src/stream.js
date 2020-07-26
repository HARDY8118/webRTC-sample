const socket = io()
let connection, localStream, remoteStream, room, description

connection = new RTCPeerConnection()

connection.addEventListener('icecandidate', event => {
    console.debug('Ice candidate')
    if (event.candidate) {
        socket.emit('icecandidate', { room, "candidate": event.candidate })
        document.querySelector('#ice_candidate_sent').checked = true
        console.debug("Sent ICE candidate")
    }
})

connection.addEventListener('track', event => {
    console.debug('Recieved track')
    document.querySelector('#recieved_track').checked = true
    // console.log(event)
    event.streams.forEach(stream => {
        document.querySelector('#remote').srcObject = stream
    })
    // socket.emit('track', { room, "event": event.track })
})

if (window.location.hash) {
    room = window.location.hash.slice(1)
    document.querySelector('#room_set').checked = true
    socket.emit('room', room)
    startStream()
}
else {
    room = window.prompt("Room to connect")
    document.querySelector('#room_set').checked = true
    socket.emit('room', room)
    startStream()
}

socket.on('offer', desc => {
    console.debug('Recieved offer')
    connection.setRemoteDescription(desc)
    document.querySelector('#remote_description_set').checked = true
    connection.createAnswer()
        .then(desc => {
            connection.setLocalDescription(desc)
            document.querySelector('#local_description_set').checked = true
            socket.emit('answer', { room, "description": desc })
            checkConnection()
        })
})

socket.on('answer', desc => {
    console.debug('Recieved answer')
    connection.setRemoteDescription(desc)
    document.querySelector('#remote_description_set').checked = true
    checkConnection()
})

function getVideo(constraints) {
    if (navigator.mediaDevices) {
        if (navigator.mediaDevices.getUserMedia) {
            return navigator.mediaDevices.getUserMedia(constraints)
        } else if (navigator.mediaDevices.webkitGetUserMedia) {
            return navigator.mediaDevices.webkitGetUserMedia(constraints)
        }
    } else {
        if (navigator.getUserMedia) {
            return navigator.getUserMedia(constraints)
        } else if (navigator.webkitGetUserMedia) {
            return navigator.webkitGetUserMedia(constraints)
        }
    }
}

function startStream() {
    getVideo({
        video: {
            width: parseInt(window.innerWidth / 2) - 8
        },
        audio: true
    }).then(stream => {
        document.querySelector('#got_video').checked = true
        connection.addStream(stream)
        // stream.getTracks().forEach(track => {
        //     connection.addTrack(track)
        // });
        document.querySelector('#local').srcObject = stream
    }).then(() => {
        sendOffer()
    })
}

function sendOffer() {
    connection.createOffer().then(desc => {
        connection.setLocalDescription(desc)
        document.querySelector('#local_description_set').checked = true
        // description = desc
        socket.emit('offer', { room, "description": desc })
    }).catch(error => {
        console.error(error)
    })
}

socket.on('icecandidate', candidate => {
    console.debug('Recieved ICE candidate')
    connection.addIceCandidate(candidate)
        .then(() => {
            console.debug("Added ICE candidate")
            document.querySelector('#ice_candidate_added').checked = true
        }, error => {
            console.error(error)
        })
})

function checkConnection() {
    if (connection.localDescription) {
        console.log('%c Local Description TRUE', 'background-color:green;color:white;')
    }
    else {
        console.log('%c Local Description FALSE', 'background-color:red;color:white;')
    }
    if (connection.remoteDescription) {
        console.log('%c Remote Description TRUE', 'background-color:green;color:white;')
    }
    else {
        console.log('%c Remote Description FALSE', 'background-color:red;color:white;')
    }
}

window.addEventListener('resize', () => {
    startStream()
})