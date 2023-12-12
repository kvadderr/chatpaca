const express = require('express');
const bot = require('./index')
const app = express();
const port = 4000;

bot
// Определение маршрута
app.get('/', (req, res) => {
  res.send('Привет, мир!');
});

// Слушаем порт
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});