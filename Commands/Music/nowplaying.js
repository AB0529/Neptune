const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Nowplaying extends Command {
  constructor(nep) {
    super(nep, {
      name: path.basename(__filename, '.js'),
      help: `Shows you what's currently playing.`,
      longHelp: `Returns info on what's currently playing.`,
      usage: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      category: path.dirname(__filename).split(path.sep).pop(),
      cooldown: 1e3,
      aliases: ['np'],
      locked: false,
      allowDM: false
    });
  }

  // ---------------------------------------------------------------------------

  run(msg, util, args, nep) {
    let queue = util.getQueue(msg.guild.id);
    let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;

    if (!queue[0])
      return util.embed(`:x: | The **queue is empty**, there's nothing is show!`);
    else if (!voiceConnection)
      return util.embed(`:x: | There isn't even **anything playing**, feels bad.`);

    return msg.channel.send({
      embed: new nep.discord.MessageEmbed()
        .setDescription(`🎶 | **Currently playing** [${queue[0].video.title}](${queue[0].video.url}) **[${queue[0].video.author}]**`)
        .setColor(nep.rColor)
        .setThumbnail(queue[0].thumbnail.medium.url)
    });

  }

}

module.exports = Nowplaying;
