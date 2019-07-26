const Command = require('../../Classes/Command.js');
const stripIndents = require('common-tags').stripIndents;
const path = require('path');
const curl = require('curl');

class Eval extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Eval code.`,
			longHelp: `Returns commands to bot.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <args>`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')} util.embed('hi');`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
    let input = args.join(' ');

    if (!args[0]) return msg.channel.send(`No args tho`);

    try {
      let evaled = eval(args.join(' '));

      if (evaled.toString().indexOf(nep.token) >= 0) evaled = clean(evaled.toString().replace(new RegExp(`${nep.config.discord.token}`, 'gi'), 'Go away.')).replace(new RegExp(`${nep.config.mysql.password}`, 'gi'), 'No password here xd');
      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
      if (evaled.length > 1500) return msg.channel.send(`Msg too big fix later.`);

      sendEval(input, evaled);

    } catch (err) {
      sendEval(input, err, `:x:`)
    }

    function sendEval(input, output, emote) {
      msg.delete({timeout: 1000});

      if (!emote) emote = `✅`;
      msg.channel.send({embed: new nep.discord.MessageEmbed()
        .setDescription(stripIndents`**Input:**\n\`\`\`js\n${input}\n\`\`\`${emote}**Output:**\n\`\`\`js\n${output}\n\`\`\``)
        .setColor(0xff8d14)
      });
    }
		function clean(text) {
				if (typeof(text) === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
				else return text;
		}
	}
}

module.exports = Eval;
