const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Queue extends Command {
	constructor(nep) {
		super(nep, {
			name: path.basename(__filename, '.js'),
			help: `Central hub for music commands.`,
			longHelp: `Modify the queue like add and stuff.`,
			usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <show, list or sq>`, `• ${nep.prefix}${path.basename(__filename, '.js')} <clear or cq>`, `• ${nep.prefix}${path.basename(__filename, '.js')} <remove or rm> <Item Position>`, `• ${nep.prefix}${path.basename(__filename, '.js')} <shuffle>`],
			examples: [`• ${nep.prefix}${path.basename(__filename, '.js')} show`, `• ${nep.prefix}${path.basename(__filename, '.js')} sq\nShows the queue`, `• ${nep.prefix}${path.basename(__filename, '.js')} clear`, `• ${nep.prefix}${path.basename(__filename, '.js')} cq\nClears the queue`, `• ${nep.prefix}${path.basename(__filename, '.js')} remove 3\nRemoves item 3 from the queue`, `• ${nep.prefix}${path.basename(__filename, '.js')} shuffle\nShuffles the queue`],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 3e3,
			aliases: ['q'],
			locked: false,
			allowDM: false
		});
	}

	// ---------------------------------------------------------------------------

	async run(msg, util, args, nep) {
    // Get guild's queue
    let queue = util.getQueue(msg.guild.id);
    let queueClass = new (require('../../Classes/QueueClass.js'))(msg, util, args, nep);

    // Handle args
    switch (args[0].toLowerCase()) {
      // -=-=-=--=-=-=-=-=-=-=-=-=-=
      case '-list':
      case '-sq':
      case 'show':
      case 'list':
      case 'sq':
        queueClass.showQueue(queue);
        break;
        // -=-=-=--=-=-=-=-=-=-=-=-=-=
      case '-shuffle':
      case 'shuffle':
        queueClass.shuffle(queue);
        break;
        // -=-=-=--=-=-=-=-=-=-=-=-=-=
      case '-remove':
      case '-rm':
      case 'remove':
      case 'rm':
        queueClass.remove(queue);
        break;
        // -=-=-=--=-=-=-=-=-=-=-=-=-=
      case '-clear':
      case '-cq':
      case 'clear':
      case 'cq':
        queueClass.clear(queue);
        break;
        // -=-=-=--=-=-=-=-=-=-=-=-=-=
      default:
        util.embed(`:x: | Dude, those are **Invalid arguments**, try \`${nep.prefix}help ${this.info.name}\` for more info!`);
        break;
        // -=-=-=--=-=-=-=-=-=-=-=-=-=
    }

	}
}

module.exports = Queue;
