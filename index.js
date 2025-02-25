const { executionAsyncResource } = require('async_hooks');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs')

const { YTSearcher } = require('ytsearcher');

const searcher = new YTSearcher({
    key: process.env.youtube_api,
    revealed: true
});

const client = new Discord.Client();
var http = require('http');  http.createServer(function (req, res) {     res.writeHead(200, {'Content-Type': 'text/plain'});     res.send('it is running\n'); }).listen(process.env.PORT || 5000); 
function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: 'musikggezz.herokuapp.com',
            port: process.env.PORT || 5000,
            path: '/'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 2 * 60 * 1000); // load every 20 minutes
}

startKeepAlive();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir("./commands/", (e, f) => {
    if(e) return console.error(e);
    f.forEach(file => {
        if(!file.endsWith(".js")) return
        console.log(`${file} has been loaded`)
        let cmd = require(`./commands/${file}`);
        let cmdName = cmd.config.name;
        client.commands.set(cmdName, cmd)
        cmd.config.aliases.forEach(alias => {
            client.aliases.set(alias, cmdName);
        })
    })
})



const queue = new Map();

client.on("ready", () => {
    client.user.setPresence({
		activity: { name: "out for &commands", type: "WATCHING" },
		status: "online",
	});
	console.log(`${client.user.tag} is online and ready to go!!`);
   
})



client.on("message", async(message) => {
    const prefix = '&';

    if(!message.content.startsWith(prefix)) return
    
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if(!cmd) return

    try {
        cmd.run(client, message, args, queue, searcher);
    }catch (err){
        return console.error(err)
    }
        
})

client.login(process.env.token)
