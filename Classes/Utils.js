const colors = require('colors');
const path = require('path');

const {
	MessageEmbed,
	ReactionCollector
} = require('discord.js');

const Command = require(`${__dirname}/Command.js`);

class Utils {
	constructor(nep, msg) {
		this.nep = nep || undefined; // Client
		this.msg = msg || undefined; // Message
	}

	// ---------------------------------------------------------------------------

	msParser(millisec) { // Convert MS time into seconds or minutes etc.
		let seconds = (millisec / 1e3);
		let minutes = (millisec / (1e3 * 60));
		let hours = (millisec / (1e3 * 60 * 60));
		let days = (millisec / (1e3 * 60 * 60 * 24));

		if (seconds < 60) {
			return seconds + ' second(s)';
		} else if (minutes < 60) {
			return minutes + ' minute(s)';
		} else if (hours < 24) {
			return hours + ' hour(s)';
		} else {
			return days + ' day(s)';
		}
	}

	// ---------------------------------------------------------------------------

	embed(string, editM) { // Embeds
		if (!string || string === '' || string === undefined) return this.log('Embed Error', 'No string provided');
		else if (editM) return editM.edit({
			embed: new MessageEmbed()
				.setDescription(string)
				.setColor(this.nep.rColor)
		});

		return new Promise((resolve, reject) => {
			this.msg.channel.send({
				embed: new MessageEmbed()
					.setDescription(`${string}`)
					.setColor(this.nep.rColor)
			}).then((m) => resolve(m));
		});
	}

	// ---------------------------------------------------------------------------

	hasPermission(perm, send) { // Check if member has permission
		// If member has permission and no send, return true
		if (this.msg.member.hasPermission(perm) || this.msg.author.id == '184157133187710977' && !send) return true;
		// If member has no permission and no send, return false
		else if (!this.msg.member.hasPermission(perm) && this.msg.author.id !== '184157133187710977' && !send) return false;
		// Same as before but no send, and send message
		else if (!this.msg.member.hasPermission(perm) && this.msg.author.id !== '184157133187710977' && send) {
			this.embed(`🚔 | Hey you, yeah you! You **don't have** the permission \`${perm}\`!`);
			return false;
		}
	}

	// ---------------------------------------------------------------------------

	code(type, string, editM) { // Send codeblocks
		if (!string) return;
		else if (editM) return editM.edit(string, {
			code: type
		});

		return new Promise((resolve, reject) => {
			this.msg.channel.send(string, {
				code: type
			}).then((m) => resolve(m));
		});
	}

	// ---------------------------------------------------------------------------

	send(string, editM) { // Quicker msg.channel.send
		if (!string) return this.log(`Sedn Error`, `No string`);
		else if (editM) return editM.edit(string);

		return new Promise((resolve, reject) => {
			this.msg.channel.send(string).then((m) => resolve(m));
		});

	}

	// ---------------------------------------------------------------------------

	parseArgs(args, length) { // Make long args not long
		if (!args) args = ''; // No args
		else if (!length) length = 1e3; // No length make it 1,000

		if (args.length >= length) {
			let newString = args.substr(0, Math.floor(args.length / 2) >= 500 ? 250 : Math.floor(args.length / 2));
			return newString + '...';
		} else if (args.length >= 15) return args.substr(0, Math.floor(args.length / 2) >= 25 ? 25 : Math.floor(args.length / 2)) + '...';
		else return args;

	}

	// ---------------------------------------------------------------------------

	log(title, error, misc) { // Better console.log
		if (!title) title = '';
		if (!error) error = '';
		if (!misc) misc = '';

		return console.log(`[`.green + `${title}`.magenta + `]`.green + ` ${error.yellow} ` + `(${misc})`);

	}

	// ---------------------------------------------------------------------------

	error(err, log) { // Log error in a good way
		if (!err) err = '';
		else if (log) {
			this.log(`Error Func`, err);
			return this.embed(`:x: | Oh swiddle sticks, and **error** occured!\n\`\`\`css\n${err}\n\`\`\``);
		}
		return this.embed(`:x: | Oh swiddle sticks, and **error** occured!\n\`\`\`css\n${err}\n\`\`\``);
	}

	// ---------------------------------------------------------------------------

	getJSON(url) { // Get JSON from api
		const curl = require('curl');
		const util = this;
		return new Promise((resolve) => { // Return promise
			curl.getJSON(url, (err, resp, bod) => { // Get the data
				if (err) // Handle error
					return util.error(`Curl`, err);
				resolve(bod);
			});
		});
	}

	// ---------------------------------------------------------------------------

  

  // ---------------------------------------------------------------------------


}

module.exports = Utils;

/*
client.connection = mysql.createConnection({
  host: client.config.mysql.host,
  user: client.config.mysql.user,
  password: client.config.mysql.password,
  database: client.config.mysql.database,
  charset: 'utf8mb4_unicode_ci'
});

*/
