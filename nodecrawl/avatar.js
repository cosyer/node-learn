/**
 * 知乎头像爬虫 https://www.zhihu.com
 */

// 需要引入的包
var request = require('request');
var fs = require('fs');
var async = require('async');

// offset=20*pageNum limit=pageSize 
var url = "https://www.zhihu.com/api/v4/members/yu-chao-81-62/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=80&limit=20";

//request请求的options
var options = {
    url: url,
    headers: {
        "authorization": "Bearer Mi4xRGViWEF3QUFBQUFBSU1KQjNudUNEQmNBQUFCaEFsVk4xU1lGV2dERnlQQzRVYXVQNVNqSmZIUnl1WWY1RkFSczJR|1507695061|f575db5eb9910d90c54f8e92ede7bb0fcfe795e0"
    }
}
var users = [];

// 获取大量的用户数据
function getDataList(url) {
    options.url = url;
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var response = JSON.parse(response.body);
            var zhList = response.data;
            zhList.forEach(function (item) {
                //item.gender == 0 性别判断
                if (item.gender == 0) {
                    console.log(`正在抓取${item.avatar_url}`)
                    users.push({
                        "name": item.name,
                        "img": item.avatar_url.replace("_is", ""),
                        "url_token": item.url_token
                    })
                }
            })
            //is_end当前用户的关注用户是否到最后一页
            if (response.paging.is_end) {
                //这里判断抓取的条数
                if (users.length <= 1000) {
                    console.log(`抓取完成`);
                    downLoadContent(JSON.stringify(users));
                    return;
                } else {
                    console.log(`第${i + 1}个用户的数据`);
                    getDataList(zurl.replace("demouser", users[i].url_token))
                    i++;
                }
            } else {
                if (users.length <= 1000) {
                    console.log(`抓取完成`);
                    downLoadContent(JSON.stringify(users));
                    return;
                }
                getDataList(response.paging.next);
            }
        }
    })
}

// 把数据下载保存到data.js
function downLoadContent(cont) {
    fs.appendFile('./' + 'data.js', "module.exports =" + cont, 'utf-8', function (err) {
        if (err) {
            console.log(err);
        } else
            console.log('success');
        startDownLoad(JSON.parse(cont));
    });
}

// 调用第三方api进行人脸识别、下载图片
var eyeUrl = "http://api.eyekey.com/face/Check/checking";

var config = {
    "app_id": "f89ae61fd63d4a63842277e9144a6bd2",
    "app_key": "af1cd33549c54b27ae24aeb041865da2",
    "url": "https://pic4.zhimg.com/43fda2d268bd17c561ab94d3cb8c80eb.jpg"
}

function face(item) {
    config.url = item.img;
    request.post({
        url: eyeUrl,
        form: config
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            try {
                // 性别为女性
                if (data.face[0].attribute.gender == 'Female') {
                    console.log(`正在下载${item.img}`);
                    downLoadImg(item)
                }
            } catch (e) {
                console.log(`验证失败${item.img}~`);
            }
        }
    })
}

// 下载图片方法
function downLoadImg(image) {
    request.head(image.img, function (err, res, body) {
        if (err) {
            console.log(err);
        }
    });
    request(image.img).pipe(fs.createWriteStream('./avatar_image/' + image.name + Date.now() + '.' + image.img.substring(image.img.lastIndexOf(".") + 1, image.img.length)));
}

// 开始下载
function startDownLoad(imgdata) {
    //控制并发量,在3个以内
    console.log(imgdata)
    async.eachLimit(imgdata, 3, function (item, callback) {
        face(item);
        callback();
    }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('success!');
        }
    });
}
getDataList(url);