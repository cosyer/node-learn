# node打造微信个人号机器人

现在，日常生活已经离不开微信，本文将会抛砖引玉演示如何使用[wechaty](https://github.com/Chatie/wechaty)操作微信个人号做一些有意思的东西，可以实现自动通过好友请求、关键词回复、自动拉群等功能。大大提高了社群运营的效率。

wechaty（[https://github.com/Chatie/wechaty](https://github.com/Chatie/wechaty)）是一款开源的微信个人号SDK，进行了一系列的封装，提供简单好用的接口，然后开发者可以在其之上进行微信机器人的开发。你可以用它来做很多事：

1）管理和维护好友；
2）快速有序地处理聊天信息 
3）微信群管理
4）实现自动回复
5）……

## 一、快速上手

wechaty 项目主页写着 6行代码创建一个微信机器人，那么我们就来试一试。**注意：Node.js version >= 8.5**

The World's Shortest ChatBot Code: 6 lines of JavaScript

```javascript
const { Wechaty } = require('wechaty')

Wechaty.instance() // Singleton
.on('scan', (url, code) => console.log(`Scan QR Code to login: ${code}\n${url}`))
.on('login',       user => console.log(`User ${user} logined`))
.on('message',  message => console.log(`Message: ${message}`))
.start()
```
这6行代码实现了登录微信个人号并打印出所收到的消息。

wechaty 可以通过Docker和NPM两种方式运行，本文使用npm方式

`node bot.js` 启动这个个人号机器人，这时命令行会打印出一个链接，我们将它在浏览器中打开可以看到这是个二维码，扫码即可登录

```bash
User Contact<cosyer> logined // 扫码登录
Message: Message<咸鱼的小家园> // 接收微信消息
```

## 二、自动通过好友请求

通过前面的示例代码，可以发现这个库的简洁强大了吧。接着我们来实现第一个小功能：自动通过好友请求

```javascript
//···
.on('friend', async (contact, request) => {
    if (request) {
        if (/cosyer/i.test(request.hello)) {
            logMsg = 'accepted because verify messsage is "cosyer"'
            request.accept()
        } else {
            logMsg = 'not auto accepted, because verify message is: ' + request.hello
        }
    } else {
        logMsg = 'friend ship confirmed with ' + contact.get('name')
    }
})
//···
```

这里我们通过监听`friend` 事件。可以获取到谁发了什么好友请求。

每次都复制链接到浏览器打开二维码在扫码一点儿都不酷也不方便在服务器上使用。这时我们可以用[qrcode-terminal](https://github.com/gtanner/qrcode-terminal) 这个包 直接在命令行中打印出二维码。

```javascript
//···
const QrcodeTerminal  = require('qrcode-terminal')
//···
  .on('scan', (url, code) => {
    let loginUrl = url.replace('qrcode', 'l')
    QrcodeTerminal.generate(loginUrl)
    console.log(url)
  })
//···
```

再运行`node bot.js`命令行将直接打印出二维码，方便了很多。

## 三、自动回复

现在来实现第二个小功能：关键词自动回复。

```javascript
//···
.on('message', async (message) => {
    const contact = message.from()
    const content = message.content()
    const room = message.room()
    if (room) {
        console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`)
    } else {
        console.log(`Contact: ${contact.name()} Content: ${content}`)
    }
    
	// 不处理自己发的消息
    if (message.self()) {
        return
    }

    if (/cosyer/.test(content)) {
        message.say('cosyer')
    }
})
//···
```

在上面 我们监听` message` 来做消息处理。message 可以接收到所有的消息，我们可以判断是不是群聊消息、根据消息回复相应内容。如发送【 cosyer 】将会收到设置好的消息，实现自动回复。



## 三、自动拉群

前面说到了消息关键词自动回复，把消息处理和群管理结合起来，我们就可以实现根据关键字自动拉群了

```
//···
.on('message', async (message) => {
    const contact = message.from()
    const content = message.content()
    const room = message.room()
    if (room) {
        console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`)
    } else {
        console.log(`Contact: ${contact.name()} Content: ${content}`)
    }
    
    if (message.self()) {
        return
    }


    if (/cosyer/.test(content)) {
        message.say('cosyer？')
    }
    // 自动拉群
    if (/加群/.test(content)) {
      let keyroom = await Room.find({ topic: 'test' })
      if (keyroom) {
        await keyroom.add(contact)
        await keyroom.say('欢迎新朋友！', contact)
      }
    }
})
//···
```

上面的代码通过`Room` 来操作群聊。 此时回复 【加群】即可被自动拉入群中。当然了，我们还可以做得更多如使用`Room.del`来讲某个群员踢出去。

更多参见官方文档：https://chatie.io/wechaty

## 四、总结

本文通过wechaty实现了三个小功能向大家介绍了wechaty这个库的基本使用，还有更多功能等着去探索。大家可以根据自己的需要定制出强大的个人微信号机器人。
