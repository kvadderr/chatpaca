const { Markup } = require('telegraf')
const helpers = require('./helpers')

const mainMenu = Markup.inlineKeyboard([
  Markup.button.callback("📷 Отправить фото", "sendPhoto"),
  Markup.button.url("🆘 Поддержка", "https://t.me/HR_promo"),
  Markup.button.callback("👤 Профиль", "profile"),
  Markup.button.callback("🫂 Реферальная программа", "referral"),
], { wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2, })

const goBack = Markup.inlineKeyboard([
  Markup.button.callback("🛒 Купить генерации", "buy"),
  Markup.button.callback("⬅️ Назад", "goBack"),
])

const referralMenu = Markup.inlineKeyboard([
  Markup.button.url("💸 Вывести средства", "https://t.me/HR_promo"),
  Markup.button.callback("⬅️ Назад", "goBack"),
])

const backMenu = Markup.inlineKeyboard([
  Markup.button.callback("⬅️ Назад", "goBack"),
])

const gender = Markup.inlineKeyboard([
  Markup.button.callback("👨 Мужчина ", "man"),
  Markup.button.callback("👩‍🦰 Женщина", "girl"),
])

const unlock = Markup.inlineKeyboard([
  Markup.button.callback("Разблокировать (-199) ", "unlock"),
])

const unlockAfterPay = Markup.inlineKeyboard([
  Markup.button.callback("Разблокировать (-199) ", "unlock"),
  Markup.button.callback("Главное меню ", "goBack"),
], { wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2, })

async function getPaymentMenu(userID) {
  const paymentLink = await helpers.generateOrder(userID);
  const buyGeneration = Markup.inlineKeyboard([
    Markup.button.url("💸 Внести средства", paymentLink.result),
    Markup.button.callback("🖥 Главное меню", "goBack"),
  ])
  return buyGeneration
}


module.exports = {
  mainMenu,
  goBack,
  referralMenu,
  gender,
  unlock,
  backMenu,
  unlockAfterPay,
  getPaymentMenu,
}