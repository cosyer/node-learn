const http = require("http");
const url = require("url");
const fs = require("fs"); //引入fs模块 文件 I/O

const hostname = "127.0.0.1";
const port = 3000;

function parsetime(time) {
  return {
    hour: time.getHours(),
    minute: time.getMinutes(),
    second: time.getSeconds(),
  };
}

function unixtime(time) {
  return { unixtime: time.getTime() };
}

const server = http.createServer((req, res) => {
  //创建一个http服务器
  let parsedUrl = url.parse(req.url, true);
  let time = new Date(parsedUrl.query.iso);
  let result;

  // 将客户端的请求信息保存在log.txt中
  if (req.url) {
    let out = fs.createWriteStream("./log.txt"); // 创建写入流
    out.write(`请求方法：${req.method} \n`);
    out.write(`请求url：${req.url} \n`);
    out.write(`请求头对象：${JSON.stringify(req.headers, null, 4)} \n`);
    out.write(`请求http版本：${req.httpVersion} \n`);
  }

  if (req.url == "/") {
    result = parsetime(new Date());
  } else if (/^\/api\/parsetime/.test(req.url)) {
    result = parsetime(time);
  } else if (/^\/api\/unixtime/.test(req.url)) {
    result = unixtime(time);
  }

  if (result) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, hostname, () => {
  console.log(`服务器运行在 http://${hostname}:${port}`);
});
