const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Play extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Play videos or play queue.`,
			longHelp: `Plays the queue or searches YouTube for a query.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <YouTube Link or Title> [-d]`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`, `• ${nep.prefix}${path.basename(__filename, '.js')} https://www.youtube.com/watch?v=dQw4w9WgXcQ`, `• ${nep.prefix}${path.basename(__filename, '.js')} Never gonna give you up`, `• ${nep.prefix}${path.basename(__filename, '.js')} Epic Song -d\nPlays only first result`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 3e3,
			aliases: ['p'],
			locked: false,
			allowDM: false
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
		let queue = util.getQueue(msg.guild.id);
		let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
		let flagReg = /( -d)/i;
		let notFlagReg = /^((?! -d).)*$/;

		// Play queue if no args
		if (!args[0])
			return util.playQueue(queue);
		// If args but no flag exist send results
		else if (!flagReg.test(args.join(' ')) && notFlagReg.test(args.join(' ').replace(flagReg, '')) && args.join(' ').toLowerCase() !== '-d')
			return search(args.join(' '));
		// If flag and args exist, get first result
		else if (flagReg.test(args.join(' ')) && notFlagReg.test(args.join(' ').replace(flagReg, '')))
			return play(args.join(' ').replace(flagReg, ' '));
		// If flag exists, but no args
		else if (args.join(' ').toLowerCase() == '-d')
			return util.embed(`:x: | You need **something to search**, try a **link** or **title**!`);

		// Send search results from args
		async function search(q) {
			let bod = await util.getJSON(`https://api.anishb.net/yt_video?key=${nep.config.nep.key}&search=${q}&maxResults=10`);
			let m = await util.embed(`*Searching...*`);
			let toSend = [];

			// Handle error
			if (bod.state == 'fail')
				return util.embed(`:x: | Oh no, **something happened**!\n\`\`\`css\n${bod.message}\n\`\`\``, m);

			// Load search results
			for (let i = 0; i < bod.result.length; i++)
				toSend.push(`**${i+1}.** [${bod.result[i].video.title}](${bod.result[i].video.url})`);

			// Send search results
			m.edit({
				embed: new nep.discord.MessageEmbed()
					.setDescription(`*Reply your wanted result*\n\n**Results for** \`${util.parseArgs(q)}\`:\n${toSend.join('\n')}\n**c.** Cancel`)
					.setFooter(msg.author.tag, msg.author.displayAvatarURL())
					.setColor(nep.rColor)
			}).then(() => {
				// Create Collector
				let collector = msg.channel.createMessageCollector((m2) => m2.author.id == msg.author.id, {
					time: 3e4,
					dispose: true
				});

				// Collector events
				collector.on('end', () => util.embed(`*Deleteing...*`, m).then(() => m.delete({ timeout: 3e3 }).catch((e) => util.error(`play.js #57`, err))));
				collector.on('collect', (message) => {
					// Cancel
					if (message.content.toLowerCase() == 'c') {
						message.delete({ timeout: 1e3 })
						return collector.stop();
					}
					// Make sure result exists in array
					else if (!bod.result[parseInt(message.content) - 1])
						return;

					message.delete({ timeout: 1e3 });
					// Push if all is well
					bod.result[parseInt(message.content) - 1].video.author = msg.author;
					queue.push(bod.result[parseInt(message.content) - 1]);
					// Send confirmation
					msg.channel.send({
						embed: new nep.discord.MessageEmbed()
							.setDescription(`<:Selfie:390652489919365131> | Enqueued [${bod.result[parseInt(message.content) - 1].video.title}](${bod.result[parseInt(message.content) - 1].video.url}) **[${bod.result[parseInt(message.content) - 1].video.author}]**`)
							.setThumbnail(bod.result[parseInt(message.content) - 1].thumbnail.medium.url)
							.setColor(nep.rColor)
					});

					// Play queue if not already playing
					if (voiceConnection == null)
						util.playQueue(queue);
					
					collector.stop();
				});

			}).catch((err) => util.error(`play.js #49`, err));
		}
		async function play(q) {
			let bod = await util.getJSON(`https://api.anishb.net/yt_video?key=${nep.config.nep.key}&search=${q}&maxResults=1`);
			let m = await util.embed(`*Searching...*`);

			// Handle error
			if (bod.state == 'fail')
				return util.embed(`:x: | Oh no, **something happened**!\n\`\`\`css\n${bod.message}\n\`\`\``, m);

			// If queue is not empty, just queue it
			if (queue.length >= 1) {
				bod.result[0].video.author = msg.author;
				queue.push(bod.result[0]);

				// Send confirmation
				return m.edit({
					embed: new nep.discord.MessageEmbed()
						.setDescription(`<:Selfie:390652489919365131> | Enqueued [${bod.result[0].video.title}](${bod.result[0].video.url}) **[${bod.result[0].video.author}]**`)
						.setThumbnail(bod.result[0].thumbnail.medium.url)
						.setColor(nep.rColor)
				});
			} else {
				// If queue is empty, queue it then play queue
				bod.result[0].video.author = msg.author;
				queue.push(bod.result[0]);

				// If not playing, play queue
				if (voiceConnection == null)
					util.playQueue(queue);
				m.delete({ timeout: 500 });
			}
		}

	}
}

module.exports = Play;
