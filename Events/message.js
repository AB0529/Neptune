let thisPrefix;

module.exports = class {
	constructor(nep) {
		this.nep = nep;
	}

	// ---------------------------------------------------------------------------

	async run(msg) {
		let nep = this.nep; // Make nep into nep variable

		nep.rColor = Math.floor(Math.random() * 16777215).toString(16); // Random color generator
		nep.util = new(require(`../Classes/Utils.js`))(nep, msg); // Nep Utils class

		let prefixes = [nep.prefix, '—', `<@${nep.user.id}>`, `<@!${nep.user.id}>`]

		for (thisPrefix of prefixes)
			if (msg.content.startsWith(thisPrefix)) nep.prefix = thisPrefix;

		// Add new servers to database
		let sRow = await nep.util.selectAllServers(msg.guild.id);

		// Add new server if it doesn't exist
		if (sRow.length <= 0) {
			nep.connection.query(
				`INSERT INTO servers (guildId, prefix, queue) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE guildId = ${msg.guild.id}`,
				[msg.guild.id, nep.prefix, '[]']);
			nep.server = sRow;
		}
		// If nothing in local queue, update with database queue
		else if (!nep.queues[msg.guild.id]) {
			nep.queues[msg.guild.id] = JSON.parse(sRow[0].queue);
			nep.server = sRow;
		}
		// Server row
		nep.server = sRow;
		// Update queue
		nep.util.getQueue(msg.guild.id);

		if (msg.author.bot || !msg.content.startsWith(nep.prefix)) // Ignore bots and no prefixes
			return;

		let args = msg.content.slice(nep.prefix.length).trim().split(/ +/g);
		let command = args.shift();
		let cmd = nep.commands.get(command) || nep.commands.get(nep.aliases.get(command));

		// Make sure command exists
		if (!cmd)
			return;

		let isOwner = msg.author.id == nep.config.discord.owner ? true : false;

		if (!isOwner && cmd.info.category == 'Owner') // Make sure owner lock works
			return nep.util.embed(`:x: | You're **not my master**, go away! Shoo, shoo!`);
		else if (cmd.cooldown.has(msg.author.id)) { // Handle command cooldown
			if (cmd.sentCooldownMessage.has(msg.author.id))
				return;
			else
				return msg.channel.send({
					embed: new nep.discord.MessageEmbed()
						.setDescription(`⏲ | *Please wait* \`${nep.util.msParser(cmd.config.cooldown)}\` *until using this command again!*`)
						.setColor(nep.rColor)
						.setFooter(msg.author.tag, msg.author.displayAvatarURL())
				}).then(() => cmd.sentCooldownMessage.add(msg.author.id));
		}

		// Command handler
		try {
			cmd.setMessage(msg);

			// Reset cooldown
			if (cmd.config.cooldown > 0)
				cmd.startCooldown(msg.author.id);
			// Make sure command can be used in DMs
			if (!cmd.config.allowDM && !msg.guild)
				return nep.util.embed(`:x: | **${command}** cannot be used in a DM!`);
			// Make sure only owner can use locked commands
			if (cmd.config.locked && msg.author.id !== nep.config.discord.owner)
				return nep.util.embed(`🔒 | \`${command}\` has been **locked to the public**! Try again later!`);
			// Make sure only owner can use owner commands
			if (cmd.info.category == 'Owner' && msg.author.id !== (nep.config.discord.owner))
				return msg.channel.send(`Fuck off`);
			cmd.run(msg, nep.util, args, nep);
		} catch (err) { // Handle error
			nep.util.error(`${err.stack}`);
		};

	} // Method End
} // Class End
