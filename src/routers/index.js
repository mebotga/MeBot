const app = require('express').Router();
const maintenceSchema = require('../database/models/maintence.js');
const profiledata = require("../database/models/profile.js");

console.log("[mebot.ga]: Index router loaded.");


app.get("/", async (req,res) => {
    if (req.isAuthenticated()) {
      var prodata = await profiledata.findOne({
            userID: req.user.id
        });
    }
    res.render("index.ejs", {
      bots: global.clientSL,
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        prodata: prodata,
        roles:global.config.server.roles,
        channels: global.config.server.channels
    })
})

module.exports = app;