const db = require('./db')
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const uuid = uuidv4();
const axios = require('axios')
const welcome = "✋ Приветствую, "
const welcome_2 = ". \nНаш сервис предоставляет сервис по генерации AI изображений. Загрузите ваше селфи."

const huge = "💰 Заработай 40% от продаж!"
const profile = "👤 Профиль: "
const refferals = "\n👭 Рефералов: "
const earned = "\n💸 Заработано: "
const currentBalance = "\n✅ Баланс: "
const link = "\n\n\n🔗 Индивидуальная реферальная ссылка: \n"

function getWelcome(name) {
  return welcome + name + welcome_2;
}

async function generateOrder(userID) {
  innerID = uuid;
  project = process.env.PROJECT_ID;
  sum = process.env.SUM;
  currency = process.env.CURRENCY;
  email = "sumbembaev.b@gmail.com"

  db.createOrder(innerID, userID);
  const combinedString = process.env.SECRET1 + 'initPayment' + project + sum + currency + innerID + email;
  const md5Hash = crypto.createHash('md5').update(combinedString).digest('hex');
  const formData = new URLSearchParams();
  formData.append('action', 'initPayment');
  formData.append('innerID', innerID);
  formData.append('project', project);
  formData.append('sum', sum);
  formData.append('currency', currency);
  formData.append('email', email);
  formData.append('sign', md5Hash);

  try {
    // Отправка POST-запроса на внешний API
    const response = await axios.post("https://pay.primepayments.io/API/v2/", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Возврат данных из ответа API
    return response.data;
  } catch (error) {
    // Обработка ошибок, если они возникнут при отправке запроса
    console.error('Error during API request:', error.message);
    throw error; // Перебрасывание ошибки для дальнейшей обработки
  }
}

async function getProfileInfo(name, id) {
  const profileInfo = await db.getUser(id)
  return profile + name + earned + profileInfo?.earned + currentBalance + profileInfo?.balance;
}

function getPhotoInfo() {
  return "Загрузите ваше сэлфи или изображение, после загрузки выберете пол персонажей."
}

function getUnlockWait() {
  return "Ожидайте пару секунд"
}

async function getReferralInfo(userID) {
  const profileInfo = await db.getUser(userID)
  const referralCount = await db.getReferralCount(userID);
  const referralLink = 'https://t.me/SlovoPacanaAIBot?start=' + userID;
  return huge + "\n" + refferals + referralCount.referralCount + earned + profileInfo.earned + currentBalance + profileInfo.balance + link + referralLink
}

function getPhotoQueue() {
  const first = "⏳ Фото в очереди, ожидание: 1 мин."
  const second = "\n🙅‍♂️‍ Я не храню присланные вами фотографии и результаты. Все анонимно. "
  return first + second
}

function getGender() {
  const second = "\n⠀⠀👇⠀⠀⠀⠀Выбери⠀⠀⠀⠀👇"
  return second
}

module.exports = {
  getWelcome,
  getProfileInfo,
  getPhotoInfo,
  getReferralInfo,
  getPhotoQueue,
  getGender,
  getUnlockWait,
  generateOrder
}