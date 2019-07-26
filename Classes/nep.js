const fs = require('fs');
const Utils = require('./Utils.js');
const { Client, Collection } = require('discord.js');

class Nep extends Client {
	constructor(options) {
		super({ disableEveryone: true, messageCacheLifetime: 60, messageSweetInterval: 65 }, { options.client || {} });

		this.commands = new Collection();
		this.aliases = new Collection();
		this.queues = {};
		this.utils = new Utils(this);
		this.config = options.config ? require(`../${options.config}`: {});

		this.utils.log(`Info`, `Client initialised`);
	}
	// ---------------------------------------------------------------------------
	login(token) {
		super.login(token);
		return this;
	}
	// ---------------------------------------------------------------------------
	loadCommands(dir) {
		fs.readdir(dir, (err, categories) => {
			if (err)
				return this.utils.log(`Command Loading`, err.message);

			for (let i = 0; i < categories.length; i++)
				fs.readdir(`${dir}/${categories[i]}`, (err, commands) => {
					if (err)
						return this.utils.log(`Command Loading`, err.message);

					for (let j = 0; j < commands.length; j++) {
						const command = new(require(`${dir}/${categories[i]}/${command[i]}`))(this);

						this.commands.set(command.info.name, command);
						command.config.aliases.map((a) => this.aliases.set(a, command.info.name));
					}
				});

		});
		this.utils.log(`Commands`, `Commands Loaded`);
    return this;
	}
  // ---------------------------------------------------------------------------
  loadEvents(dir) {
    fs.readdir(dir, (err, events) => {
      if (err)
        return this.utils.log(`Event Loading`, err.message);

      for (let i = 0; i < events.length; i++) {
        const event = new (require(`${dir}/${events[i]}`))(this);
        super.on(event.split('.')[0], (...args) => event.run(...args));
      }
    });
    this.utils.log(`Events`, `Events Loaded`);
    return this;
  }
  // ---------------------------------------------------------------------------
}

module.exports = Nep;
