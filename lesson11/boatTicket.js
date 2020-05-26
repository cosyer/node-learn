/**
 * 船票爬虫 踏破铁鞋网http://www.tapotiexie.com
 */
var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var mysql = require("mysql");
var dbUtil = require("./dbUtil");
var schedule = require("node-schedule"); // 定时任务

function get() {
  var domain = "http://www.tapotiexie.com";
  var url = "http://www.tapotiexie.com/Line/index/name/yt/p/";
  var txtSource = "踏破铁鞋"; //文本来源
  var startPage = 1; // 开始页
  var endPage = 3; // 结束页
  var url_list = [];
  var list = [];

  // 确定爬取的Url队列
  for (var i = startPage; i <= endPage; i++) {
    url_list.push(url + i + ".html");
  }

  async.eachSeries(
    url_list,
    function (arr_url, callback) {
      console.log("正在抓取" + arr_url + "的数据...");
      request(arr_url, function (err, data) {
        if (err) {
          return console.error(err);
        }
        // 通过cheerio的load方法解析整个文档，就是html页面所有内容，可以通过console.log($.html());在控制台查看
        var $ = cheerio.load(data.body.toString());
        $(".tptx_ytgt .tptx_ytgt_4").each(function () {
          var $me = $(this);
          //解析船公司和船字段
          var arr1 = analyStr($me.find(".tptx_ytgt_2b a").text());
          //解析晚和天
          var arr2 = analyDay($me.find(".tptx_jcyj_2ab_1 span").text());
          var item = {
            txtCompany: arr1[0], //公司
            txtCruise: arr1[1], //游轮
            txtLine: analyLine(
              $me.find(".tptx_jcyj_2ab_1 ul li:first-child").text()
            ), // 航线
            txtStartDate: analyStart(
              $me.find(".tptx_jcyj_2ab_1 li").eq(1).text(),
              $me.find(".tptx_jcyj_2ab_1 span").text()
            ),
            numDay: Number(arr2[1]), // 天数
            numNight: Number(arr2[0]), //夜数
            numPrice: analyPrice(
              $me.find(".tptx_jcyj_2ac .tptx_jcyj_2ac_1").text()
            ), // 价格
            txtUrl: domain + $me.find(".tptx_ytgt_2b a").attr("href"), //详情url
          };
          list.push(item);
        });
        callback(err, list);
      });
    },
    function (err) {
      if (err) {
        return console.error(err.stack);
      }
      /*写入数据库*/
      async.eachSeries(
        list,
        function (record, callback) {
          console.log("正在写入" + record.txtStartDate + "的数据...");
          var str = "";
          for (var i in record) {
            str += "'" + record[i] + "',";
          }
          str = str.substr(0, str.length - 1);
          console.log(str);
          // 拼接sql
          var sql =
            "INSERT INTO tb_crawl_boat_ticket (company,cruise,line,state_date,boat_day,night,price,url)values(" +
            str +
            ")";
          dbUtil
            .EXECUTE(sql)
            .then((res) => {
              console.log("res==>", res);
              // 受影响的行数
              if (res.affectedRows == 1) {
                callback(err);
              }
            })
            .catch((data) => {
              console.log("data==>", data);
            });
        },
        function (err) {
          if (err) {
            return console.error(err.stack);
          }
          console.log("处理成功！");
        }
      );
    }
  );
}

/*---------字段解析start----------*/
/*按中间的空格解析字符串*/
function analyStr(str) {
  var _newStr = "";
  for (i in str) {
    if (str[i].trim() == "") {
      _newStr += "|";
    } else {
      _newStr += str[i];
    }
  }
  return _newStr.split("||");
}

/*解析航线*/
function analyLine(str) {
  var arr1 = str.split("邮轮线路：");
  return arr1[1];
}

/*解析价格*/
function analyPrice(str) {
  if (str == "售罄") {
    return 0;
  } else {
    var arr1 = str.split("￥");
    var arr2 = arr1[1].split("起");
    return Number(arr2[0]);
  }
}

/*解析晚和天*/
function analyDay(str) {
  var arr1 = str.split("晚");
  var arr2 = arr1[1].split("天");
  var _newStr = arr1[0] + "|" + arr2[0];
  return _newStr.split("|");
}

/*解析出发日期*/
function analyStart(str1, str2) {
  var arr1 = str1.split(str2);
  var arr2 = arr1[0].split("出发时间：");
  return arr2[1];
}
/*---------字段解析end----------*/

/*执行主程序*/
get();

/*定时任务*/
// var registTask = function (hour, minute, taskname, fn) {
//     var rule = new schedule.RecurrenceRule();
//     //每天这个时刻定时执行任务
//     rule.dayOfWeek = [0, new schedule.Range(1, 6)];
//     rule.hour = hour;
//     rule.minute = minute;
//     var j = schedule.scheduleJob(rule, function () {
//         console.log("开始爬取：" + taskname); fn && fn();
//     });
// }
// registTask(20, 51, 'boatTicket', function () {
//     get();
// });
// registTask();

/*处理乱码*/
function reconvert(str) {
  str = str.replace(/(\\u)(\w{4})/gi, function ($0) {
    return String.fromCharCode(
      parseInt(escape($0).replace(/(%5Cu)(\w{4})/g, "$2"), 16)
    );
  });
  str = str.replace(/(&#x)(\w{4});/gi, function ($0) {
    return String.fromCharCode(
      parseInt(escape($0).replace(/(%26%23x)(\w{4})(%3B)/g, "$2"), 16)
    );
  });
  return str;
}
