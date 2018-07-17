'use strict';

let blockDB = require('./block-db');
let util = require('util');

function blockList(size, asc) {
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select * from block order by number %s limit ?', order);

    return blockDB.query(selectSQL, [size]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function txHistory(day) {
    let selectSQL = 'SELECT DATE(datetime) datetime,COUNT(*) count FROM transaction WHERE DATE_SUB(CURDATE(),' +
        'INTERVAL ? DAY) <= DATE(datetime) GROUP BY DATE(datetime)';
    return blockDB.query(selectSQL, [day]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function txNumber() {
    let selectSQL = 'select sum(tx_count) as tx from block';
    return blockDB.query(selectSQL).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows[0].tx}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function txList(size, asc) {
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select * from transaction order by tx_index %s limit ?', order);

    return blockDB.query(selectSQL, [size]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function peerNumber() {
    let selectSQL = 'SELECT COUNT(*) AS COUNT FROM peer';
    return blockDB.query(selectSQL).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows[0].COUNT}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function tokenHolders(number) {
    let count = (number && parseInt(number) > 0 && parseInt(number) < 1000) ? parseInt(number) : 100;
    let selectSQL = 'select * from account limit ?;';
    return blockDB.query(selectSQL, [count]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function specifyTokenHolders(tokenName, asc, number) {
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let count = (number && parseInt(number) > 0 && parseInt(number) < 1000) ? parseInt(number) : 100;

    let selectSQL = util.format('select * from token where coin_type = ? order by balance+0 %s limit ?', order);
    return blockDB.query(selectSQL, [tokenName, count]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function tokenHoldersByPage(page, size) {
    let start = (page - 1) * size;
    let sql = 'select count(*) as COUNT from account; select * from account limit ?,?';
    return blockDB.query(sql, [start, parseInt(size)]).then((rows) => {
        let allCount = rows[0][0].COUNT;
        if (allCount <= 0) throw 'no data';

        let allPage = parseInt(allCount) / size;
        let pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        if (page > allPage) throw 'query page more than maximum of page';

        return {
            status: 200,
            message: {"success": true, "total": allCount, "totalPages": allPage, "currentPage": page, "data": rows[1]}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function specifyTokenHoldersByPage(tokenName, page, size, asc) {
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    // let selectSQL = util.format('SELECT COUNT(*) AS COUNT FROM token WHERE coin_type = ?; ' +
    //     'SELECT * FROM token WHERE coin_type = ? order by balance+0 %s limit ?,?', order);

    let selectSQL = util.format('select count(*) as COUNT from token where coin_type = ?;' +
        'select * from (select address from token where coin_type = ? order by balance+0 %s limit ?,?) a ' +
        'left join token b on a.address = b.address where coin_type = ?;', order);

    let start = (page - 1) * size;
    return blockDB.query(selectSQL, [tokenName, tokenName, start, parseInt(size), tokenName]).then((rows) => {
        let allCount = rows[0][0].COUNT;
        if (allCount <= 0) throw 'no data';

        let allPage = parseInt(allCount) / size;
        let pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        if (page > allPage) throw 'query page more than maximum of page';

        return {
            status: 200,
            message: {"success": true, "total": allCount, "totalPages": allPage, "currentPage": page, "data": rows[1]}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function transferRecord(address, tokenName, asc, input, number) {
    let order = (asc && asc == 1) ? 'asc' : 'desc';
    let count = (number && parseInt(number) > 0) ? parseInt(number) : 100;
    let selectSQL;
    if (input && input == 1) {
        selectSQL = util.format('select * from (select tx_index from transfer where to_address = ? ' +
            'and token_name = ? order by tx_index %s limit ?) a ' +
            'left join transfer b on a.tx_index = b.tx_index;', order);
    } else {
        selectSQL = util.format('select * from (select tx_index from transfer where from_address = ? ' +
            'and token_name = ? order by tx_index %s limit ?) a ' +
            'left join transfer b on a.tx_index = b.tx_index;', order);
    }

    return blockDB.query(selectSQL, [address, tokenName, count]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function accountTransferRecord(address, asc, input, number) {
    let order = (asc && asc == 1) ? 'asc' : 'desc';
    let count = (number && parseInt(number) > 0) ? parseInt(number) : 100;
    let selectSQL;
    if (input && input == 1) {
        selectSQL = util.format('select * from (select tx_index from transfer where to_address = ?' +
            ' order by tx_index %s limit ?) a left join transfer b on a.tx_index = b.tx_index;', order);
    } else {
        selectSQL = util.format('select * from (select tx_index from transfer where from_address = ?' +
            ' order by tx_index %s limit ?) a left join transfer b on a.tx_index = b.tx_index;', order);
    }

    return blockDB.query(selectSQL, [address, count]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function tokenTransferRecord(tokenName, asc, number) {
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let count = (number && parseInt(number) > 0) ? parseInt(number) : 100;

    let selectSQL = util.format('select * from (select tx_index from transfer where token_name = ?' +
        ' order by tx_index %s limit ?) a left join transfer b on a.tx_index = b.tx_index;', order);

    return blockDB.query(selectSQL, [tokenName, count]).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function queryDataByPage(sql, param, page, size) {
    return blockDB.query(sql, param).then((rows) => {
        let allCount = rows[0][0].COUNT;
        if (allCount <= 0) throw 'no data';

        let allPage = parseInt(allCount) / size;
        let pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        if (page > allPage) throw 'query page more than maximum of page';

        return {
            status: 200,
            message: {"success": true, "total": allCount, "totalPages": allPage, "currentPage": page, "data": rows[1]}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function issuedTokenNumber() {
    let selectSQL = 'select COUNT(*) as token from issue_token';
    return blockDB.query(selectSQL).then((rows) => {
        return {
            status: 200,
            message: {"success": true, "data": rows[0].token}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

function issuedTokenInfo() {
    let selectSQL = 'select * from issue_token';
    return blockDB.query(selectSQL).then((rows) => {
        if (rows.length <= 0) throw 'no data';
        return {
            status: 200,
            message: {"success": true, "data": rows}
        };
    }, (err) => {
        throw err;

    }).catch((err) => {
        return {
            status: 500,
            message: {"success": false, "error": err}
        };
    });
}

exports.blockList = blockList;
exports.txHistory = txHistory;
exports.txNumber = txNumber;
exports.txList = txList;
exports.peerNumber = peerNumber;
exports.tokenHolders = tokenHolders;
exports.specifyTokenHolders = specifyTokenHolders;
exports.tokenHoldersByPage = tokenHoldersByPage;
exports.specifyTokenHoldersByPage = specifyTokenHoldersByPage;
exports.transferRecord = transferRecord;
exports.accountTransferRecord = accountTransferRecord;
exports.tokenTransferRecord = tokenTransferRecord;
exports.queryDataByPage = queryDataByPage;
exports.issuedTokenNumber = issuedTokenNumber;
exports.issuedTokenInfo = issuedTokenInfo;