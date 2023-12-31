const { Telegraf } = require('telegraf')
const session = require('telegraf-session-local');
const { message } = require('telegraf/filters')
const helpers = require('./helpers')
const menu = require('./menu')
const generate = require('./generate')
const db = require('./db')

const bot = new Telegraf('6618126808:AAFPV2gtmiMu8ODnxxO05Sklr6F-AfWgh0A')

const LocalSession = new session();
bot.use(LocalSession.middleware());


db.createDB();

async function sendPaymentInfo(userID) {
  await bot.telegram.sendMessage(userID, `✅ Ваш баланс пополнен ✅`, menu.unlockAfterPay)
}

bot.start(async (ctx) => {
  try {
    const welcome = await helpers.getWelcome(ctx.chat.username)
    const user = {
      id: ctx.chat.id,
      referral: ctx.startPayload,
    }
    db.createUser(user);
    await ctx.reply(welcome, menu.mainMenu)
  } catch {

  }
})

bot.on(message('photo'), async (ctx) => {
  try {
  const photo = ctx.message.photo;
  const photoSize = photo[photo.length - 1];
  const fileId = photoSize.file_id;
  const fileLinks = await ctx.telegram.getFileLink(fileId);
  ctx.session.fileLink = fileLinks;
  await ctx.reply(helpers.getGender(), menu.gender); } catch { }
})

bot.action("man", async ctx => {

  
  try {
    const photoQueue = helpers.getPhotoQueue();
    await ctx.editMessageText(photoQueue);
    const fileLink = ctx.session.fileLink;
    const data = await generate.generateImage(true, fileLink)
    const savedImage = await generate.saveImageLocally(data);
    db.savePhoto(ctx.chat.id, savedImage[0], savedImage[1], savedImage[2])
    const bluredImage = await generate.getImageBase64(savedImage);
    const media = []
    for (let i = 0; i < bluredImage.length; i++) {
      let mediaData = {
        media: { source: Buffer.from(bluredImage[i], 'base64') }, type: 'photo'
      }
      media.push(mediaData)
    }

    await ctx.replyWithMediaGroup(media)
    await ctx.reply("✅ Фото успешно сгенерировано!", menu.unlock)
  } catch (error) {
    await ctx.reply("🛑 Произошла ошибка! Повторите запрос")
  }

})

bot.action("girl", async ctx => {
  try {
    const photoQueue = helpers.getPhotoQueue();
    await ctx.editMessageText(photoQueue);
    const fileLink = ctx.session.fileLink;
    const data = await generate.generateImage(false, fileLink)
    const savedImage = await generate.saveImageLocally(data);
    db.savePhoto(ctx.chat.id, savedImage[0], savedImage[1], savedImage[2])
    const bluredImage = await generate.getImageBase64(savedImage);
    const media = []
    for (let i = 0; i < bluredImage.length; i++) {
      let mediaData = {
        media: { source: Buffer.from(bluredImage[i], 'base64') }, type: 'photo'
      }
      media.push(mediaData)
    }
    await ctx.replyWithMediaGroup(media)
    await ctx.reply("✅ Фото успешно сгенерировано!", menu.unlock)
  } catch (error) {
    await ctx.reply("🛑 Произошла ошибка! Повторите запрос")
  }
})

bot.on(message('text'), async (ctx) => {
  try {
  const welcome = await helpers.getWelcome(ctx.chat.username)
  await ctx.reply(welcome, menu.mainMenu) } catch { } 
})

bot.action("unlock", async ctx => {
  try {
    const unlockWait = helpers.getUnlockWait();
    await ctx.editMessageText(unlockWait);
    await ctx.answerCbQuery();
    const user = await db.getUser(ctx.chat.id);

    if (user.balance < 199) {
      const payMenu = await menu.getPaymentMenu(ctx.chat.id);
      await ctx.editMessageText("У вас недостаточно средств. Зачисление средств произойдет в течении нескольких минут после оплаты. Проверка баланса осуществляется в профиле. После пополнения повторите процедуру генерации.", payMenu)
    } else {
      db.updateBalance(ctx.chat.id, -199);
      const photoPath = await db.getPhotoPath(ctx.chat.id)
      const media = Array.from({ length: 3 }, (_, i) => ({
        media: { source: photoPath[i].path },
        type: 'photo'
      }));
      await ctx.replyWithMediaGroup(media)
    }
  } catch (error) {
    await ctx.reply("🛑 Произошла ошибка! Повторите запрос")
  }
})

bot.action("profile", async ctx => {
try {
  await ctx.answerCbQuery();
  const profileInfo = await helpers.getProfileInfo("@" + ctx.chat.username, ctx.chat.id)
  await ctx.editMessageText(profileInfo, menu.goBack) } catch { } 
})

bot.action("goBack", async ctx => {
try {
  await ctx.answerCbQuery();
  const welcome = await helpers.getWelcome(ctx.chat.username)
  await ctx.editMessageText(welcome, menu.mainMenu) } catch { } 
})

bot.action("sendPhoto", async ctx => {
  try {
  await ctx.answerCbQuery();
  const photoInfo = await helpers.getPhotoInfo();
  await ctx.editMessageText(photoInfo, menu.backMenu) } catch { } 
})

bot.action("referral", async ctx => {
  try {
  await ctx.answerCbQuery();
  const referralInfo = await helpers.getReferralInfo(ctx.chat.id);
  await ctx.editMessageText(referralInfo, menu.referralMenu) } catch { }
})


bot.action("buy", async ctx => {
  try {
  const payMenu = await menu.getPaymentMenu(ctx.chat.id);
  await ctx.editMessageText("Для пополнения средств перейдите в платежную систему", payMenu) } catch {}
})


bot.launch()

module.exports = {
  sendPaymentInfo
}
