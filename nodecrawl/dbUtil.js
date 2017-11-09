'use strict';
const mysql = require('mysql');
var local = true
var pool

// 创建连接池
if (local) {
    pool = mysql.createPool({
        connectionLimit: 50,
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'crawl',
        multipleStatements: true  //是否允许执行多条sql语句
    });
} else {
    pool = mysql.createPool({
        connectionLimit: 50,
        host: '182.254.153.189',
        user: 'root',
        password: 'websoft9',
        database: 'motion',
        multipleStatements: true  //是否允许执行多条sql语句
    });
}

//将结果已对象数组返回
var row = (sql, ...params) => {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
                return;
            }
            connection.query(sql, params, function (error, res) {
                connection.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    });
};

//返回一个对象
var first = (sql, ...params) => {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
                return;
            }
            connection.query(sql, params, function (error, res) {
                connection.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(res[0] || null);
            });
        });
    });
};

//返回单个查询结果
var single = (sql, ...params) => {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
                return;
            }
            connection.query(sql, params, function (error, res) {
                connection.release();
                if (error) {
                    reject(error);
                    return;
                }
                for (let i in res[0]) {
                    resolve(res[0][i] || null);
                    return;
                }
                resolve(null);
            });
        });
    });
}

//执行代码，返回执行结果
var execute = (sql, ...params) => {
    return new Promise(function (resolve, reject) {
        // 获取连接
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
                return;
            }
            // 操作数据库
            connection.query(sql, params, function (error, res) {
                // 释放
                connection.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    });
}

//模块导出
module.exports = {
    ROW: row,
    FIRST: first,
    SINGLE: single,
    EXECUTE: execute
}

/*连接mysql*/
function connectToMysql() {
    var connection = mysql.createConnection({
        host: '182.254.153.189',
        user: 'root',
        password: 'websoft9',
        database: 'motion'
    });
    connection.connect();
    //查询
    connection.query('SELECT * FROM user;', function (err, rows, fields) {
        if (err) throw err;
        console.log('The solution is: ', rows[0]);
    });
    //关闭连接
    connection.end();
}