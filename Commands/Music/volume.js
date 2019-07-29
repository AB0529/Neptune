const Command = require('../../Classes/Command.js');
const path = require('path');
const curl = require('curl');

class VolumeBar {
  constructor(volume) {
    this.volume = volume; // ⬜ ⬛
    this.volBar = ['\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬜', // Full volume
      '\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬛',
      '\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬛\⬛',
      '\⬜\⬜\⬜\⬜\⬜\⬜\⬜\⬛\⬛\⬛',
      '\⬜\⬜\⬜\⬜\⬜\⬜\⬛\⬛\⬛\⬛',
      '\⬜\⬜\⬜\⬜\⬜\⬛\⬛\⬛\⬛\⬛',
      '\⬜\⬜\⬜\⬜\⬛\⬛\⬛\⬛\⬛\⬛',
      '\⬜\⬜\⬜\⬛\⬛\⬛\⬛\⬛\⬛\⬛',
      '\⬜\⬜\⬛\⬛\⬛\⬛\⬛\⬛\⬛\⬛',
      '\⬜\⬛\⬛\⬛\⬛\⬛\⬛\⬛\⬛\⬛',
      '\⬛\⬛\⬛\⬛\⬛\⬛\⬛\⬛\⬛\⬛' // No volume
    ]
  }

  get self() {
    if (this.volume == 100) return this.volBar[0]
    if (this.volume == 90 || this.volume > 80) return this.volBar[1]
    if (this.volume == 80 || this.volume > 70) return this.volBar[2]
    if (this.volume == 70 || this.volume > 60) return this.volBar[3]
    if (this.volume == 60 || this.volume > 50) return this.volBar[4]
    if (this.volume == 50 || this.volume > 40) return this.volBar[5]
    if (this.volume == 40 || this.volume > 50) return this.volBar[6]
    if (this.volume == 30 || this.volume > 40) return this.volBar[7]
    if (this.volume == 20 || this.volume > 30) return this.volBar[8]
    if (this.volume == 10 || this.volume > 20) return this.volBar[9]
    if (this.volume === 0 || this.volume > 10) return this.volBar[9]
    if (this.volume === 0 || this.volume <= 9) return this.volBar[10]
  }
}

// ---------------------------------------------------------------------------

class Volume extends Command {
  constructor(nep) {
    super(nep, {
      name: path.basename(__filename, '.js'),
      help: `Change how loud music is.`,
      longHelp: `Changes how loud music is (1-100).`,
      usage: [`• ${nep.prefix}${path.basename(__filename, '.js')} <Volume>`],
      examples: [`• ${nep.prefix}${path.basename(__filename, '.js')} 75`],
      category: path.dirname(__filename).split(path.sep).pop(),
      cooldown: 1e3,
      aliases: [],
      locked: false,
      allowDM: false
    });
  }

  // ---------------------------------------------------------------------------

  run(msg, util, args, nep) {
    // Make sure permissions check out
    if (!msg.member.hasPermission('ADMINISTRATOR') && !findRole()) return util.embed(`:x: | You can only use this if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `);
    // Handle no args
    else if (!args[0]) return util.embed(`:x: | Provide a **number** that's \`between 1-100\` to set as the volume!`);
    try {
      var voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
      var dispatcher = voiceConnection.player.dispatcher; // Dispatcher
      var queue = util.getQueue(msg.guild.id); // Guilds' queue
    } catch (err) {
      // Make sure something is playing
      return util.embed(`:x: | I'm not **playing anything**, leave me alone!`);
    }
    // Make sure args is a number
    if (!parseInt(args[0]) && isNaN(args[0])) return util.embed(`:x: | Did you learn your numbers, because \`${util.parseArgs(args[0])}\` isn't one of them!`);
    // Make sure args is in range of 1-100
    else if (parseInt(args[0]) > 100 && isFinite(parseInt(args[0]))) args[0] = 100;
    else if (parseInt(args[0]) <= 0) args[0] = 1;

    // If everything checks out, set volume for the queue
    queue.volume = parseInt(args[0]);
    ;
    dispatcher.setVolume(Math.floor(args[0]) / 100);

    const bar = new VolumeBar(Math.floor(args[0])); // Initalize volume bar class

    return util.embed(`🎧 | Okay, the volume is now \`${Math.floor(args[0])}\`!\n[${bar.self}]`);

    // Find NeptuneDJ
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

module.exports = Volume;
