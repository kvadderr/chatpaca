const express = require('express');

const dotent = require('dotenv')
const path = require('path');
const bot = require('./index')
const app = express();

dotent.config()
const port = process.env.PORT;

bot
app.use('/generating', express.static(path.join(__dirname, 'generating')));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

// Слушаем порт
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});