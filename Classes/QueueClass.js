class QueueClass {
  constructor(msg, util, args, nep) {
    this.msg = msg || null;
    this.util = util || null;
    this.args = args || null;
    this.nep = nep || null;
  }
  // list, clear, remove, shuffle
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
            counter = sep.length-1;
          util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${sep[counter]}\n\nPage ${(counter)+1}/${sep.length}`, m);
          // r.users.remove(msg.author);
        }
        // Cancel
        else if (r.emoji.name == `❌`) {
          collector.stop();
          m.delete({timeout: 500}).catch((err) => util.error(`Error when deleteing msg\n\n${err}`));
        }
      }

    }
    // If else than 10 items just send first page
    else
      return util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${toList.join('\n')}`);
  }

  // ---------------------------------------------------------------------------



  // ---------------------------------------------------------------------------

}

module.exports = QueueClass;
