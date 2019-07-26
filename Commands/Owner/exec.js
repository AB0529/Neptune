const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Ping extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Usual 'ping' command.`,
			longHelp: `Returns the round trip ping and API latency`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: ['pong'],
			locked: false,
			allowDM: true
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
		args = args.join(' ');

		return msg.channel.send({
			embed: new nep.discord.MessageEmbed()
				.setDescription(`*Running...*`)
				.setColor(nep.rColor)
		}).then((m1) => {
			try {
				var run = require('child_process').execSync(args);

				if (!args[0]) return msg.channel.send(`No args boi`);
			} catch (err) {
				run = err;
			}
			let getEmote = () => {
				if (run.toString().indexOf('Error') >= 0) return ':x:';
				else return '✅';
			}
			if (run.toString().length >= 1024) {
				let page1 = new nep.discord.MessageEmbed()
					.addField(`Input`, `\`\`\`js\n${args}\n\`\`\``)
					.addField(`${getEmote()} Output`, `\`\`\`js\n${run.toString().slice(0, Math.floor(run.toString().length / 2))}\n\`\`\``)
					.setColor(nep.rColor)
				let page2 = new nep.discord.MessageEmbed()
					.addField(`Input`, `\`\`\`js\n${args}\n\`\`\``)
					.addField(`${getEmote()} Output`, `\`\`\`js\n${run.toString().slice(Math.floor(run.toString().length / 2), run.toString().length)}\n\`\`\``)
					.setColor(nep.rColor)
				m1.edit({
					embed: page1
				}).then(async (mm) => {
					const collector = mm.createReactionCollector((abc) => abc.users.last().id == msg.author.id, {
						time: 30000
					});

					await mm.react('◀');
					await mm.react('▶');

					collector.on('collect', (m) => {
						if (m.emoji.name == '▶') return mm.edit({
							embed: page2
						}).then(async () => {
							await mm.reactions.removeAll();
							await mm.react('◀');
							await mm.react('▶');
						});
						if (m.emoji.name == '◀') return mm.edit({
							embed: page1
						}).then(async () => {
							await mm.reactions.removeAll();
							await mm.react('◀');
							await mm.react('▶');
						});
					});
				});
			} else return m1.edit({
				embed: new nep.discord.MessageEmbed()
					.addField(`Input`, `\`\`\`js\n${args}\n\`\`\``)
					.addField(`${getEmote()} Output`, `\`\`\`js\n${run}\n\`\`\``)
					.setColor(nep.rColor)
			});
		}).catch((e) => nep.func.log(`Error`, e));
	}
}

module.exports = Ping;
