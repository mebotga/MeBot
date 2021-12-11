const url = require("url");
const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const config = require("../config.js");
const channels = config.server.channels;
const app = express();
const MemoryStore = require("memorystore")(session);
const fetch = require("node-fetch");
const cookieParser = require('cookie-parser');
const referrerPolicy = require('referrer-policy');
app.use(referrerPolicy({ policy: "strict-origin" }))
const rateLimit = require("express-rate-limit");
var MongoStore = require('rate-limit-mongo');
const roles = global.config.server.roles;
const codesSchema = require("./database/models/codes.js");
const uptimeSchema = require("./database/models/uptime.js");
const banSchema = require("./database/models/site-ban.js");
const maintenceSchema = require('./database/models/maintence.js');
const client = global.Client;

module.exports = async (client) => {

  const apiLimiter = rateLimit({
    store: new MongoStore({
      uri: global.config.bot.mongourl,
      collectionName: "rate-limit",
      expireTimeMs: 60 * 60 * 1000,
      resetExpireDateOnChange: true
    }),
    windowMs: 60 * 60 * 1000,
    max: 4,
    message:
      ({ error: true, message: "Too many requests, you have been rate limited. Please try again in one hour." })
  });

  var minifyHTML = require('express-minify-html-terser');
  app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      minifyJS: true
    }
  }));

  app.set('views', path.join(__dirname, '/views'));
  const templateDir = path.resolve(`${process.cwd()}${path.sep}src/views`);
  app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}assets/css`)));
  app.use("/js", express.static(path.resolve(`${templateDir}${path.sep}assets/js`)));
  app.use("/img", express.static(path.resolve(`${templateDir}${path.sep}assets/img`)));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  passport.use(new Strategy({
    clientID: config.website.clientID,
    clientSecret: config.website.secret,
    callbackURL: config.website.callback,
    scope: ["identify", "guilds", "guilds.join"]
  },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }));

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
    resave: false,
    saveUninitialized: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());


  app.engine("mebot.ga", ejs.renderFile);
  app.set("view engine", "mebot.ga");

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  global.checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }

  app.use(async (req, res, next) => {
    const d = await maintenceSchema.findOne({ server: config.server.id });
    if (d) {
      if (req.isAuthenticated()) {
        let usercheck = client.guilds.cache.get(config.server.id).members.cache.get(req.user.id);
        if (usercheck) {
          if (usercheck.roles.cache.get(roles.yonetici)) {
            next();
          } else {
            res.redirect('/error?code=200&message=Our website is temporarily unavailable.')
          }
        } else {
          res.redirect('/error?code=200&message=Our website is temporarily unavailable.')
        }
      } else {
        res.redirect('/error?code=200&message=Our website is temporarily unavailable.')
      }
    } else {
      next();
    }
  })
  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      _token: req.session['_token'],
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };
  const checkMaintence = async (req, res, next) => {
    const d = await maintenceSchema.findOne({
      server: config.server.id
    });
    if (d) {
      if (req.isAuthenticated()) {
        let usercheck = client.guilds.cache.get(config.server.id).members.cache.get(req.user.id);
        if (usercheck) {
          if (usercheck.roles.cache.get(roles.yonetici)) {
            next();
          } else {
            res.redirect('/error?code=200&message=Our website is temporarily unavailable.')
          }
        } else {
          res.redirect('/error?code=200&message=Our website is temporarily unavailable.')
        }
      } else {
        res.redirect('/error?code=200&message=Our website is temporarily unavailable.')
      }
    } else {
      next();
    }
  }

  function generateRandom(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
  }
  app.get("/robots.txt", function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send(`Sitemap: https://mebot.ga/sitemap.xml`);
  });
  app.get("/sitemap.xml", async function(req, res) {
    let link = "<url><loc>https://mebot.ga/</loc></url>";
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">


<url>
  <loc>${link}</loc>
</url>


</urlset>`);
  });

  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
    passport.authenticate("discord", { prompt: 'none' }));
  app.get("/callback", passport.authenticate("discord", {
    failureRedirect: "/"
  }), async (req, res) => {
    let banned = await banSchema.findOne({
      user: req.user.id
    })
    if (banned) {
    client.users.fetch(req.user.id).then(async a => {
      client.channels.cache.get(channels.login).send(new Discord.MessageEmbed().setAuthor(a.username, a.avatarURL({
        dynamic: true
      })).setThumbnail(a.avatarURL({
        dynamic: true
      })).setColor("RED").setDescription(`[**${a.username}**#${a.discriminator}](https://mebot.ga/user/${a.id}) The user named **site** tried to log in but could not log in because he was blocked from the site.`).addField("Username", a.username).addField("User ID", a.id).addField("User Discriminator", a.discriminator))
    })
    req.session.destroy(() => {
      res.json({
        login: false,
        message: "You have been blocked from MeBot.",
        logout: true
      })
      req.logout();
    });
  } else {
    try {
      const request = require('request');
      request({
        url: `https://discordapp.com/api/v8/guilds/${config.server.id}/members/${req.user.id}`,
        method: "PUT",
        json: {
          access_token: req.user.accessToken
        },
        headers: {
          "Authorization": `Bot ${client.token}`
        }
      });
    } catch { };
    res.redirect(req.session.backURL || '/')
    client.users.fetch(req.user.id).then(async a => {
      client.channels.cache.get(channels.login).send(new Discord.MessageEmbed().setAuthor(a.username, a.avatarURL({
        dynamic: true
      })).setThumbnail(a.avatarURL({
        dynamic: true
      })).setColor("GREEN").setDescription(`[**${a.username}**#${a.discriminator}](https://mebot.ga/user/${a.id}) User named **site** logged in.`).addField("Username", a.username).addField("User ID", a.id).addField("User Discriminator", a.discriminator))

    })
  }
});
app.get("/logout", function(req, res) {
  req.session.destroy(() => {
    req.logout();
    res.redirect("/");
  });
});
const checkAdmin = async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(roles.yonetici) || client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(roles.moderator)) {
      next();
    } else {
      res.redirect("/error?code=403&message=You is not competent to do this.")
    }
  } else {
    req.session.backURL = req.url;
    res.redirect("/login");
  }
}

app.use(async (req, res, next) => {
  var getIP = require('ipware')().get_ip;
  var ipInfo = getIP(req);
  var geoip = require('geoip-lite');
  var ip = ipInfo.clientIp;
  var geo = geoip.lookup(ip);

  if (geo) {
    let sitedatas = require("./database/models/analytics-site.js")
    await sitedatas.updateOne({ id: config.website.clientID }, { $inc: { [`country.${geo.country}`]: 1 } }, { upsert: true })
  }
  return next();
})
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.on('connection', socket => {
  io.emit("userCount", io.engine.clientsCount);
});
http.listen(3000, () => { console.log("[mebot.ga]: Website running on 3000 port.") });

//------------------- Routers -------------------//

/* General */
console.clear();
/*
  (WARN)
  You can delete the log here, but you cannot write your own name in the Developed by section.
  * log = first console.log
*/
console.log(`
      [===========================================]
                       mebot.ga
                 Developed by getto
                 System Loading...
      [===========================================]
      `)
console.log("\x1b[32m", "System loading, please wait...")
sleep(1050)
console.clear();
console.log('\x1b[36m%s\x1b[0m', "[mebot.ga]: General routers loading...");
sleep(500);
app.use("/", require('./routers/index.js'))
app.use("/", require('./routers/partners.js'))
app.use("/", require('./routers/mini.js'))

/* Uptime System */
console.log(" ")
console.log('\x1b[36m%s\x1b[0m', "[mebot.ga]: Uptime system routers loading...");
sleep(500);
app.use("/uptime", require('./routers/uptime/add.js'))
app.use("/uptime", require('./routers/uptime/delete.js'))
app.use("/uptime", require('./routers/uptime/links.js'))


/* Code Share System */
console.log(" ")
console.log('\x1b[36m%s\x1b[0m', "[mebot.ga]: Code Share system routers loading...");
sleep(500);
app.use("/codes", require('./routers/codeshare/view.js'))
app.use("/codes", require('./routers/codeshare/list.js'))
app.use("/codes", require('./routers/codeshare/categories.js'))

/* Admin Panel */
app.use(async (req, res, next) => {
  if (req.path.includes('/admin')) {
    if (req.isAuthenticated()) {
      if (client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(global.config.server.roles.administrator) || client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(global.config.server.roles.moderator) || req.user.id === "912055256274325515") {
        next();
      } else {
        res.redirect("/error?code=403&message=You is not competent to do this.")
      }
    } else {
      req.session.backURL = req.url;
      res.redirect("/login");
    }
  } else {
    next();
  }
})
console.log(" ")
console.log('\x1b[36m%s\x1b[0m', "[mebot.ga]: Admin Panel system routers loading...");
sleep(500);
app.use("/", require('./routers/admin/index.js'))
app.use("/", require('./routers/admin/maintence.js'))
app.use("/", require('./routers/admin/ban.js'))
app.use("/", require('./routers/admin/partner.js'))
app.use("/", require('./routers/admin/codeshare/index.js'))
app.use("/", require('./routers/admin/codeshare/edit.js'))
app.use("/", require('./routers/admin/codeshare/add.js'))
app.use("/", require('./routers/admin/codeshare/delete.js'))
app.use("/", require('./routers/admin/uptime/index.js'))


/* Bot System */
console.log(" ")
console.log('\x1b[36m%s\x1b[0m', "[mebot.ga]: API loading...");
app.use("/", require('./routers/api/api.js'))
sleep(500)

app.use((req, res) => {
  req.query.code = 404;
  req.query.message = `Page not found.`;
  res.status(404).render("error.ejs", {
    bot: global.Client,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    roles: global.config.server.roles,
    channels: global.config.server.channels
  })
});
};

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
