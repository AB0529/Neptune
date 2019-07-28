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
			return util.embed(`:x: | You can only skip if you:\n- \`Queued this\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);
		// If queue is playing, don't shuffle first item
		else if (voiceConnection !== null) {
			queue = shuffle(queue, true);
			return util.embed(`♻ | Queue has been **shuffled** by **[${msg.author}]**`);
		}
		// If not, shuffle everything
		else {
			queue = shuffle(queue);
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

}

module.exports = QueueClass;
