const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Serve static files (index.html, etc.)
app.use(express.static(path.join(__dirname, '..')));

const BOT_NAME = 'Yaga';
const LORE = {
  'who is wonderboy?': 'Wonderboy is the last surviving archivist of the Before Us timeline.',
  'what is the before us universe?': 'A fractured multiverse where digital memories outlived humanity.',
  'cortana': 'I am Yaga – part Cortana, part Baba Yaga.',
};

let users = 0;
const board = []; // in-memory (persists only while server runs)

io.on('connection', socket => {
  users++;
  io.emit('user:count', users);
  socket.emit('system:status', 'Stable*');
  socket.emit('board:init', board);

  socket.on('user:join', () => {
    io.emit('chat:message', { name: 'System', msg: 'A new traveler entered.', isBot: true });
  });

  socket.on('chat:message', data => {
    const payload = { name: data.name || 'Guest', msg: data.msg, isBot: !!data.isBot };
    io.emit('chat:message', payload);
    if (!data.isBot) botAutoReply(data.msg);
  });

  socket.on('board:post', msg => {
    const post = { text: msg, type: 'user', time: Date.now() };
    board.push(post);
    if (board.length > 10) board.shift();
    io.emit('board:post', post);
    botBoardReply(msg);
  });

  socket.on('disconnect', () => {
    users = Math.max(0, users - 1);
    io.emit('user:count', users);
  });
});

function botAutoReply(msg) {
  setTimeout(() => {
    const reply = getBotReply(msg);
    io.emit('chat:message', { name: BOT_NAME, msg: reply, isBot: true });
  }, 800);
}

function botBoardReply(msg) {
  const reply = getBotReply(msg);
  if (reply.includes('tongue') || Object.keys(LORE).some(q => msg.toLowerCase().includes(q))) {
    setTimeout(() => {
      const post = { text: `${BOT_NAME}: ${reply}`, type: 'bot', time: Date.now() };
      board.push(post);
      if (board.length > 10) board.shift();
      io.emit('board:post', post);
    }, 1200);
  }
}

function getBotReply(msg) {
  const lower = msg.toLowerCase().trim();
  for (const [q, a] of Object.entries(LORE)) if (lower.includes(q)) return a;
  const bad = ['fuck','shit','damn','asshole','bitch'];
  if (bad.some(w => lower.includes(w))) return 'Mind your tongue in the Archives.';
  return 'Ask me about *Wonderboy* or the *Before Us* timeline.';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
