var http = require('http');
var spawn = require('child_process').spawn;
var createHandler = require('github-webhook-handler');
var handler = createHandler({path: '/', secret: 'rAfK2rr7^R28#h$A'});
var fs = require('fs');

/**
 * 创建服务
 */
http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.send(err);
        res.end('no such location');
    });
}).listen(7777);

/**
 * 出错时触发
 */
handler.on('error', function (err) {
    console.error('Error:', err.message);
});

/**
 * 收到push时触发
 */
handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);

    fs.access('./auto_build.sh', fs.constants.R_OK, (err) => { // 检查文件是否可读
        console.log(`${err ? 'shell文件不存在' : '检查通过'}`);
        if (!err) {
            // 执行指定的shell文件
            runCommand('sh', ['./auto_build.sh'], function (txt) {
                console.log(txt);
            });
        }
    });
});

/*handler.on('issues', function (event) {
    console.log('Received an issue event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.action,
        event.payload.issue.number,
        event.payload.issue.title);
});*/

/**
 * 执行命令
 * @param cmd
 * @param args
 * @param callback
 */
function runCommand(cmd, args, callback) {
    var child = spawn(cmd, args);
    child.stdout.on('data', function (buffer) {
        resp += buffer.toString();
    });
    child.stdout.on('end', function () {
        callback(resp);
    });
}