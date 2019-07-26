const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Play extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Play song or play queue.`,
			longHelp: `Play the queue or play a direct link or title.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} [YouTube Link or Title]`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`, `• ${nep.prefix}${path.basename(__filename, '.js')} https://www.youtube.com/watch?v=dQw4w9WgXcQ`, `• ${nep.prefix}${path.basename(__filename, '.js')} Never gonna give you up`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 3e3,
			aliases: ['p'],
			locked: false,
			allowDM: false
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
		let queue = util.getQueue(msg.guild.id);
		let voiceConnection = msg.guild.voiceConnection;

		if (!args[0] && !queue)
      return util.embed(`:x: | The **queue is empty**, add something and try again! \`${nep.prefix}help play\``); // If no args and no queue
		else if (!args[0] && queue && !voiceConnection)
      return util.playQueue(queue); // If no args and items in queue, play queue
		else if (!args[0] && queue && voiceConnection)
      return util.embed(`:x: | The queue is **already running** on this server, get good!`); // If queue is already running

		if (args[0] && args.join(' ').replace(/[^\x20-\x7E]+/gu, ' ') == ' ')
      return util.embed(`:x: | Fully unicode titles **do not work**. Try something else or a link!`);
		// Search Nep API for video info
		curl.getJSON(`http://149.56.96.186:8080/api/yt_video?maxResults=1&search=${args.join(' ').replace(/[^\x20-\x7E]+/gu, ' ')}&key=${nep.config.nep.key}`, (err, resp, bod) => {
			try {
				if (err)
          return util.error(err.message, true); // Handle Error
				else if (queue.length > 0) { // If items in queue, push info
					bod.result[0].video.author = msg.author;
					queue.push(bod.result[0]);
					util.embed(`<:Selfie:390652489919365131> | Queued \`${bod.result[0].video.title}\` by **[${bod.result[0].video.author}]**`);
					msg.delete({ timeout: 5e3 }).catch((err) => err);
				} else { // If Items not in queue, push and play
					bod.result[0].video.author = msg.author;
					queue.push(bod.result[0]);
					util.playQueue(queue);
					msg.delete({ timeout: 5e3 }).catch((err) => err);
				}

			} catch (err) {
				// If no results
				util.embed(`:x: | No **results could be found** for your query of \`${util.parseArgs(args.join(' '))}\``);
			}
		});
	}
}

module.exports = Play;
