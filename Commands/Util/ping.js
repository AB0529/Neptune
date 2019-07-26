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
    let bod = await util.getJSON(`https://uselessfacts.jsph.pl/random.json`);
    let m = await util.embed(`*Pinging...*`);

    m.edit({
      embed: new nep.discord.MessageEmbed()
        .addField(`:ping_pong: Ping my Pong`, `<a:fancy_parrot:435473415613186058> | **Message Delay:** \`${Math.round(m.createdTimestamp - msg.createdTimestamp)}ms\`\n<a:disdat:423642260916404224> | **Websocket:**  \`${Math.round(nep.ws.ping)}ms\``)
        .addField(`📖 Random Fact with Nep`, `*${JSON.stringify(bod.text)}*`)
        .setColor(nep.rColor)
    });
	}
}

module.exports = Ping;
