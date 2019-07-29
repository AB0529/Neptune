const fs = require('fs');

const Utils = require('./Utils.js');
const {
	Client,
	Collection
} = require('discord.js');

class Nep extends Client {
	constructor(options) { // Initialise Nep client
		super({ disableEveryone: true, messageCacheLifetime: 60, messageSweepInterval: 65 }, options.client || {}); // Custom options for client


		this.commands = new Collection(); // Commands
		this.aliases = new Collection(); // Command aliases
		this.utils = new Utils(this); // Utils Class
		this.config = options.config ? require(`../${options.config}`) : {}; // Client config

		let file = fs.readFileSync(`${this.config.dir}/queues.json`);
		this.queues = JSON.parse(file);
		
		this.utils.log(`Info`, `Client initialised`);
	}

	// ---------------------------------------------------------------------------

	login(token) { // Login to client
		super.login(token); // Log bot in
		return this; // Return this client
	}

	// ---------------------------------------------------------------------------

	loadCommands(dir) { // Load all commands
		fs.readdir(dir, (err, categorys) => { // Load categories
			if (err) return this.utils.log(`Command Loading`, err); // Handle error

			categorys.forEach((cat) => { // Get each category
				fs.readdir(`${dir}/${cat}`, (err, commands) => { // Load commands from category
					if (err) return this.utils.log('Command Loading', err.message); // Handle error

					commands.forEach((c) => { // Each command for commands
						const command = new(require(`${dir}/${cat}/${c}`))(this); // Initialise command

						this.commands.set(command.info.name, command); // Push into command collection
						command.config.aliases.map((a) => this.aliases.set(a, command.info.name)); // Push into command aliases collection
					});
				});
			});

		});

		this.utils.log(`Commands`, `Commands Loaded`);
		return this; // Return this client
	}

	// ---------------------------------------------------------------------------

	loadEvents(dir) { // Load all events
		fs.readdir(dir, (err, events) => { // Load all events from dir
			if (err) return this.utils.log('Event Loading', err); // Handle error

			events.forEach((eventy) => { // Each eventy for all events
				const event = new(require(`${dir}/${eventy}`))(this); // Initialise event class
				super.on(eventy.split('.')[0], (...args) => event.run(...args)); // Run event
				//         if (eventy.split('.')[0] == 'musicMessage') {
				//           super.on('message', (...args) => event.run(...args));
				//         }
			});
		});
		this.utils.log(`Events`, `Events Loaded`);
		return this; // Return this client
	}

	// ---------------------------------------------------------------------------

}

module.exports = Nep;
