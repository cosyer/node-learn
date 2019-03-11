var request = require("request"); // 用于请求地址和快速下载图片流。
var cheerio = require("cheerio"); // 快速、灵活、实施的jQuery核心实现. 便于解析html代码。
var async = require("async"); // 异步调用，防止堵塞。
var mysql = require("mysql"); // 进行数据存储
var schedule = require("node-schedule"); // 定时任务

var objs = [{ name: "A" }, { name: "B" }, { name: "C" }];

function doSomething(obj, cb) {
  console.log("我在做" + obj.name + "这件事!");
  cb(null, obj);
}

let index = 4;

switch (index) {
  // 发送http请求
  case 0:
    request("http://www.baidu.com", function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body); // response.body
      }
    });
    break;

  // cheerio解析dom
  case 1:
    request("http://www.baidu.com", function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body.toString());
        console.log($("title").text());
      }
    });
    break;

  // 异步流程控制
  case 2:
    async.eachSeries(
      objs,
      function(obj, callback) {
        doSomething(obj, function() {
          callback("err");
        });
      },
      function(err) {
        console.log("err is:" + err);
      }
    );
    break;

  // 数据库
  case 3:
    // 创建连接
    var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "crawl"
    });
    connection.connect();
    // 查询
    connection.query("SELECT * FROM tb_crawl_boat_ticket", function(
      err,
      rows,
      fields
    ) {
      if (err) throw err;
      console.log("The solution is: ", rows[0]);
    });
    // 关闭连接
    connection.end();
    break;

  // 定时任务
  case 4:
    // 每隔5秒执行 [1,6,11......]
    var rule = new schedule.RecurrenceRule();
    var times = [];
    for (var i = 1; i < 60; i += 5) {
      times.push(i);
    }
    rule.second = times;
    schedule.scheduleJob(rule, function() {
      console.log("开始执行" + new Date());
    });
    break;
}
