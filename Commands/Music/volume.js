const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class VolumeBar {
	constructor(volume) {
		this.volume = volume || 0;
	}

	format() {
		let string = '';

		for (let i = 0; i < this.volume / 10; i++)
			string += '⬜';

		if (string.length != 10)
			while (string.length != 10)
				string += '⬛';

		return string;
	}
}

// ---------------------------------------------------------------------------

class Volume extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Change how loud music is.`,
			longHelp: `Changes how loud music is (1-100).`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <Volume>`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')} 75`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: ['vol'],
			locked: false,
			allowDM: false
		});
	}

	// ---------------------------------------------------------------------------

	run(msg, util, args, nep) {
		// Make sure permissions check out
		if (!msg.member.hasPermission('ADMINISTRATOR') && !findRole()) return util.embed(`:x: | You can only use this if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);
		// Handle no args
		else if (!args[0]) return util.embed(`:x: | Provide a **number** that's \`between 1-100\` to set as the volume!`);
		try {
			var voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
			var dispatcher = voiceConnection.player.dispatcher; // Dispatcher
			var queue = util.getQueue(msg.guild.id); // Guilds' queue
		} catch (err) {
			// Make sure something is playing
			return util.embed(`:x: | I'm not **playing anything**, leave me alone!`);
		}
		// Make sure args is a number
		if (!parseInt(args[0]) && isNaN(args[0])) return util.embed(`:x: | Did you learn your numbers, because \`${util.parseArgs(args[0])}\` isn't one of them!`);
		// Make sure args is in range of 1-100
		else if (parseInt(args[0]) > 100 && isFinite(parseInt(args[0]))) args[0] = 100;
		else if (parseInt(args[0]) <= 0) args[0] = 1;

		// If everything checks out, set volume for the queue
		queue.volume = parseInt(args[0]);;
		dispatcher.setVolume(Math.floor(args[0]) / 100);

		const bar = new VolumeBar(Math.floor(args[0])); // Initalize volume bar class

		return util.embed(`🎧 | Okay, the volume is now \`${Math.floor(args[0])}\`!\n[${bar.format()}]`);

		// Find NeptuneDJ
		function findRole() {
			let role = msg.guild.roles.find((r) => r.name.toLowerCase().startsWith('NeptuneDJ'.toLowerCase()));

			if (!role) return false;
			else if (msg.author.id == nep.config.discord.owner)
				return true;
			else if (!msg.member.roles.get(role.id))
				return false;
			return true;
		}

	}
}

module.exports = Volume;
