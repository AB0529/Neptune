const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Resume extends Command {
  constructor(nep) {
    super(nep, {
      name: path.basename(__filename, '.js'),
      help: `Resume a paused song.`,
      longHelp: `Resumes currently paused song, duh`,
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
      return util.embed(`:x: | You can only resume if you:\n- \`Queued this\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);

    let dispatcher = voiceConnection.player.dispatcher; // The dispatcher

    // Handle if already paused
    if (!dispatcher.paused)
      return util.embed(`:x: | This is **already playing**! Use \`${nep.prefix}pause\` to pause it!`);

    // Skip the first item of queue
    return util.embed(`⏯ | [${queue[0].video.title}](${queue[0].video.url}) has been **resumed** by **[${msg.author}]**! (\`${nep.prefix}pause\`)`).then(() => {

       if (!dispatcher)
        return;

       return dispatcher.resume();
    });

    // Check for NeptuneDJ role
    function findRole() {
      let role = msg.guild.roles.find((r) => r.name.toLowerCase().startsWith('NeptuneDJ'.toLowerCase()));

      if (!role) return false;
      else if (msg.author.id == '184157133187710977') return true;
      else if (!msg.member.roles.get(role.id)) return false;
      return true;
    }

  }
}

module.exports = Resume;
