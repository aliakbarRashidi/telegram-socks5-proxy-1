/*
	js proxy server for telegram
*/

const argv = require("optimist")
            .usage("Usage: $0 --port [listen port]")
            .demand(["port"])
            .argv;
			
const socks5 = require("./lib");
const telegarm = require("./telegram");			
			
/* auth proxy setting */			
var options = {
	authenticate : function (username, password, callback) 
	{
		if (username === 'sock' && password === 'qwe123') 
		{
			return setImmediate(callback);
		}

		return setImmediate(callback, new Error('ERROR: incorrect username and password'));
	}
};

const server = socks5.createServer(options);

telegarm.loadIPList("./telegram.txt");

server.on("proxyConnect", function (info, socket) 
{
    var ip = info.host;
    var log = `${socket.remoteAddress} <-> ${ip}:${info.port}`;
	
    if (!isIP(ip)) 
	{
        socket.destroy();
        console.log(log, "rejected");
        return;
    }
	
    if (!telegarm.isTelegramIP(ip)) 
	{
        socket.destroy();
        console.log(log, "rejected");
        return;
    }
	
    console.log(log, "connected");
});

function isIP(str)
{
    var ipArray = str.split(".");
    if (ipArray.length != 4) return false;
    for (var item of ipArray) {
        item = parseInt(item);
        if (isNaN(item)) return false;
        if (item >= 1 && item <= 254) continue;
        return false;
    }
    return true;
}

server.listen(argv.port);
console.log(`INFO: started listen port at ${argv.port}`);