const http = require('http');
const spawn = require('child_process').spawn;
const createHandler = require('github-webhook-handler');
const fs = require('fs');
/*const log4js = require('log4js');
log4js.configure({ // 日志配置
    appenders: {
        file: {
            type: 'file',
            filename: 'app.log'
        }
    },
    categories: {
        default: {
            appenders: ['file'],
            level: 'debug'
        }
    }
});
const logger = log4js.getLogger();*/

/**
 * 处理器
 * 支持多个处理器，约定：path为[/仓库名]，secret分别改为各个仓库正确的配置，每个回调触发执行的脚本以[仓库名_callback.sh]命名
 *
 * @type {handler}
 */
const handler = createHandler([
    {
        path: '/money',
        secret: 'rAfK2rr7^R28#h$A'
    },
    {
        path: '/app2',
        secret: 'secret2'
    }
]);

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
    let shellFile = './shell/' + event.payload.repository.name + '_callback.sh';
    fs.access(shellFile, fs.constants.R_OK, (err) => { // 检查文件是否可读
        if (err) {
            console.error(shellFile + '文件不存在');
        } else {
            // 执行指定的shell文件
            runCommand('sh', [shellFile], function (txt) {
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
    let child = spawn(cmd, args);
    child.stdout.on('data', function (buffer) {
        resp += buffer.toString();
    });
    child.stdout.on('end', function () {
        callback(resp);
    });
}