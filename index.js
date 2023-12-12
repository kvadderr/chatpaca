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
})

bot.action("girl", async ctx => {
  const photoQueue = helpers.getPhotoQueue();
  ctx.editMessageText(photoQueue);
  const fileLink = ctx.session.fileLink;
  const data = await generate.generateImage(false, fileLink)
  const savedImage = await generate.saveImageLocally(data);
  const bluredImage = await generate.getImageBase64(savedImage);
  const media = []
  for (let i = 0; i < bluredImage.length; i++) {
    let mediaData = {
      media: { source: Buffer.from(bluredImage[i], 'base64') }, type: 'photo'
    }
    media.push(mediaData)
  }
  await ctx.replyWithMediaGroup(media)
  await ctx.reply(menu.unlock)
})

bot.on(message('text'), async (ctx) => {
  const welcome = await helpers.getWelcome(ctx.chat.username)
  ctx.reply(welcome, menu.mainMenu)
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
  await ctx.editMessageText(photoInfo, menu.goBack)
})

bot.action("referral", async ctx => {
  await ctx.answerCbQuery();
  const referralInfo = await helpers.getReferralInfo(ctx.chat.id);
  await ctx.editMessageText(referralInfo, menu.referralMenu)
})


bot.launch()