const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const http = require('http');
const livereload = require('livereload');

const app = express();
const server = http.Server(app);
const io = socketio(server);


const connectedUsers = {};

io.of('/brazil').on('connection', socket => {

    // console.log(socket.handshake.query);

    // console.log('Usuário conectado!', socket.id);

    const { user_name } = socket.handshake.query;

    connectedUsers[user_name] = socket.id;

    // console.log(connectedUsers);

    // socket.on('disconnect', function() {
    //     console.log('Got disconnect!', socket.id);
    // });

    // socket.on('sent_message', function(msg){
    //     io.emit('sent_message', msg);
    // });

    socket.on('send_message', function(msg){
        console.log(user_name + " says: " + msg);
        if(msg == "join")
        {
            // console.log(user_name + " Joined room");
            socket.join('game');
        }
        
        io.of('/brazil').emit('received_message', { user_id: socket.id, user_name, msg });
        // socket.broadcast.emit('sent_message', user_name + ": " + msg);
        // console.log(socket.rooms);
    });

    // setInterval(() => {
    //     console.log("Sending private...");
    //     io.of('/brazil').to(socket.id).emit('sent_message', 'hi 1 nice' + Date.now());
    // }, 1000);

    // sending to all connected clients
    // io.of('/brazil').emit('received_message', `${user_name} entrou na sala`);
    socket.broadcast.emit('received_message', { msg: `${user_name} entrou na sala` });
    

    // socket.broadcast.emit('sent_message', 'hi 2 ' + Date.now());
    
});

// setInterval(() => {
//     console.log("Sending global...");
//     io.of('/brazil').to("game").emit('sent_message', 'hi 1 game' + Date.now());
// }, 1000);

// io.emit('some event', { for: 'everyone' });
// io.on('connection', function(socket){
//     socket.broadcast.emit('hi');
//   });
// io.on('connection', function(socket){
//     socket.on('chat message', function(msg){
//       io.emit('chat message', msg);
//     });
//   });


app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;

    return next();
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/pages/index.html');
});


app.get('/emit', (req, res) => {

    // Procurando pelo socket de conexao do user
    // const ownerSocket = req.connectedUsers[user];

    // req.io.ownerSocket.emit('sent_message', { from: "Test", msg: "Hello!" });
    req.io.emit('sent_message', { from: "Test", msg: "Hello!" });
    
    console.log("emited");

    res.send("Emited");

    res.end();

});

app.get('/home', (req, res) => {

    res.send("<h1>A</h1>");
    
    console.log("oi");

});

app.use('/style.css', express.static(__dirname + '/public/style.css'));
// app.use(express.static(__dirname + '/public'));
// app.use('/files', express.static( path.resolve(__dirname, '..', 'storage', 'uploads') ));


const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname + "/public");
liveReloadServer.watch(__dirname + "/pages");

app.use(cors());

app.use(express.json());

// app.use(routes);

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on http://localhost:${(process.env.PORT || 3000)}`)
});