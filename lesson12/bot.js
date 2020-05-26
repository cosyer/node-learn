const { Wechaty, MediaMessage, Room } = require("wechaty");
const QrcodeTerminal = require("qrcode-terminal");
const path = require("path");
const QRODE_IMAGE_FILE = path.join(__dirname, "qrcode.jpg");

Wechaty.instance() // Singleton
  .on("scan", (url, code) => {
    let loginUrl = url.replace("qrcode", "l");
    QrcodeTerminal.generate(loginUrl);
    console.log(url);
  })
  .on("login", (user) => console.log(`User ${user} logined`))
  .on("friend", async (contact, request) => {
    if (request) {
      if (/JavaScript|Js/i.test(request.hello)) {
        logMsg = 'accepted because verify messsage is "JS"';
        request.accept();
      } else {
        logMsg =
          "not auto accepted, because verify message is: " + request.hello;
      }
    } else {
      logMsg = "friend ship confirmed with " + contact.get("name");
    }
  })
  .on("message", async (message) => {
    const contact = message.from();
    const content = message.content();
    const room = message.room();
    if (room) {
      console.log(
        `Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`
      );
    } else {
      console.log(`Contact: ${contact.name()} Content: ${content}`);
    }

    if (message.self()) {
      return;
    }

    if (content === "指令") {
      await message.say(
        `欢迎欢迎。。。
        你可以回复以下指令：
        回复【指令】查看指令
        回复【js】自动回复
        回复【加群】自动加群`
      );
      await message.say(new MediaMessage(QRODE_IMAGE_FILE));
    }

    if (/cosyer/i.test(content)) {
      await message.say("cosyer");
      await message.say(new MediaMessage(QRODE_IMAGE_FILE));
    }

    if (/加群/.test(content)) {
      let keyroom = await Room.find({ topic: "test" });
      if (keyroom) {
        await keyroom.add(contact);
        await keyroom.say("欢迎新朋友！", contact);
      }
    }
  })
  .start();
