let thisPrefix;

module.exports = class {
	constructor(nep) {
		this.nep = nep;
	}

	// ---------------------------------------------------------------------------

	run(msg) {
		let nep = this.nep; // Make nep into nep variable

		nep.rColor = Math.floor(Math.random() * 16777215).toString(16); // Random color generator
		nep.util = new(require(`../Classes/Utils.js`))(nep, msg); // Nep Utils class

		let prefixes = [nep.prefix, '—', `<@${nep.user.id}>`, `<@!${nep.user.id}>`]

		for (thisPrefix of prefixes) {
			if (msg.content.startsWith(thisPrefix)) nep.prefix = thisPrefix;
		}

		if (msg.author.bot || !msg.content.startsWith(nep.prefix)) // Ignore bots and no prefixes
			return;

		let args = msg.content.slice(nep.prefix.length).trim().split(/ +/g);
		let command = args.shift();
		let cmd = nep.commands.get(command) || nep.commands.get(nep.aliases.get(command));

		if (!cmd)
			return; // If no command return

		let isOwner = msg.author.id == nep.config.discord.owner ? true : false;
		let isAdminCmd = cmd.info.category.toLowerCase() == 'admin';

		if (!isOwner) // Make sure owner lock works
			return nep.util.embed(`:x: | You're **not my master**, go away! Shoo, shoo!`);
		else if (cmd.cooldown.has(msg.author.id)) { // Handle command cooldown
			if (cmd.sentCooldownMessage.has(msg.author.id)) return;
			else return msg.channel.send({
				embed: new nep.discord.MessageEmbed()
					.setDescription(`⏲ | *Please wait* \`${nep.util.msParser(cmd.config.cooldown)}\` *until using this command again!*`)
					.setColor(nep.rColor)
					.setFooter(msg.author.tag, msg.author.displayAvatarURL())
			}).then(() => cmd.sentCooldownMessage.add(msg.author.id));
		}

		// Command handler
		try {
			cmd.setMessage(msg);

			if (!cmd.config.allowDM && !msg.guild) return nep.util.embed(`:x: | This command cannot be used in a DM!`);
			if (cmd.config.cooldown > 0) cmd.startCooldown(msg.author.id);
			if (cmd.config.locked && msg.author.id !== `184157133187710977` && msg.author.id !== `251091302303662080`) return nep.util.embed(`🔒 | \`${command}\` has been **locked to the public**! Try again later!`);
			if (cmd.info.category == 'Moisty' && msg.author.id !== `184157133187710977` && msg.author.id !== `251091302303662080`) return msg.channel.send(`Fuck off`);
			cmd.run(msg, nep.util, args, nep);
		} catch (err) {
			nep.util.error(`${err.stack}`);
		}

	} // Method End
} // Class End
