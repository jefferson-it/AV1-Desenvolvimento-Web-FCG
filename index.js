/**
 * Neste trecho eu faço importações dos módulos que irei precisar
 * 
 * Express para poder gerenciar o servidor
 * A função createServer do HTTP para poder criar o servidor(ele será necessário para o socket.io)
 * O socket.io para poder criar comunicação WebSocket 
 */
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { genRandomNum, shuffleData } from './function.js';

// Constantes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001'
    }
});
const publicFolder = `${__dirname}/${path.join('public')}`;

// Configurações do servidor
app.use(express.static(publicFolder));

// Configurações socket
const rooms = [];

io.on('connect', (socket) => {
    console.log(`Socket conectado ${socket.id}`);

    socket.on('verify-room', async (code) => {
        const room = rooms.find(v => v.code === code)

        if (!room) {
            socket.emit('room-failed', 'Sala inexistente')
        }

        else if (room.player.includes(socket.id)) {
            io.to(`game-${room.code}`).emit('room-updated', room);
        }

        else {
            socket.emit('room-failed', 'Você não está nesta sala')
        }
    });

    socket.on('join-room', async (code) => {
        const room = rooms.find(v => v.code === code)
        const roomIndex = rooms.findIndex(room => room?.player.includes(socket.id));

        if (!room) return socket.emit('result-join', `Sala ${code} inexistente`);
        else if (room.player.length == 2) return socket.emit('result-join', `A sala já tem dois jogadores`);

        room.player.push(socket.id);

        (await socket.join(`game-${room.code}`));

        room.playerTurn = room.player[genRandomNum(0, 1)];
        room.symbols = room.player.reduce((a, b) => {
            return {
                ...a,
                [b]: b === room.playerTurn ? 'X' : 'O'
            }
        }, {})

        room.matriz = [
            [],
            [],
            [],
        ];

        room.score = room.player.reduce((a, b) => {
            return {
                ...a,
                [b]: 0
            }
        }, {})

        room.score.draw = 0;

        rooms[roomIndex] = room;

        io.to(`game-${room.code}`).emit('room-updated', room);
    });

    socket.on('send-matriz', ({ code, matriz }) => {
        const room = rooms.find(v => v.code === code)
        if (!room || room.endedGame) return;

        const roomIndex = rooms.findIndex(room => room?.player.includes(socket.id));
        let atualPlayer = room.player.findIndex(v => room.playerTurn === v);

        room.matriz = matriz
        room.playerTurn = room.player[
            atualPlayer == 0 ? 1 : 0
        ];

        rooms[roomIndex] = room;
        io.to(`game-${room.code}`).emit('room-updated', room);
    })

    socket.on('winner', ({ code, winnerInfo }) => {
        const room = rooms.find(v => v.code === code)
        if (!room || room.endedGame) return;

        const roomIndex = rooms.findIndex(room => room?.player.includes(socket.id));
        let gain = 'draw'

        if (winnerInfo.symbol) {
            const playerIndex = Object.values(room.symbols).findIndex(v => v === winnerInfo.symbol);
            const player = Object.keys(room.symbols)[playerIndex];
            console.log({
                player, playerIndex
            });

            gain = player;
        }

        room.score[gain] += 1;

        room.endedGame = true;

        rooms[roomIndex] = room;

        io.to(`game-${code}`).emit('end-game', winnerInfo);
        io.to(`game-${room.code}`).emit('room-updated', room);
    });

    socket.on('reset', ({ code }) => {
        const room = rooms.find(v => v.code === code);

        if (!room || !room.endedGame) return;
        const roomIndex = rooms.findIndex(room => room?.player.includes(socket.id));

        room.matriz = [
            [],
            [],
            []
        ];

        room.endedGame = false;

        rooms[roomIndex] = room;

        io.to(`game-${code}`).emit('reset-game');
        io.to(`game-${room.code}`).emit('room-updated', room);
    })



    socket.on('create-room', async () => {
        const room = {
            code: shuffleData(genRandomNum(1000, 9999).toString().split('')).join(''),
            player: [
                socket.id
            ]
        };
        rooms.push(room)

        socket.rooms.add(`game-${room.code}`);
        (await socket.join(`game-${room.code}`))

        io.to(`game-${room.code}`).emit('room-updated', room);
    })

    socket.on('disconnect', () => {
        const roomIndex = rooms.findIndex(room => room?.player.includes(socket.id));

        if (roomIndex >= 0) {
            const room = rooms[roomIndex];
            socket.leave(`game-${room.code}`);

            const playerIndex = room.player.findIndex(playerId => playerId === socket.id);
            room.player.splice(playerIndex, 1);

            if (room.player.length === 0) {
                rooms.splice(roomIndex, 1);
            } else {
                rooms[roomIndex] = room;
                io.to(`game-${room.code}`).emit('room-updated', room);
            }
        }
    })
})

// Rotas

app.get('/', (_, res) => {
    if (process.env.NODE_ENV === 'production') return res.sendFile(`${publicFolder}/index.html`)

    res.redirect('http://localhost:3001');
})

// Rodando
server.listen(port);