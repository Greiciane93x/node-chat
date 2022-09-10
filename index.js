const path = require('path'); 
const http = require('http'); 
const express = require('express'); 
const socketio = require('socket.io'); 
const formatMessage = require('./helpers/formatDate')

const {
    getActiveUser, 
    exitRoom, 
    newUser, 
    getIndividualRoomUsers
} = require('./helpers/userHelpers'); 

const app = express(); 
const server = http.createServer(app); 
const io = socketio(server); 

app.use(express.static(path.join(__dirname, 'public'))); 

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = newUser(socket.id, username, room); 

        socket.join(user.room); 

        socket.emit('message', formatMessage('New Chat', 'Messages are limited to this room!')); 

        socket.broadcast 
            .to(user.room)
            .emit(
                'message', 
                formatMessage("New Chat", `${user.username} has joined the room`)
            ); 
        io.to(user.room).emit('roomUsers', {
            room: user.room, 
            users: getIndividualRoomUsers(user.room)
        }); 
    }); 

    socket.on('chatMessage', msg => {
        const user = getActiveUser(socket.io); 

        io.to(user.room).emit('message', formatMessage(user.username, msg)); 
    }); 

    socket.on('disconnect', () => {
        const user = exitRoom(socket.id); 

        if(user){
            io.to(user.room).emit(
                'message', 
                formatMessage("Wellcome to new chat", `{~use}` )
            ); 
        
        io.to(user.room).emit('roomUsers', {
            room: user.room, 
            users: getIndividualRoomUsers(user.room)
        }); r
        }
    })
})