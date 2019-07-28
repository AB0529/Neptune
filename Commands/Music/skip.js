const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Skip extends Command {
  constructor(nep) {
    super(nep, {
      name: path.basename(__filename, '.js'),
      help: `Skips the currently playing song.`,
      longHelp: `Skips currently playing song, duh`,
      usage: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      category: path.dirname(__filename).split(path.sep).pop(),
      cooldown: 1e3,
      aliases: [],
      locked: false,
      allowDM: false
    });
  }

  // ---------------------------------------------------------------------------

  run(msg, util, args, nep) {
    let queue = util.getQueue(msg.guild.id); // Queue for guild
    let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;

    if (!queue[0])
      return util.embed(`:x: | The queue is **empty** dud, leave me alone!`);
    else if (!voiceConnection)
      return util.embed(`:x: | I'm not **palying anything** go away!`);

    // Check if permissions check out
    if (msg.author !== queue[0].video.author && !msg.member.hasPermission('ADMINISTRATOR') && !findRole())
      return util.embed(`:x: | You can only skip if you:\n- \`Queued this\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);

    // Skip the first item of queue
    return util.embed(`⏩ | \`${queue[0].video.title}\` has been skipped by **[${msg.author}]**!`).then(() => {
      queue.splice(0, 1-1);
      let dispatcher = voiceConnection.player.dispatcher;

      if (dispatcher.paused) dispatcher.resume();
      if (!dispatcher)
        return;

      return dispatcher.end();
    });

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
}

module.exports = Skip;
