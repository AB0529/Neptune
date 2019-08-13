const Command = require('../../Classes/Command.js');
const path = require('path');

class Leave extends Command {
  constructor(nep) {
    super(nep, {
      name: path.basename(__filename, '.js'),
      help: `Clears the queue and leave voice channel.`,
      longHelp: `Clears the queue and leaves the voice channel.`,
      usage: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      cooldown: 5e3,
      aliases: [],
      /*['ping2']*/
      locked: false,
      allowDM: false
    });
  }

  // ---------------------------------------------------------------------------

  run(msg, util, args, nep) {
    let queue = util.getQueue(msg.guild.id);
    let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection

    if (!args[0] && !queue)
      return util.embed(`:x: | The **queue is empty**, add something and try again! \`${nep.prefix}help play\``); // If no args and no queue
    else if (!voiceConnection && queue)
      return util.embed(`:x: | I'm not even **playing anything** *leaf me alone*!`);

    // Permission check
    if (!msg.member.hasPermission('ADMINISTRATOR') && !findRole())
      return util.embed(`:x: | You can only use this if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);

    // Leave voice channel
    msg.guild.members.get(nep.user.id).voice.channel.leave();
    util.embed(`⛔ | Ok bye **[${msg.author}]**`);
    queue[0].repeat = null;

    // Find NeptuneDJ
    function findRole() {
      let role = msg.guild.roles.find((r) => r.name.toLowerCase().startsWith('NeptuneDJ'.toLowerCase()));

      if (msg.author.id == nep.config.discord.owner)
        return true;
      else if (!role)
        return false;
      else if (!msg.member.roles.get(role.id))
        return false;
      return true;
    }
  }
}

module.exports = Leave;
