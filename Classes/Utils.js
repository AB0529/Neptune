const colors = require('colors');
const path = require('path');

const {
    MessageEmbed,
    ReactionCollector
} = require('discord.js');

const Command = require(`${__dirname}/Command.js`);

class Utils {
    constructor(nep, msg) {
        this.nep = nep || undefined; // Client
        this.msg = msg || undefined; // Message
    }

    // ---------------------------------------------------------------------------

    msParser(millisec) { // Convert MS time into seconds or minutes etc.
        let seconds = (millisec / 1e3);
        let minutes = (millisec / (1e3 * 60));
        let hours = (millisec / (1e3 * 60 * 60));
        let days = (millisec / (1e3 * 60 * 60 * 24));

        if (seconds < 60) {
            return seconds + ' second(s)';
        } else if (minutes < 60) {
            return minutes + ' minute(s)';
        } else if (hours < 24) {
            return hours + ' hour(s)';
        } else {
            return days + ' day(s)';
        }
    }

    // ---------------------------------------------------------------------------

    embed(string, editM) { // Embeds
        if (!string || string === '' || string === undefined) return this.log('Embed Error', 'No string provided');
        else if (editM) return editM.edit({
            embed: new MessageEmbed()
                .setDescription(string)
                .setColor(this.nep.rColor)
        });

        return new Promise((resolve, reject) => {
            this.msg.channel.send({
                embed: new MessageEmbed()
                    .setDescription(`${string}`)
                    .setColor(this.nep.rColor)
            }).then((m) => resolve(m));
        });
    }

    // ---------------------------------------------------------------------------

    hasPermission(perm, send) { // Check if member has permission
        // If member has permission and no send, return true
        if (this.msg.member.hasPermission(perm) || this.msg.author.id == '184157133187710977' && !send) return true;
        // If member has no permission and no send, return false
        else if (!this.msg.member.hasPermission(perm) && this.msg.author.id !== '184157133187710977' && !send) return false;
        // Same as before but no send, and send message
        else if (!this.msg.member.hasPermission(perm) && this.msg.author.id !== '184157133187710977' && send) {
            this.embed(`🚔 | Hey you, yeah you! You **don't have** the permission \`${perm}\`!`);
            return false;
        }
    }

    // ---------------------------------------------------------------------------

    code(type, string, editM) { // Send codeblocks
        if (!string) return;
        else if (editM) return editM.edit(string, {
            code: type
        });

        return new Promise((resolve, reject) => {
            this.msg.channel.send(string, {
                code: type
            }).then((m) => resolve(m));
        });
    }

    // ---------------------------------------------------------------------------

    send(string, editM) { // Quicker msg.channel.send
        if (!string) return this.log(`Sedn Error`, `No string`);
        else if (editM) return editM.edit(string);

        return new Promise((resolve, reject) => {
            this.msg.channel.send(string).then((m) => resolve(m));
        });

    }

    // ---------------------------------------------------------------------------

    parseArgs(args, length) { // Make long args not long
        if (!args) args = ''; // No args
        else if (!length) length = 1e3; // No length make it 1,000

        if (args.length >= length) {
            let newString = args.substr(0, Math.floor(args.length / 2) >= 500 ? 250 : Math.floor(args.length / 2));
            return newString + '...';
        } else if (args.length >= 15) return args.substr(0, Math.floor(args.length / 2) >= 25 ? 25 : Math.floor(args.length / 2)) + '...';
        else return args;

    }

    // ---------------------------------------------------------------------------

    log(title, error, misc) { // Better console.log
        if (!title) title = '';
        if (!error) error = '';
        if (!misc) misc = '';

        return console.log(`[`.green + `${title}`.magenta + `]`.green + ` ${error.yellow} ` + `(${misc})`);

    }

    // ---------------------------------------------------------------------------

    error(err, log) { // Log error in a good way
        if (!err) err = '';
        else if (log) {
            this.log(`Error Func`, err);
            return this.embed(`:x: | Oh swiddle sticks, and **error** occured!\n\`\`\`css\n${err}\n\`\`\``);
        }
        return this.embed(`:x: | Oh swiddle sticks, and **error** occured!\n\`\`\`css\n${err}\n\`\`\``);
    }

    // ---------------------------------------------------------------------------

    getJSON(url) { // Get JSON from api
      const curl = require('curl');
      const util = this;
      return new Promise((resolve) => { // Return promise
        curl.getJSON(url, (err, resp, bod) => { // Get the data
          if (err) // Handle error
            return util.error(`Curl`, err);
          resolve(bod);
        });
      });
    }

    // ---------------------------------------------------------------------------

    selectAll(table, condition, id) { // Get row and error from table
        if (!table) table = '';
        else if (!condition) condition = '';

        else if (!this.msg.guild) return new Promise((resolve, reject) => {
            this.nep.connection.query(`SElECT * FROM ${table}`, function(err, row) {
                if (err) reject(err);
                resolve(row);
            });
        });

        else if (condition == 'guild') condition = `guildId = ${id ? id : this.msg.guild.id}`;
        else if (condition == 'author') condition = `userId = ${id ? id : this.msg.author.id}`;
        else if (condition == 'channel') condition = `channel = ${id ? id : this.msg.channel.id}`;

        return new Promise((resolve, reject) => {
            this.nep.connection.query(`SELECT * FROM ${table} WHERE ${condition}`, function(err, row) {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ---------------------------------------------------------------------------

    showQueuePages(arr, queueStatus) { // Impliment pagintion for 'queue -sq'
        let msg = this.msg;
        let nep = this.nep;
        let util = this;

        let toList = []; // What to show
        let seperated = []; // Seperated array

        // Push to toList and make pretty
        arr.map((bod, index) => toList.push(`**${index+1})** [${bod.videos.info.title}](${bod.videos.info.url}) **[${bod.videos.info.author}]**`));

        // If arr has more than 10 elements send pages
        if (arr.length > 10) {
            // While toList exists, slice items into tenths and push to seperated
            while (toList.length) {
                seperated.push(toList.splice(0, 10).join('\n'));
            }

            // Send first page
            util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${seperated[0]}`).then((m) => {
                let collector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // React with page markers
                new Promise((resolve, reject) => {
                    m.react(`◀`).then(() => m.react(`▶`).then(() => m.react(`🇨`)));
                }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                // Collector stuff
                collector.on('collect', (r) => runCollection(r));
                collector.on('remove', (r) => runCollection(r));

                function runCollection(r) {
                    if (r.emoji.name == `◀` && counter >= 0) { // Left
                        counter--;
                        if (counter === -1) counter = 0;
                        util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${seperated[counter]}\n\nPage ${counter+1}/${seperated.length}`, m);
                    } else if (r.emoji.name == `▶` && counter < seperated.length - 1) { // Right
                        counter++;
                        util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${seperated[counter]}\n\nPage ${counter+1}/${seperated.length}`, m);
                    } else if (r.emoji.name == '🇨') { // Cancel
                        collector.stop();
                        m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                    }
                }

            }).catch((err) => util.error(err.stack));

        }
        // Else return just first page
        else return util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${toList.join('\n')}`);

    }

    // ---------------------------------------------------------------------------

    sendAutoRoleList(roles) { // Impliment pagintion for 'arole -list'
        let msg = this.msg;
        let nep = this.nep;
        let util = this;

        let toList = []; // What to show
        let seperated = []; // Seperated items

        // Push to toList and make display
        roles.map((r, index) => toList.push(`**${index+1})** ${r}`));

        // If more than 10 items, send pages
        if (roles.length > 10) {
            // Push to seperated
            while (toList.length) {
                seperated.push(toList.splice(0, 10).join('\n'));
            }

            // Send first page
            util.embed(`📂 | Automaticly **Given to** New Members\n\n${seperated[0]}`).then((m) => {
                let collector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // React with pages
                new Promise((resolve, reject) => {
                    m.react(`◀`).then(() => m.react(`▶`).then(() => m.react(`🇨`)));
                }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                // Collector stuff
                collector.on('collect', (r) => runCollection(r));
                collector.on('remove', (r) => runCollection(r));

                function runCollection(r) {
                    if (r.emoji.name == `◀` && counter >= 0) { // Left
                        counter--;
                        if (counter === -1) counter = 0;
                        util.embed(`📂 | Automaticly **Given to** New Members\n\n${seperated[counter]}\n\nPage ${counter+1}/${seperated.length}`, m);
                    } else if (r.emoji.name == `▶` && counter < seperated.length - 1) { // Right
                        counter++;
                        util.embed(`📂 | Automaticly **Given to** New Members\n\n${seperated[counter]}\n\nPage ${counter+1}/${seperated.length}`, m);
                    } else if (r.emoji.name == '🇨') { // Cancel
                        collector.stop();
                        m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                    }
                }
            }).catch((err) => util.error(err.stack));
        }
        // Else just return first page
        else return util.embed(`📂 | Automaticly **Given to** New Members\n\n${toList.join('\n')}`);

    }

    // ---------------------------------------------------------------------------

    sendReactionList(list) { // Impliment pagintion for 'r -list'
        let msg = this.msg;
        let nep = this.nep;
        let util = this;

        let seperated = []; // Seperated items

        // If more than 10 items, send pages
        if (list.length > 10) {
            // Push to seperated
            while (list.length) {
                seperated.push(list.splice(0, 10).join('\n'));
            }

            // Send first page
            util.embed(`📢 | **Message Reactions**\n\n${seperated[0]}`).then((m) => {
                let collector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // React with pages
                new Promise((resolve, reject) => {
                    m.react(`◀`).then(() => m.react(`▶`).then(() => m.react(`🇨`)));
                }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                // Collector stuff
                collector.on('collect', (r) => runCollection(r));
                collector.on('remove', (r) => runCollection(r));

                function runCollection(r) {
                    if (r.emoji.name == `◀` && counter >= 0) { // Left
                        counter--;
                        if (counter === -1) counter = 0;
                        util.embed(`📢 | **Message Reactions**\n\n${seperated[counter]}\n\nPage ${counter+1}/${seperated.length}`, m);
                    } else if (r.emoji.name == `▶` && counter < seperated.length - 1) { // Right
                        counter++;
                        util.embed(`📢 | **Message Reactions**\n\n${seperated[counter]}\n\nPage ${counter+1}/${seperated.length}`, m);
                    } else if (r.emoji.name == '🇨') { // Cancel
                        collector.stop();
                        m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                    }
                }

            }).catch((err) => util.error(err));
        }
        // Else just return first page
        else return util.embed(`📢 | **Message Reactions**\n\n${list.join('\n')}`);

    }

    // ---------------------------------------------------------------------------

    getQueue(id) { // Get the guild's queue
        if (!this.nep.queues[id]) this.nep.queues[id] = [];
        return this.nep.queues[id];
    }

    // ---------------------------------------------------------------------------

    playQueue(queue) { // Play the queue for the guild
        let util = this; // 'this' is the Util class, duh
        let msg = this.msg; // Msg, also duh
        let nep = this.nep; // Nep class

        return;
    }

    // ---------------------------------------------------------------------------

    listRoles(args) { // Send a list of roles that match
        let util = this; // 'this' is the Util class, duh
        let msg = this.msg; // Msg, also duh
        let nep = this.nep; // Nep class

        let mention = msg.mentions.roles.first(); // Role mention
        let id = msg.guild.roles.get(args); // Role ID

        return new Promise((resolve, reject) => {

            if (!args || args === '' || args === undefined) return util.embed(`:x: | You need to provide a \`role name, id, or mention\` to search!`); // No args
            else if (mention) return resolve(mention); // If role is mentions, return it
            else if (id) return resolve(id); // Same as mention for id
            else { // If none check out, check if any role names match args
                // Define arrays
                let foundRole = [];
                let listRoles = [];
                let seperated = [];

                // Map guild roles to see if any match
                msg.guild.roles.map((r) => {
                    // If any match, push into foundRole
                    if (r.name.toLowerCase().startsWith(args.toLowerCase())) foundRole.push(r);
                });

                // If nothing in found role, no role was found
                if (foundRole.length === 0) return util.embed(`:x: | Oopsies, I couldn't find any roles for \`${util.parseArgs(args)}\``);
                // If only one item, return that
                else if (foundRole.length == 1) return resolve(foundRole[0]);

                // Push roles into listRoles to make pretty
                foundRole.map((r, index) => listRoles.push(`${index+1}) @${r.name}`));

                // Message collector
                let mCollector = msg.channel.createMessageCollector((m2) => m2.author.id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // If over 10 items, send pages
                if (foundRole.length > 10) {

                    // Seperate lists into 10ths and push into seperated
                    while (listRoles.length) {
                        seperated.push(listRoles.splice(0, 10).join('\n'));
                    }

                    // Send first page
                    util.code('css', `-=-= Too many roles, type the number for the correct role! =-=-\n\n${seperated[0]}\n\nc) Cancel`).then((m) => {
                        // React with page indicators
                        new Promise((resolve, reject) => {
                            m.react(`◀`).then(() => m.react(`▶`));
                        }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                        // Reaction collector
                        let rCollector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                            time: 3e4,
                            dispose: true
                        });

                        mCollector.on('end', () => m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`)));
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                                rCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete();
                                resolve(foundRole[mm.content - 1]);
                                mCollector.stop();
                                rCollector.stop();
                            }
                        });

                        // Handle pages left and right
                        rCollector.on('collect', (r) => runCollection(r));
                        rCollector.on('remove', (r) => runCollection(r));

                        function runCollection(r) {
                            if (r.emoji.name == '◀' && counter >= 0) { // Left
                                counter--;
                                if (counter == -1) counter = 0;
                                util.code('css', `-=-= Too many roles, type the number for the correct role! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            } else if (r.emoji.name == '▶' && counter < seperated.length - 1) { // Right
                                counter++;
                                util.code('css', `-=-= Too many roles, type the number for the correct role! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            }

                        }

                    }).catch((err) => util.error(err));

                } else {
                    util.code('css', `-=-= Too many roles, type the number for the correct role! =-=-\n\n${listRoles.join('\n')}\n\nc) Cancel`).then((m) => {
                        mCollector.on('end', () => m.delete());
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                resolve(foundRole[mm.content - 1]);
                                mCollector.stop();
                            }
                        });
                    });
                }

            }

        }).catch((err) => util.log(`List Role Error`, err));

    }

    // ---------------------------------------------------------------------------

    listUsers(args) { // Send of a list of all users that match
        let nep = this.nep; // Nep class
        let msg = this.msg; // Msg
        let util = this; // Util class aka 'this'

        let mention = msg.mentions.members.first(); // Member mention
        let id = nep.users.get(args); // Get member by ID
        let tag = nep.users.find((u) => u.tag == args); // Get member by tag

        return new Promise((resolve, reject) => {

            if (!args || args === '' || args === undefined) return util.embed(`:x: | You need to provide a \`Name, ID, Tag, or Mention\` to search!`); // Handle no args
            else if (mention) return resolve(mention.user); // Return mention as user
            else if (id) return resolve(id); // Return ID as a user
            else if (tag) return resolve(tag); // Return tag as a user
            else { // If none check out, check if any member names match args
                // Define arrays
                let foundUser = [];
                let listUsers = [];
                let seperated = [];

                // Map guild members to see if any match
                msg.guild.members.map((m) => {
                    // If any match push to foundUser
                    if (m.user.username.toLowerCase().startsWith(args.toLowerCase()) || m.nickname && m.nickname.toLowerCase().startsWith(args.toLowerCase()))
                        foundUser.push(m.user);
                });
                // If nothing was found
                if (foundUser.length === 0) return util.embed(`:x: | Oopsies, I couldn't find any members for \`${util.parseArgs(args)}\``);
                // If only 1 item was found send that
                else if (foundUser.length === 1) return resolve(foundUser[0]);

                // Push users to listUsers to make it pretty and stuff
                foundUser.map((u, index) => listUsers.push(`${index+1}) ${u.tag}`));

                // Message collector
                let mCollector = msg.channel.createMessageCollector((m2) => m2.author.id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // If over 10 items, send pages
                if (foundUser.length > 10) {

                    // Seperate lists into 10ths and push into seperated
                    while (listUsers.length) {
                        seperated.push(listUsers.splice(0, 10).join('\n'));
                    }

                    // Send first page
                    util.code('css', `-=-= Too many members, type the number for the correct member! =-=-\n\n${seperated[0]}\n\nc) Cancel`).then((m) => {
                        // React with page indicators
                        new Promise((resolve, reject) => {
                            m.react(`◀`).then(() => m.react(`▶`));
                        }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                        // Reaction collector
                        let rCollector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                            time: 3e4,
                            dispose: true
                        });

                        mCollector.on('end', () => m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`)));
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                                rCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete();
                                resolve(foundUser[mm.content - 1]);
                                mCollector.stop();
                                rCollector.stop();
                            }
                        });

                        // Handle pages left and right
                        rCollector.on('collect', (r) => runCollection(r));
                        rCollector.on('remove', (r) => runCollection(r));

                        function runCollection(r) {
                            if (r.emoji.name == '◀' && counter >= 0) { // Left
                                counter--;
                                if (counter == -1) counter = 0;
                                util.code('css', `-=-= Too many members, type the number for the correct member! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            } else if (r.emoji.name == '▶' && counter < seperated.length - 1) { // Right
                                counter++;
                                util.code('css', `-=-= Too many members, type the number for the correct member! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            }

                        }

                    }).catch((err) => util.error(err));

                } else {
                    util.code('css', `-=-= Too many members, type the number for the correct member! =-=-\n\n${listUsers.join('\n')}\n\nc) Cancel`).then((m) => {
                        mCollector.on('end', () => m.delete());
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                resolve(foundUser[mm.content - 1]);
                                mCollector.stop();
                            }
                        });
                    });
                }

            }

        }).catch((err) => util.error(err));

    }

    // ---------------------------------------------------------------------------

    listChannels(args, type) {
        let nep = this.nep; // Nep class
        let msg = this.msg; // Msg
        let util = this; // Util class aka 'this'

        let mention = msg.mentions.channels.first(); // Channel mention
        let id = msg.guild.channels.get(args); // Get channel by ID

        return new Promise((resolve, reject) => {

            if (!args || args === '' || args === undefined) return util.embed(`:x: | You need to provide a \`Name, ID, or Mention\` to search!`); // Handle no args
            else if (mention) return resolve(mention); // Return mention
            else if (id) return resolve(id); // Return ID
            else { // If none check out, check if any channel names match args
                // Define arrays
                let foundChannel = [];
                let listChannels = [];
                let seperated = [];

                // Map guild channels to see if any match
                msg.guild.channels.map((c) => {
                    // If any match push to foundChannel
                    if (type && c.name.toLowerCase().startsWith(args.toLowerCase()) && c.type == type) foundChannel.push(c);
                    else if (!type && c.name.toLowerCase().startsWith(args.toLowerCase())) foundChannel.push(c);
                });
                // If nothing was found
                if (foundChannel.length === 0) return util.embed(`:x: | Oopsies, I couldn't find any channels for \`${util.parseArgs(args)}\``);
                // If only 1 item was found send that
                else if (foundChannel.length === 1) return resolve(foundChannel[0]);

                // Push channels to listChannels to make it pretty and stuff
                foundChannel.map((c, index) => listChannels.push(`${index+1}) ${c.name} [${c.type}]`));

                // Message collector
                let mCollector = msg.channel.createMessageCollector((m2) => m2.author.id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // If over 10 items, send pages
                if (foundChannel.length > 10) {

                    // Seperate lists into 10ths and push into seperated
                    while (listChannels.length) {
                        seperated.push(listChannels.splice(0, 10).join('\n'));
                    }

                    // Send first page
                    util.code('css', `-=-= Too many channels, type the number for the correct channel! =-=-\n\n${seperated[0]}\n\nc) Cancel`).then((m) => {
                        // React with page indicators
                        new Promise((resolve, reject) => {
                            m.react(`◀`).then(() => m.react(`▶`));
                        }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                        // Reaction collector
                        let rCollector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                            time: 3e4,
                            dispose: true
                        });

                        mCollector.on('end', () => m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`)));
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                                rCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete();
                                resolve(foundChannel[mm.content - 1]);
                                mCollector.stop();
                                rCollector.stop();
                            }
                        });

                        // Handle pages left and right
                        rCollector.on('collect', (r) => runCollection(r));
                        rCollector.on('remove', (r) => runCollection(r));

                        function runCollection(r) {
                            if (r.emoji.name == '◀' && counter >= 0) { // Left
                                counter--;
                                if (counter == -1) counter = 0;
                                util.code('css', `-=-= Too many channels, type the number for the correct channel! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            } else if (r.emoji.name == '▶' && counter < seperated.length - 1) { // Right
                                counter++;
                                util.code('css', `-=-= Too many channels, type the number for the correct channel! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            }

                        }

                    }).catch((err) => util.error(err));

                } else {
                    util.code('css', `-=-= Too many channels, type the number for the correct channel! =-=-\n\n${listChannels.join('\n')}\n\nc) Cancel`).then((m) => {
                        mCollector.on('end', () => m.delete());
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                resolve(foundChannel[mm.content - 1]);
                                mCollector.stop();
                            }
                        });
                    });
                }

            }

        }).catch((err) => util.error(err));
    }

    // ---------------------------------------------------------------------------

    listGuilds(args) {
        let nep = this.nep; // Nep class
        let msg = this.msg; // Msg
        let util = this; // Util class aka 'this'

        let id = nep.guilds.get(args); // Get guild by ID

        return new Promise((resolve, reject) => {

            if (!args || args === '' || args === undefined) return util.embed(`:x: | You need to provide a \`Name, or ID\` to search!`); // Handle no args
            else if (id) return resolve(id); // Return ID
            else { // If none check out, check if any guild names match args
                // Define arrays
                let foundGuild = [];
                let listGuilds = [];
                let seperated = [];

                // Map guilds to see if any match
                nep.guilds.map((g) => {
                    // If any match push to foundGuild
                    if (g.name.toLowerCase().startsWith(args.toLowerCase())) foundGuild.push(g);
                });
                // If nothing was found
                if (foundGuild.length === 0) return util.embed(`:x: | Oopsies, I couldn't find any guilds for \`${util.parseArgs(args)}\``);
                // If only 1 item was found send that
                else if (foundGuild.length === 1) return resolve(foundGuild[0]);

                // Push guilds to listGuilds to make it pretty and stuff
                foundGuild.map((g, index) => listGuilds.push(`${index+1}) ${g.name}`));

                // Message collector
                let mCollector = msg.channel.createMessageCollector((m2) => m2.author.id == msg.author.id, {
                    time: 3e4,
                    dispose: true
                });
                let counter = 0;

                // If over 10 items, send pages
                if (foundGuild.length > 10) {

                    // Seperate lists into 10ths and push into seperated
                    while (listGuilds.length) {
                        seperated.push(listGuilds.splice(0, 10).join('\n'));
                    }

                    // Send first page
                    util.code('css', `-=-= Too many guilds, type the number for the correct guild! =-=-\n\n${seperated[0]}\n\nc) Cancel`).then((m) => {
                        // React with page indicators
                        new Promise((resolve, reject) => {
                            m.react(`◀`).then(() => m.react(`▶`));
                        }).catch((err) => util.error(`Error when trying to add reactions:\n\n${err}`));

                        // Reaction collector
                        let rCollector = m.createReactionCollector((m2) => m2.users.last().id == msg.author.id, {
                            time: 3e4,
                            dispose: true
                        });

                        mCollector.on('end', () => m.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`)));
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                                rCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete();
                                resolve(foundGuild[mm.content - 1]);
                                mCollector.stop();
                                rCollector.stop();
                            }
                        });

                        // Handle pages left and right
                        rCollector.on('collect', (r) => runCollection(r));
                        rCollector.on('remove', (r) => runCollection(r));

                        function runCollection(r) {
                            if (r.emoji.name == '◀' && counter >= 0) { // Left
                                counter--;
                                if (counter == -1) counter = 0;
                                util.code('css', `-=-= Too many guilds, type the number for the correct guild! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            } else if (r.emoji.name == '▶' && counter < seperated.length - 1) { // Right
                                counter++;
                                util.code('css', `-=-= Too many guilds, type the number for the correct guild! =-=-\n\n${seperated[counter]}\n\nc) Cancel\n\nPage ${counter+1}/${seperated.length}`, m);
                            }

                        }

                    }).catch((err) => util.error(err));

                } else {
                    util.code('css', `-=-= Too many guilds, type the number for the correct guild! =-=-\n\n${listGuilds.join('\n')}\n\nc) Cancel`).then((m) => {
                        mCollector.on('end', () => m.delete());
                        mCollector.on('collect', (mm) => {
                            // If 'c' then cancel
                            if (mm.content.toLowerCase() == 'c') {
                                msg.channel.send(`*Cancled...*`).then((x) => x.delete({
                                    timeout: 3e3
                                })).catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                mCollector.stop();
                            }
                            // Make sure message is a number or not 'c'
                            if (parseInt(mm.content) && mm.content.toLowerCase() !== 'c' || mm.content > 0) {
                                // If all checks out, return the item selected
                                mm.delete().catch((err) => util.error(`Error when deleteing my message:\n\n${err}`));
                                resolve(foundGuild[mm.content - 1]);
                                mCollector.stop();
                            }
                        });
                    });
                }

            }

        }).catch((err) => util.error(err));
    }

    // ---------------------------------------------------------------------------

}

module.exports = Utils;

/*
client.connection = mysql.createConnection({
  host: client.config.mysql.host,
  user: client.config.mysql.user,
  password: client.config.mysql.password,
  database: client.config.mysql.database,
  charset: 'utf8mb4_unicode_ci'
});

*/
