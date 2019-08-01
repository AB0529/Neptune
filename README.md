# Neptune

A discord bot built using [Discord.JS](https://discord.js.org/#/) with various features.

## Getting Started

* Install the dependencies via `npm i`

### Prerequisites

* NodeJS version 8.x or higher
* Discord Bot token
* Neptune-API token
* Wolke-API toke
* FFMPEG

## Neptune-API

Many music features require this API to function. Go to [Neptune-API](https://github.com/MoistSenpai/Neptune-API) for install and key.

### Installing


Install the dependencies

```
npm i
```

* Make a copy of `config.json.sample` and remove the `.sample` extension.


## Getting MySQL setup

* Make sure you have MySQL installed and run `mysql`
* Now run these commands


# Creating the database
```sql
CREATE DATABASE `Neptune_DB`;
```

# Creating the servers table
```sql
CREATE TABLE `testDB`.`servers` ( `guildId` VARCHAR(255) NOT NULL , `prefix` VARCHAR(255) NOT NULL , `queue` LONGTEXT NOT NULL ) ENGINE = InnoDB;
ALTER TABLE `servers` ADD PRIMARY KEY(`guildId`);
```

# Creating the playingStatus table
```sql
CREATE TABLE `testDB`.`playingStatus` ( `status` VARCHAR(255) NOT NULL , `type` VARCHAR(255) NOT NULL ) ENGINE = InnoDB;
ALTER TABLE `playingStatus` ADD PRIMARY KEY(`status`);
INSERT INTO `playingStatus` (status, type) VALUES ('Hello, world', 'PLAYING');
```


## Authors

* **AB0529** - *Initial work* - [Anish B.](https://github.com/MoistSenpai)
