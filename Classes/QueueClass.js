class QueueClass {
	constructor(msg, util, args, nep) {
		this.msg = msg || null;
		this.util = util || null;
		this.args = args || null;
		this.nep = nep || null;
	}
	// ---------------------------------------------------------------------------

	async showQueue(queue) { // Shows the items in the queue
		// Redefine for easier use
		let msg = this.msg;
		let util = this.util;
		let args = this.args;
		let nep = this.nep;

		// Make sures items are in the queue
		if (queue.length < 1)
			return util.embed(`<a:WhereTf:539164678480199720> *You can't list something if there's nothing to list!*`);
		// Map the queue into a readable format then send
		let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
		let queueStatus = voiceConnection ? 'playing' : 'stopped';

		// Send queue in pages if too large for normal embed
		let toList = [];
		let sep = [];

		queue.map((bod, index) => {
			toList.push(`**${index+1})** [${bod.video.title}](${bod.video.url}) **[${bod.video.author}]**`);
		});

		// If more than 10 items in queue, send pages
		if (queue.length > 10) {
			while (toList.length) { sep.push(toList.splice(0, 10).join('\n')); }

			// Send first page
			let m = await util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${sep[0]}`);
			let collector = m.createReactionCollector((x) => x.users.last().id == msg.author.id, {
				time: 3e4,
				dipose: true
			});
			let counter = 0;

			// React with page flippers
			new Promise((resolve, reject) => {
				m.react(`◀`).then(() => m.react(`🔵`).then(() => m.react(`▶`).then(() => m.react(`❌`))));
				resolve();
			}).catch((err) => util.error(`Error when trying to add reactions\n\n${err}`))

			// Flip through pages
			collector.on('collect', (r) => runCollector(r));

			function runCollector(r) {
				// Move left
				if (r.emoji.name == `◀` && counter >= 0) {
					counter--;
					if (counter < 0)
						counter = 0;
					util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${sep[counter]}\n\nPage ${(counter)+1}/${sep.length}`, m);
					// r.users.remove(msg.author);
				}
				// Move to begining
				else if (r.emoji.name == `🔵` && counter > 0) {
					counter = 0;
					util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${sep[counter]}\n\nPage ${(counter)+1}/${sep.length}`, m);
					// r.users.remove(msg.author);
				}
				// Move right
				else if (r.emoji.name == `▶` && counter < sep.length - 1) {
					counter++;
					if (counter > sep.length - 1)
						counter = sep.length - 1;
					util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${sep[counter]}\n\nPage ${(counter)+1}/${sep.length}`, m);
					// r.users.remove(msg.author);
				}
				// Cancel
				else if (r.emoji.name == `❌`) {
					collector.stop();
					m.delete({ timeout: 500 }).catch((err) => util.error(`Error when deleteing msg\n\n${err}`));
				}
			}

		}
		// If else than 10 items just send first page
		else
			return util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${toList.join('\n')}`);
	}

	// ---------------------------------------------------------------------------

	async shuffle(queue) { // Shuffles the queue
		let msg = this.msg;
		let util = this.util;
		let args = this.args;
		let nep = this.nep;
		let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;

		// Check if more than 1 item in queue
		if (queue.length <= 1)
			return util.embed(`:x: | What is there to shuffle?!`);
		// Check if permissions check out
		else if (msg.author !== queue[0].video.author && !msg.member.hasPermission('ADMINISTRATOR') && !findRole())
			return util.embed(`:x: | You can only shuffle if you:\n- \`Queued this\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);
		// If queue is playing, don't shuffle first item
		else if (voiceConnection !== null) {
			queue = shuffle(queue, true);
			util.getQueue();
			return util.embed(`♻ | Queue has been **shuffled** by **[${msg.author}]**`);
		}
		// If not, shuffle everything
		else {
			queue = shuffle(queue);
			util.getQueue();
			return util.embed(`♻ | Queue has been **shuffled** by **[${msg.author}]**`);
		}

		// Shuffle
		function shuffle(arr, t) {
			let newArr = arr.reduce((r, e, i) => {
				let pos = parseInt(Math.random() * (i + 1))
				r.splice(pos, 0, e)
				return r;
			}, []);

			if (t)
        newArr.unshift(newArr.splice(newArr.indexOf(queue[0]), 1)[0]);
			return newArr;

		}
		// Check for NeptuneDJ role
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

	// ---------------------------------------------------------------------------

  async remove(queue) { // Removes elements in queue
    let msg = this.msg;
		let util = this.util;
		let args = this.args;
		let nep = this.nep;
		let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
    let rm = args[1];

    // If queue exists
    if (queue.length < 1)
      return util.embed(`:x: | There's **nothing to remove**, add something with \`${nep.prefix}play\`!`);
    // Handle no arguments
    else if (!rm)
      return util.embed(`:x: | What do you **want to remove**? To see do \`${nep.prefix}queue show\`!`);
    // Handle arguments being valid
    else if (!parseInt(rm))
      return util.embed(`:x: | \`${util.parseArgs(rm)}\` is not a **valid number**!`);
    else if (!queue[parseInt(rm) - 1])
      return util.embed(`:x: | \`${util.parseArgs(rm)}\` **doesn't exist** in the queue!`);
    // Handle permissions
    else if (msg.author !== queue[parseInt(rm) - 1].video.author && !msg.member.hasPermission('ADMINISTRATOR') && !findRole())
			return util.embed(`:x: | You can only remove if you:\n- \`Queued the item\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);
    // Handle what happens when removing playing item
    else if (voiceConnection !== null && parseInt(rm) - 1 == 0) {
      // Skip the first item of queue
      return util.embed(`❎ | [${queue[parseInt(rm) - 1].video.title}](${queue[parseInt(rm) - 1].video.url}) has been removed by **[${msg.author}]**!`).then(() => {
				if (queue.length == 1) {
					queue = [];
					util.resetQueue(msg.guild.id);

					let dispatcher = voiceConnection.player.dispatcher;

	        if (dispatcher.paused)
	          dispatcher.resume();
	        if (!dispatcher)
	          return;

	        return dispatcher.end();
				}
        queue.splice(0, 1 - 1);

        let dispatcher = voiceConnection.player.dispatcher;

        if (dispatcher.paused)
          dispatcher.resume();
        if (!dispatcher)
          return;

        return dispatcher.end();
      });
    }
		// If only 1 item in queue clear it
		else if (queue.length == 1 && parseInt(rm) - 1 == 0) {
			util.embed(`❎ | [${queue[parseInt(rm) - 1].video.title}](${queue[parseInt(rm) - 1].video.url}) has been removed by **[${msg.author}]**!`);
			queue = [];
			util.resetQueue(msg.guild.id);
		}
    // If not playing, remove
    else if (voiceConnection == null) {
			util.embed(`❎ | [${queue[parseInt(rm) - 1].video.title}](${queue[parseInt(rm) - 1].video.url}) has been removed by **[${msg.author}]**!`);
      queue.remove(parseInt(rm) - 1);
    }

    // Check for NeptuneDJ role
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

  // ---------------------------------------------------------------------------

  async clear(queue) { // Clear the queue
    let msg = this.msg;
		let util = this.util;
		let args = this.args;
		let nep = this.nep;
		let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;

    // Check if queue has items
    if (queue.length < 1)
      return util.embed(`:x: | There's **nothing to remove**, add something with \`${nep.prefix}play\`!`);
    // Handle permissions
    else if (!msg.member.hasPermission('ADMINISTRATOR') && !findRole())
			return util.embed(`:x: | You can only remove if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);
    // Handle what happens if clear and playing
    else if (voiceConnection !== null) {
      // Skip the first item of queue
      return util.embed(`⛔ | Queue has been **cleared** by **[${msg.author}]**!`).then(() => {
        queue.splice(0, 1 - 1);
				util.resetQueue(msg.guild.id);

        let dispatcher = voiceConnection.player.dispatcher;

        if (dispatcher.paused)
          dispatcher.resume();
        if (!dispatcher)
          return;

        dispatcher.end();
				queue = [];
        util.resetQueue(msg.guild.id);
      });
    }
    // If not playing, remove
    else {
			queue = [];
			util.resetQueue(msg.guild.id);
      util.embed(`⛔ | Queue has been **cleared** by **[${msg.author}]**!`);
    }

    // Check for NeptuneDJ role
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

  // ---------------------------------------------------------------------------

}

module.exports = QueueClass;
