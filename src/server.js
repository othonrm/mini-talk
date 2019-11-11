const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const http = require('http');
const livereload = require('livereload');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.Server(app);
const io = socketio(server);

const connectedUsers = {};

io.of('/brazil').on('connection', socket => {

    const { user_name } = socket.handshake.query;

    connectedUsers[user_name] = socket.id;

    socket.on('send_message', function(msg){
        console.log(user_name + " says: " + msg);
        if(msg == "join")
        {
            socket.join('game');
        }
        
        io.of('/brazil').emit('received_message', { user_id: socket.id, user_name, msg });
    });

    socket.broadcast.emit('received_message', { msg: `${user_name} entrou na sala` });

});

app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;

    return next();
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/pages/index.html');
});

app.use('/assets', express.static(__dirname + '/public/assets'));

if(process.env.APP_ENV === "dev")
{
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(__dirname + "/public");
    liveReloadServer.watch(__dirname + "/pages");
}


app.use(cors());

app.use(express.json());

// app.use(routes);

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on http://localhost:${(process.env.PORT || 3000)}`)
});