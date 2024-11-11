const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let currentPage = 1;


app.use(express.static('public'));

io.on('connection', (socket) => {
    
    socket.emit('pageChange', currentPage);
    socket.on('changePage', (page) => {
        currentPage = page;
        io.emit('pageChange', currentPage);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
