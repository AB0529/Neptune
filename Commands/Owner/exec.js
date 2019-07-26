const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Ping extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Exec commands.`,
			longHelp: `Returns commands to console.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <args>`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')} node -v`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
		let m = await util.embed(`*Running...*`);

		try { // Run the command
			var run = require('child_process').execSync(args.join(' '));
		} catch (err) {
			var run = err;
		};

		if (run.toString().length >= 1e3) { // If output is too long send paginton
			m.edit(`Too lazy I'll add later \`7/27/19 12:11 AM\``);
		}
		// If not, send the output
		m.edit({
			embed: new nep.discord.MessageEmbed()
				.addField(`Input`, `\`\`\`css\n${args.join(' ')}\n\`\`\``)
				.addField(`${run.toString().indexOf('Error') >= 0 ? ':x:' : '✅'} Output`, `\`\`\`css\n${run.toString()}\n\`\`\``)
		});

	}
}

module.exports = Ping;
