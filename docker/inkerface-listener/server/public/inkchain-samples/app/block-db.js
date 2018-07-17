/**
 * Created by zhangtailin on 2018/3/6.
 */
let mysql = require('mysql');
let log4js = require('log4js');
let config = require("../../../config/config.json");
var logger = log4js.getLogger('blockdb');

logger.setLevel('DEBUG');

let pool = mysql.createPool({
    host     : config.dbHost,
    user     : config.dbUserName,
    password : config.dbPassword,
    port: config.dbPort,
    database: config.dbName,
    multipleStatements: true
});

let query = (sql, param) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, param, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
}

exports.query = query;
