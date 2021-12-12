const app = require('express').Router();
const codesSchema = require("../../database/models/codes.js");
const uptimedata = require("../../database/models/uptime.js");
let sitedatalari = require("../../database/models/analytics-site.js");



console.log("[mebot.ga]: Admin/Index router loaded.");
app.get("/admin", global.checkAuth, async (req, res) => {
	const codedata = await codesSchema.find();
	const udata = await uptimedata.find();
	let sites = await sitedatalari.findOne({ id: config.website.clientID });
    res.render("admin/index.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        codedata: codedata,
        udata: udata, 
        siteD: sites,
    })
});
module.exports = app;