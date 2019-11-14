const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');
const cors = require('cors');
const http = require('http');
const path = require('path');
const livereload = require('livereload');
const dotenv = require('dotenv');

const edge = require('edge.js');
const { config, engine } = require('express-edge');


dotenv.config();

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.use(express.static('node_modules'));

edge.global("APP_NAME", process.env.APP_NAME || 'Mini Talk');

app.use(engine);

app.set('views', `${__dirname}/resources/views`);

const channelName = '/brazil';
const connectedUsers = {};

let publicUserList = [];

io.of(channelName).on('connection', socket => {

    const { user_name } = socket.handshake.query;

    connectedUsers[user_name] = socket.id;

    publicUserList.push({
        socket_id: socket.id,
        name: user_name,
        stats: "online",
        last_seen: null
    });
    
    socket.broadcast.emit('received_message', { msg: `${user_name} entrou na sala` });

    io.of(channelName).emit('user_list', { users: publicUserList });

    socket.on('send_message', function(msg) {
        
        io.of(channelName).emit('received_message', { user_id: socket.id, user_name, msg });
    });

    socket.on('user_list', function (data, callback) {

        if(data && data.ownerId)
        {

        }

        callback({ users: publicUserList.map(user => { delete(user.id); return user }) });
    });

});

io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function () {

        // console.log(socket.id);

        let user = publicUserList.find(user => user.socket_id === (channelName + "#" + socket.id));

        if(!user)
        {
            return;
        }

        io.of(channelName).emit('received_message', { msg: `${user.name} saiu da sala` });

        publicUserList = publicUserList.filter(item => item !== user);

        io.of(channelName).emit('user_list', { users: publicUserList });

    });

});

app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;

    return next();
});

app.get('/', function(req, res){

    res.render('index');
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