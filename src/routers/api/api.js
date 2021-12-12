const app = require('express').Router();
const channels = global.config.server.channels,
      roles = global.config.server.roles;

console.log("[mebot.ga]: Api router loaded.");

app.get("/api", async (req, res) => {
    res.json({
        "API": "Active"
        });
});

module.exports = app;