const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');
const fs = require('fs');

class Help extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Information on categories and commands.`,
			longHelp: `Returns a list of commands and more info on usage of a command.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')}`, `• ${nep.prefix}${path.basename(__filename, '.js')} <category>`, `• ${nep.prefix}${path.basename(__filename, '.js')} <command>`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`, `• ${nep.prefix}${path.basename(__filename, '.js')} music\nShows commands from the music category`, `• ${nep.prefix}${path.basename(__filename, '.js')} queue\nShows usage for the queue command`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
		let categories = fs.readdirSync(`${nep.dir}/Commands`); // Command categories
		let categoryCollection = new nep.discord.Collection(); // Place to store them

		// Set categories in the collection
		// NOTE: Probably not needed but I'm scared to remove in case something breaks so it stays
		categories.forEach((c) => categoryCollection.set(c.toLowerCase()));

		// Place to store help message
		let commandListLong = [];
		let commandListSmall = [];

		// Cat fact for extra flair
		let catFact = await util.getJSON(`https://catfact.ninja/fact`);

		// Handle args
		if (!args[0]) // If no args send usage and categories
			return msg.channel.send({
				embed: new nep.discord.MessageEmbed()
					.addField(`📜 Categories`, `**${categories.join('\n')}**`)
					.addField(`🤷 Misc.`, `- [Support Server](https://discord.gg/R9ykDC3)\n- [Random Cat](http://random.cat/)\n- [Random YouTube Video](https://ytroulette.com/)\n\n*${catFact.fact}*`)
					.setFooter(`Do ${nep.prefix}${this.info.name} <Command or Category>`)
					.setColor(nep.rColor)
			});
		// Send help for aliases
		if (nep.commands.get(nep.aliases.get(args.join(' ').toLowerCase()))) {
			return sendLong(nep.commands.get(nep.aliases.get(args.join(' ').toLowerCase())).info.name);
    }
		// Send command list for a category
		else if (categoryCollection.has(args.join(' ').toLowerCase()))
			return sendSmall(args.join(' ').toLowerCase());
		// Send help for command
		else if (nep.commands.has(args.join(' ').toLowerCase()))
			return sendLong(args.join(' ').toLowerCase());
		// Nothing found
		else
			return nep.util.embed(`:x: | No **command or category** was found for your query! Try \`${nep.prefix}${this.info.name}\`!`);

		// Functions
		// Send long help
		function sendLong(cmd) {
			// Get the command
			let command = nep.commands.get(cmd.toLowerCase());

			// Push formated into temp list
			commandListLong.push(`**${nep.prefix}${command.info.name}** *${command.info.longHelp}*\n\`\`\`css\nUsage:\n\n${command.info.usage.join('\n')}\n\nExample:\n\n${command.info.examples.join('\n')}\n\`\`\``);
			// Send message
			return msg.channel.send({
				embed: new nep.discord.MessageEmbed()
					.setDescription(commandListLong.join(' '))
					.setFooter(`Aliases: ${command.config.aliases.length > 0 ? `${command.config.aliases.map((a) => `${nep.prefix}${a}`).join(' • ')}` : 'None'}`)
					.setColor(nep.rColor)
			});
		}
    // Send command list and short help
    function sendSmall(cat) {
      // Get each category
      categories.forEach((c) => {
        // Get each command
        let cmd = fs.readdirSync(`${nep.dir}/Commands/${c}`);
        // Push formated into temp list
        for (let i = 0; i < cmd.length; i++) {
          let command = nep.commands.get(path.basename(cmd[i], '.js'));
          // If category matches
          if (command.info.category.toLowerCase() == cat)
            commandListSmall.push(`**${nep.prefix}${command.info.name}** - *${command.info.help}*`);
        }
      });
      // Send message
      return msg.channel.send({
        embed: new nep.discord.MessageEmbed()
          .setTitle(cat[0].toUpperCase() + cat.replace(cat[0], ''))
          .setDescription(commandListSmall.join(`\n\n`))
          .setFooter(msg.author.tag, msg.author.displayAvatarURL())
          .setColor(nep.rColor)
      });
    }

	}
}

module.exports = Help;
