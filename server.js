const express = require('express');

const dotent = require('dotenv')
const path = require('path');
const bot = require('./index')
const app = express();
const db = require('./db')

dotent.config()
const port = process.env.PORT;

bot
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/generating', express.static(path.join(__dirname, 'generating')));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

app.post('/pay', async (req, res) => {
  const payment = req.body;
  if (payment?.action === "order_payed") {
    const orderData = await db.getOrder(payment.innerID);
    const userData = await db.getUser(orderData.userID);
    console.log(userData);
    db.updateBalance(userData.id, payment.sum);
    if (userData.referral != '') db.updateBalance(userData.referral, payment.sum/4);
  }
  res.status(200).send('YES');
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});