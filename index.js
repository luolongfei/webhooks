const http = require('http');
const spawn = require('child_process').spawn;
const createHandler = require('github-webhook-handler');
const fs = require('fs');

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
            console.log('支持多个处理器，约定：path为[/仓库名]，secret分别改为各个仓库正确的配置，每个回调触发执行的脚本以[仓库名_callback.sh]命名')
            console.log('代码中的 event.payload.repository.name 其实是从 GitHub 传过来的，不受我们控制，是 GitHub 上的仓库名')
        } else {
            // 执行指定的shell文件
            spawn('sh', [shellFile])
        }
    });
});
