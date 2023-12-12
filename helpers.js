const db = require('./db')

const welcome = "✋ Приветствую, "
const welcome_2 = ". \nНаш сервис предоставляет сервис по генерации AI изображений"

const huge = "💰 Заработай 40% от продаж!"
const profile = "👤 Профиль: "
const refferals = "\n👭 Рефералов: "
const earned = "\n💸 Заработано: "
const currentBalance = "\n✅ Баланс: "
const link = "\n\n\n🔗 Индивидуальная реферальная ссылка: \n"

function getWelcome(name) {
  return welcome + name + welcome_2;
}

async function getProfileInfo(name, id) {
  const profileInfo = await db.getUser(id)
  console.log('profileInfo', profileInfo)
  return profile + name + earned + profileInfo?.earned + currentBalance + profileInfo?.balance;
}

function getPhotoInfo() {
  return "ЗДЕСЬ ТЕКСТ ДЛЯ ТОГО ЧТОБЫ ОБЪЯСНИТЬ ЧТО НАДО ЗАГРУЗИТЬ ФОТКУ ЧЕРЕЗ ЗАКРЕП  https://teletype.in/@kvadder/xLdh-pgetYi"
}

async function getReferralInfo(userID) {
  const profileInfo = await db.getUser(userID)
  const referralCount = await db.getReferralCount(userID);
  console.log('profileInfo', referralCount)
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
  getGender
}