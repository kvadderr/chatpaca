const { Markup } = require('telegraf')

const mainMenu = Markup.inlineKeyboard([
  Markup.button.callback("📷 Отправить фото", "sendPhoto"),
  Markup.button.url("🆘 Поддержка", "https://t.me/Ispolline"),
  Markup.button.callback("👤 Профиль", "profile"),
  Markup.button.callback("🫂 Реферальная программа", "referral"),
], { wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2, })

const goBack = Markup.inlineKeyboard([
  Markup.button.callback("🛒 Купить генерации", "buy"),
  Markup.button.callback("⬅️ Назад", "goBack"),
])

const referralMenu = Markup.inlineKeyboard([
  Markup.button.url("💸 Вывести средства", "https://t.me/Ispolline"),
  Markup.button.callback("⬅️ Назад", "goBack"),
])

const gender = Markup.inlineKeyboard([
  Markup.button.callback("👨 Мужчина ","man"),
  Markup.button.callback("👩‍🦰 Женщина", "girl"),
])

const unlock = Markup.inlineKeyboard([
  Markup.button.callback("Разблокировать (-200₽) ","unlock"),
])


module.exports = {
  mainMenu,
  goBack,
  referralMenu,
  gender,
  unlock
}