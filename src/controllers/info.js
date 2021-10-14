const { fork } = require('child_process');

exports.infoRender = (req, resp) => {
    const data = {};
    data.args = process.argv;
    data.platform = process.platform;
    data.version = process.version;
    data.mem = process.memoryUsage();
    data.path = process.execPath;
    data.pid = process.pid;
    data.folder = process.cwd();
    data.cpus = require('os').cpus().length;

    resp.render('info', {data: data});
};

exports.randoms = (req, resp) => {
    const cant = req.query.cant ?? 100000000;

    console.log(cant)

    const forked = fork('./src/ramdoms.js');
    forked.send(cant);
    forked.on('message', resultado => {
        resp.send(`Resultado ${resultado}`);
    });
};