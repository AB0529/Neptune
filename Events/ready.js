module.exports = class {

    constructor(nep) {
        this.nep = nep;
    }

    run() {
        let nep = this.nep;
        nep.utils = new(require(`../Classes/Utils.js`))(nep); // Nep utilss class

        nep.utils.log(`Ready`, `Client logged in and ready`, `${nep.user.tag}`); // Client logged in and is ready

        nep.connection.connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            // console.log(`[MySQL] Mysql safely connected as id ${nep.connection.threadId}`.yellow)

        });

        nep.connection.query(`SELECT * FROM playingStatus`, function(err, row) { // Get playing status data from table
            if (err)
              return nep.utils.log(`MySQL Error`, err.message); // Handle error
            else if (row.length <= 0) {
              nep.connection.query(`INSERT INTO playingStatus (status, type) VALUES (?, ?)`, [`Hello yes`, `PLAYING`]);
              return nep.utils.log(`Playing Status`, `None in Database`); // If no status in database
            }

            let presence = nep.user.presence.status;

            nep.user.setActivity(row[0].status, { type: row[0].type }); // Set status
            nep.utils.log(`Status`, `${row[0].type}: ${row[0].status}`, `${presence[0].toUpperCase()}${presence.split(presence[0]).join('')}`); // Log status

        });

    }

}
