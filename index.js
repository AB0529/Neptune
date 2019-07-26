// Import
const Nep = require(`./Classes/Nep.js`);
const mysql = require('mysql');
const wolken = require('wolken');

// Initialise
const nep = new Nep({
  disableEveryone: true,
  config: `./config.json`
});

nep.prefix = nep.config.discord.prefix;
nep.dir = __dirname;

nep.discord = require('discord.js');
nep.connection = mysql.createConnection({
  host: nep.config.mysql.host,
  user: nep.config.mysql.user,
  password: nep.config.mysql.password,
  database: nep.config.mysql.database,
  charset: 'utf8mb4_unicode_ci'
});
nep.wolke = new wolken(nep.config.wolke.key, 'Wolke', 'Neptune/5.1.0');

// Remove Element from an Array
Array.prototype.remove = function (index) {
  this.splice(index, 1);
}

// Catch undhandled rejections i.e Missing Permssions
process.on('unhandledRejection', (err) => {
  if (err.message.toLowerCase() == 'DiscordAPIError: Missing Permissions')
    return;
});

// Login
nep.login(nep.config.discord.token);
// Load commands
nep.loadCommands(`${__dirname}/Commands`);
// Load events
nep.loadEvents(`${__dirname}/Events`);
