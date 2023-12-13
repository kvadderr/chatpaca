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

bot.start(async (ctx) => {
  const welcome = await helpers.getWelcome(ctx.chat.username)
  const user = {
    id: ctx.chat.id,
    referral: ctx.startPayload,
  }
  await db.createUser(user);
  ctx.reply(welcome, menu.mainMenu)
})

bot.on(message('photo'), async (ctx) => {
  const photo = ctx.message.photo;
  const photoSize = photo[photo.length - 1];
  const fileId = photoSize.file_id;
  const fileLinks = await ctx.telegram.getFileLink(fileId);
  ctx.session.fileLink = fileLinks;
  await ctx.reply(helpers.getGender(), menu.gender);
})

bot.action("man", async ctx => {

  const photoQueue = helpers.getPhotoQueue();
  ctx.editMessageText(photoQueue);
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
  try {
    await ctx.replyWithMediaGroup(media)
    await ctx.reply("✅ Фото успешно сгенерировано!", menu.unlock)
  } catch (error) {
    await ctx.reply("🛑 Произошла ошибка! Повторите запрос")
  }

})

bot.action("girl", async ctx => {
  try {
    const photoQueue = helpers.getPhotoQueue();
    ctx.editMessageText(photoQueue);
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
  const welcome = await helpers.getWelcome(ctx.chat.username)
  ctx.reply(welcome, menu.mainMenu)
})

bot.action("unlock", async ctx => {
  try {
    const unlockWait = helpers.getUnlockWait();
    ctx.editMessageText(unlockWait);
    await ctx.answerCbQuery();
    const user = await db.getUser(ctx.chat.id);

    if (user.balance < 200) {
      const payMenu = await menu.getPaymentMenu(ctx.chat.id);
      ctx.editMessageText("У вас недостаточно средств. Зачисление средств произойдет в течении нескольких минут после оплаты. Проверка баланса осуществляется в профиле. После пополнения повторите процедуру генерации.", payMenu)
    } else {
      db.updateBalance(ctx.chat.id, -200);
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
  await ctx.answerCbQuery();
  const profileInfo = await helpers.getProfileInfo("@" + ctx.chat.username, ctx.chat.id)
  await ctx.editMessageText(profileInfo, menu.goBack)
})

bot.action("goBack", async ctx => {
  await ctx.answerCbQuery();
  const welcome = await helpers.getWelcome(ctx.chat.username)
  await ctx.editMessageText(welcome, menu.mainMenu)
})

bot.action("sendPhoto", async ctx => {
  await ctx.answerCbQuery();
  const photoInfo = await helpers.getPhotoInfo();
  await ctx.editMessageText(photoInfo, menu.backMenu)
})

bot.action("referral", async ctx => {
  await ctx.answerCbQuery();
  const referralInfo = await helpers.getReferralInfo(ctx.chat.id);
  await ctx.editMessageText(referralInfo, menu.referralMenu)
})


bot.action("buy", async ctx => {
  const unlockWait = helpers.getUnlockWait();
  ctx.editMessageText(unlockWait)
  const payMenu = await menu.getPaymentMenu(ctx.chat.id);
  ctx.editMessageText("Для пополнения средств перейдите в платежную систему", payMenu)
})


bot.launch()