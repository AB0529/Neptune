const Command = require('../../Classes/Command.js');
const stripIndents = require('common-tags').stripIndents;
const path = require('path');
const curl = require('curl');

class Test extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Test code.`,
			longHelp: `Test.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <args>`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')} gdfngdk`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
		let q = util.getQueue(msg.guild.id);

		util.send(JSON.stringify(q.repeat));

		// util.send(JSON.stringify(q));
	}
}

module.exports = Test;
