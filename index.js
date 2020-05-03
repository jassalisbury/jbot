// imports
// const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const fs = require('fs');
const _ = require('lodash');
const F = require('bad-words');
const env = require('node-env-file');
const filter = new F();

// init
env(__dirname + '/.env');
const rawInsults = fs.readFileSync('insults.csv', "utf8");
const insults = rawInsults.split(',');
const rawNouns = fs.readFileSync('nouns.csv', "utf8");
const nouns = rawNouns.split(',');
const tooltime = fs.readdirSync('TOOLMAN');
const philly = fs.readdirSync('PHILLY');

// consts
const JOSH = '355856039003815936';
const KEVIN = '355869488685514753';
const NATE = '209483103612174336';
const WYATT = '159102727887126528';
const NELSON = '367863632375316482';
const NICK = '249824869133451264';
const TANNER = '463493575116849152';
const RANDOM_BOT = '705141350345080842';
const J_BOT = '705089896850653295';
const DEFAULT = 'DEFAULT';
const CMD = 'jbot';

const VERSION = '1';

const users = {
    [WYATT]: {
        name: 'wyatt',
        v_intro: './intros/wyatt.mp3',
        repeat: {
            freq: function() {
                return chance(2);
            },
            message: 'HOHAOHEHAHAHAHEA'
        },
    },
    [NATE]: {
        name: 'nate',
        v_intro: './intros/nate.mp3',
    },
    [KEVIN]: {
        name: 'kevin',
        v_intro: './intros/kevin.mp3',
    },
    [JOSH]: {
        name: 'josh',
        v_intro: './intros/josh.mp3',
    },
    [NELSON]: {
        name: 'nelson',
        v_intro: './intros/nelson.mp3',
        intro: 'ALL HAIL EMPEROR NELSON'
    },
    [NICK]: {
        name: 'nick',
        v_intro: './intros/nick.mp3',
        volume_override: 0.8,
    },
    [TANNER]: {
        name: 'tanner',
        v_intro: './intros/tanner.mp3',
    },
    [DEFAULT]: {
        name: 'unknown',
        v_intro: './intros/default.mp3',
    },
    [RANDOM_BOT]: {
        name: 'Random Bot',
        v_intro: null,
        bot: true,
    },
    [J_BOT]: {
        name: 'Jbot',
        v_intro: null,
        bot: true,
    }
}

const client = new Discord.Client();

// funcs
function voiceChannels() {
    return client.channels.cache.filter((channel) => {
        return channel.type === 'voice';
    });
}

function genInsult(target) {
    const insult = _.sample(insults);
    const noun = _.sample(nouns);
    if (target) {
        return `${target} you ${insult} ${noun}`;
    } else {
        return `you ${insult} ${noun}`;
    }
}

function processInsult(insultStr, username) {
    const target = insultStr.trim();
    if (target === 'me') {
        return genInsult(username);
    } else {
        return genInsult(target);
    }
}

function chance(outOfTen) {
    const rand = Math.random() * 10
    return rand < outOfTen
}

function broadcastVoice(message, folder, files) {
    const guildId = message.channel.guild.id;
    const vc = voiceChannels();
    const filtered = vc.filter((channel) => {
        return channel.guild.id === guildId;
    });
    const broadcast = client.voice.createBroadcast();
    broadcast.play(`${folder}/${_.sample(files)}`);
    filtered.forEach(async (channel) => {
        const con = await channel.join();
        con.play(broadcast);
    });
}

function runCommand(str, message) {
    if (!str.startsWith(CMD)) {
        return;
    }

    command = str.replace(CMD, '').trim();

    if (command.startsWith('insult')) {
        const insult = processInsult(command.replace('insult', ''), message.author.username);
        message.channel.send(insult);
    } else if (command === 'boobs') {
        message.channel.send('<https://www.youtube.com/watch?v=oHg5SJYRHA0>');
    } else if (command.includes('tooltime')) {
        broadcastVoice(message, './TOOLTIME', tooltime);
    } else if (command.includes('philly')) {
        broadcastVoice(message, './PHILLY', philly);
    } else if (command === 'version') {
        message.channel.send(VERSION);
    }
}

function respondToMessage(str, user, message) {
    if (user.repeat) {
        if (user.repeat.freq()) {
            message.channel.send(user.repeat.message);
        }
    }

    if (filter.isProfane(str) && chance(4)) {
        message.channel.send(`WATCH YOUR FUCKING LANGUAGE ${genInsult().toUpperCase()}`)
    }
}

// callbacks
client.once('ready', () => {
    console.log('Ready!');
    client.user.setPresence({activity: {type: 3, name: ` for "${CMD}" commands` }, status: 'online'}); 
});

client.on('message', function(message) {
    console.log(message);
    const str = message.content.toLowerCase();
    let user = users[message.author.id];
    if (!user) {
        user = users[DEFAULT];
    }

    if (user.bot) {
        return;
    }

    runCommand(str, message);
    respondToMessage(str, user, message);
});

client.on("voiceStateUpdate", async function(oldState, newState) {
    if (oldState.streaming || newState.streaming) {
        return;
    }

    if (newState.channelID) {
        console.log(newState)
        const uid = newState.id;
        let user = users[uid];
        if (user === undefined) {
            user = users[DEFAULT];
        }

        if (user.bot) {
            return;
        }

        const cid = newState.channelID;
        const vc = voiceChannels();
        const channel = vc.get(cid);
        const connection = await channel.join();
        const volume = user.volume_override ? user.volume_override : 0.4
        const dispatcher = connection.play(user.v_intro, {
            volume: volume,
        });
        dispatcher.on('finish', () => {
            dispatcher.destroy();
        });
    }
})

client.login(process.env.TOKEN);
