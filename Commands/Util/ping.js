const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class Ping extends Command {
  constructor(nep) {
    super(nep, {
      name: path.basename(__filename, '.js'),
      help: `Usual 'ping' command.`,
      longHelp: `Returns the round trip ping and API latency`,
      usage: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      examples: [`• ${nep.prefix}${path.basename(__filename, '.js')}`],
      category: path.dirname(__filename).split(path.sep).pop(),
      cooldown: 1e3,
      aliases: ['pong'],
      locked: false,
      allowDM: true
    });
  }

  // ---------------------------------------------------------------------------

  run(msg, util, args, nep) {
    curl.getJSON(`https://uselessfacts.jsph.pl/random.json`, (err, resp, bod) => {
      if (err) return util.error(err);

      msg.channel.send(`*Pinging...*`).then((m) => {
        m.edit({
          embed: new nep.discord.MessageEmbed()
            .addField(`:ping_pong: Ping my Pong`, `<a:fancy_parrot:435473415613186058> | **Message Delay:** \`${Math.round(m.createdTimestamp - msg.createdTimestamp)}ms\`\n<a:disdat:423642260916404224> | **Websocket:**  \`${Math.round(client.ws.ping)}ms\``)
            .addField(`📖 Random Fact with Nep`, `*${bod.text}*`)
            .setColor(nep.rColor)
        });
      });
    });

  }
}

module.exports = Ping;
