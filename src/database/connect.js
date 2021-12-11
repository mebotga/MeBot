const config = require("../../config.js");
const mongoose = require("mongoose")

module.exports = async () => {
    mongoose.connect(config.bot.mongourl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        autoIndex: false
    }).then(() => {
    console.log("[mebot.ga]: Mongoose successfully connected.");
    }).catch(err => console.log("[mebot.ga]: An error occurred while connecting mongoose.", err));
}