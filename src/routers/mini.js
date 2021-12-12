const app = require('express').Router();

console.log("[mebot.ga]: Mini pages router loaded.");

app.get("/error", async (req,res) => {
    res.render("error.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels
    })
})

app.get("/dc", async (req,res) => {
    res.redirect(global.config.server.invite)
})
app.get("/discord", async (req,res) => {
    res.redirect(global.config.server.invite)
    })
app.get("/links", async (req,res) => {
    res.redirect('https://mebot.ga/uptime/links')
})
app.get("/categories", async (req,res) => {
    res.redirect('https://mebot.ga/codes/categories')
})
app.get("/list/python", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/python')
})
app.get("/list/html", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/html')
})
app.get("/list/javascript", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/javascript')
})
app.get("/list/substructure", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/substructure')
})
app.get("/list/5invites", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/5invites')
})
app.get("/list/10invites", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/10invites')
})
app.get("/list/15invites", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/15invites')
})
app.get("/list/20invites", async (req,res) => {
    res.redirect('https://mebot.ga/codes/list/20invites')
})
app.get("/status", async (req,res) => {
    res.redirect('https://status.mebot.ga/')
})
app.get("/home", async (req,res) => {
    res.redirect('https://mebot.ga/')
})
app.get("/robots.txt", function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(`Sitemap: https://mebot.ga/sitemap.xml`);
});
module.exports = app;