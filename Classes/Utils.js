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

		return new Promise(async (resolve, reject) => {
			let m = await this.msg.channel.send({
				embed: new MessageEmbed()
					.setDescription(`${string}`)
					.setColor(this.nep.rColor)
			});
			resolve(m);
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
					return util.error(`Curl`, JSON.stringify(err));
				resolve(bod);
			});
		});
	}

	// ---------------------------------------------------------------------------

  getQueue(id) { // Gets queue for guild
    if (!this.nep.queues[id]) // If it doesn't exist, create it
      this.nep.queues[id] = [];
    return this.nep.queues[id]; // Return queue
  }

  // ---------------------------------------------------------------------------

  playQueue(queue) { // Play the queue
    let util = this; // 'this' is the Util class, duh
    let msg = this.msg; // Msg, also duh
    let nep = this.nep; // Nep class

    // If queue finished, leave the voice channel
    if (queue.length === 0)
      return util.embed(`<:Sharcat:390652483577577483> | Queue has **finished playing**, see ya' later alligator!`).then(() => {
        let voiceConnection = msg.guild.voiceConnection;
        let dispatcher = voiceConnection ? voiceConnection.player.dispatcher : null;

        queue.volume = 100; // Reset volume

        if (voiceConnection !== null)
          msg.guild.members.get(nep.user.id).voice.channel.leave();

    }).catch((err) => util.error(err.stack, true));

    // Join the voice channel
    new Promise((resolve, reject) => {
        let voiceConnection = msg.guild.voiceConnection;

        // If bot is not in voice channel, attempt to join
        if (voiceConnection == null) {
            // If member is in voice channel, join it
            if (msg.member.voice.channel)
              msg.member.voice.channel.join().then((connection) => resolve(connection)).catch((err) => {
                // If error clear queue
                util.error(`Error when trying to join vc:\n\n${err}`);
                queue.splice(0, queue.length);
            });
            else {
                // If member is not in voice channel, clear queue and do nothing
                queue.splice(0, queue.length);
                util.embed(`:x: | You're **not in a voice channel**, I can't do everything myself!`);
                reject();
            }
        } else {
            // Tests passed, member is in voice channel
            resolve(voiceConnection);
        }

    }).then((connection) => {
        // Import YTDL-Core
        const ytdl = require('ytdl-core');

        let video = queue[0].video.url; // The url
        let dispatcher = connection.play(ytdl(video, { // The dispatcher
            filter: 'audioonly'
        }));

        msg.channel.send({
            embed: new nep.discord.MessageEmbed()
                .setDescription(`<:ThumbsUp:427532146140250124> | **Now playing** [${queue[0].video.title}](${queue[0].video.url}) **[${queue[0].video.author}]**`)
                .setColor(nep.rColor)
                .setThumbnail(queue[0].thumbnail.default.url)
        });

        // Set volume
        dispatcher.setVolume(!queue.volume ? 1 : Math.floor(queue.volume) / 100);

        // When music end, shift queue
        dispatcher.on('end', () => {
            // Wait a second, shift queue and play
            if (queue.length > 0) {
                setTimeout(() => {
                    queue.shift();
                    util.playQueue(queue);
                }, 1e3);
            }
        });

    }).catch((err) => {
        if (err !== undefined)
          util.error(err);
    });
  }

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
