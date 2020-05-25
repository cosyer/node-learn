var http = require("http");
var fs = require("fs"); //引入文件读取模块

// 需要访问的文件的存放目录
var documentRoot = "./dist";

http
  .createServer(function (req, res) {
    var url = req.url;
    // 客户端输入的url，例如如果输入localhost:8888/index.html
    // 那么这里的url == /index.html

    var file = documentRoot + url;
    console.log(file);

    fs.readFile(file, function (err, data) {
      /*
        一参为文件路径
        二参为回调函数
            回调函数的一参为读取错误返回的信息，返回空就没有错误
            二参为读取成功返回的文本内容
      */
      if (err) {
        res.writeHeader(404, {
          "content-type": 'text/html;charset="utf-8"',
        });
        res.write("<h1>404错误</h1><p>你要找的页面不存在</p>");
        res.end();
      } else {
        // 获取后缀名
        var type = file.substr(file.lastIndexOf(".") + 1, file.length);
        // 在这里设置文件类型，告诉浏览器解析方式
        res.writeHeader(200, {
          "Content-type": "text/" + type + ';charset="utf-8"',
        });
        // 根据后缀名判断文件类型不太准确 可以使用mime模块 mime.getType(filePath)
        res.write(data); // 将index.html显示在客户端
        res.end();
      }
    });
  })
  .listen(8888);

console.log("服务器开启成功，访问http://localhost:8888/index.html");
