const Discord = require("discord.js");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client())
const config = require("./config.js");
global.config = config;
const fs = require("fs");
client.htmll = require('cheerio');
const request = require("request");
let profiledata = require("./src/database/models/profile.js");
const db = require("quick.db");
const ms = require("parse-ms");

require('events').EventEmitter.prototype._maxListeners = 100;
client.komutlar = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./src/commands", (err, files) => {
    if (err) console.error(err);
    console.log(`[mebot.ga]: ${files.length} command loaded.`);
    files.forEach(f => {
        if (!f.endsWith('.js')) return
        let props = require(`./src/commands/${f}`);
        if (!props.help) return
        client.komutlar.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
            global.commands = files;
        });
    });
});
client.on('message', async message => {
    let p = config.bot.prefix
    let client = message.client;
    if (message.author.bot) return;
    if (!message.content.startsWith(p)) return;
    let command = message.content.split(" ")[0].slice(p.length);
    let params = message.content.split(" ").slice(1);
    let cmd
    if (client.komutlar.has(command)) {
        cmd = client.komutlar.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.komutlar.get(client.aliases.get(command));
    }
    if(cmd) {
        cmd.run(client, message, params, p);
    }
    if(!cmd) return;
})

const claudette = require("./src/database/models/uptime.js")
    setInterval(() => {
        claudette.find({}, function (err, docs) {
            if(err) console.log(err)
            if(!docs) return;
            docs.forEach(docs => {
                request(docs.link, async function(error, response, body) {
                  if(error) {
                    console.error(`${docs.link} has been deleted on uptime system.\nReason: Invalid domain so request failed.`);
                    await claudette.findOneAndDelete({ code: docs.code })
                  }
                });
            })
        })
    }, 60000)

client.on('guildMemberRemove', async member => {
    if(member.guild.id !== config.serverID) return
        claudette.find({ userID: member.id }, async function (err,docs) {
            await docs.forEach(async a => {
            await claudette.findOneAndDelete({ userID: member.id, code: a.code, server: a.server, link: a.link })
            })
        })
    })
client.on("message", message => {    if(message.content.toLowerCase() == "m-confirm")     return message.channel.send(`**Login Confirmed ✔**`)}); 

require("./src/server.js")(client);
require("./src/database/connect.js")(client);

client.login(config.bot.token);
client.on('ready',async () => {
    console.log("[mebot.ga]: Bot successfully connected as "+client.user.tag+".");
    client.user.setPresence({ activity: { type: 'WATCHING', name: 'mebot.ga | v1.7' }, status: "online" });
});
