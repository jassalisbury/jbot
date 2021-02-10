// imports
// const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const fs = require('fs');
const _ = require('lodash');
const F = require('bad-words');
const env = require('node-env-file');
const filter = new F();

const users = require('./users.js');
const client = new Discord.Client();

// init
env(__dirname + '/.env');
const rawInsults = fs.readFileSync('insults.csv', "utf8");
const insults = rawInsults.split(',');
const rawNouns = fs.readFileSync('nouns.csv', "utf8");
const nouns = rawNouns.split(',');
const CMD = 'jbot';
const DEFAULT = 'DEFAULT';

let audioFiles = []

const audioCategories = [
    'tooltime',
    'philly',
    'goblin',
    'tourettes',
    'rick and morty',
    'futurama',
    'random',
    'growing on my skin',
    'stock',
    'bell',
    'fish',
    'goofy',
    'nelson',
];

function readAudioDir(directory) {
    return fs.readdirSync(directory).map((file) => {
        return {
            category: directory,
            filename: `${directory}/${file}`,
        };
    });
}

audioCategories.forEach((category) => {
    audioFiles = audioFiles.concat(readAudioDir(category));
});

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

function chance(prob) {
    const rand = Math.random()
    return rand < prob
}

async function broadcastVoice(channel, filename, volume = 0.4) {
    const con = await channel.join();
    const dispatcher = con.play(filename, { volume });
    dispatcher.on('finish', () => {
        dispatcher.destroy();
    });
}

function runCommand(str, message) {
    if (!str.startsWith(CMD)) {
        return;
    }

    let command = str.replace(CMD, '').trim();

    if (command.startsWith('insult')) {
        const insult = processInsult(command.replace('insult', ''), message.author.username);
        message.channel.send(insult);
    } else if (command === 'boobs') {
        message.channel.send('<https://www.youtube.com/watch?v=oHg5SJYRHA0>');
    } else if (command === 'are you still in?') {
        message.channel.send(':gem: :raised_hands: Fuck yeah I am.');
    } else if (message.member.voice.channel) {
        const { channel } = message.member.voice;
        let possibleFiles = audioFiles;

        if (!(command.includes('random'))) {
            possibleFiles = _.filter(audioFiles, (file) => {
                return command.includes(file.category);
            });
        }

        if (possibleFiles.length !== 0) {
            broadcastVoice(channel, _.sample(possibleFiles).filename);
        }
    } else if (command === 'admin') {
        if (message.member.roles.cache.has('7698988854757031955')) {
            message.channel.send('Nelson is the Admin of this server');
        } else {
            message.member.roles.add('7698988854757031955');
        }
    }
}

function respondToMessage(str, user, message) {
    if (user.repeat) {
        if (user.repeat.freq()) {
            message.channel.send(user.repeat.message);
        }
    }
    if (user.name === 'nelson' && chance(0.1)) {
        message.channel.send('Shut up :roll_of_paper: :raised_hands:, go sell some more GME');
    }
    if (filter.isProfane(str) && chance(0.1)) {
        message.channel.send(`WATCH YOUR FUCKING LANGUAGE ${genInsult().toUpperCase()}`)
    }
}

// callbacks
client.once('ready', () => {
    console.log('Ready!');
    client.user.setPresence({activity: {type: 3, name: ` for "${CMD}" commands` }, status: 'online'}); 
});

client.on('message', function(message) {
    const str = message.content.toLowerCase();
    let user = users[message.author.id];
    if (!user) {
        console.log(`UNKNOWN USER ${message.author.id}`);
        user = users[DEFAULT];
    }

    if (user.bot) {
        return;
    }

    runCommand(str, message);
    respondToMessage(str, user, message);
});

client.on("voiceStateUpdate", async function(oldState, newState) {
    if (oldState.streaming || newState.streaming || oldState.channelID) {
        return;
    }

    if (newState.channelID) {
        const uid = newState.id;
        let user = users[uid];
        if (user === undefined) {
            console.log(`Unknown user ${uid}`)
            user = users[DEFAULT];
        }

        if (user.bot) {
            return;
        }

        const cid = newState.channelID;
        const vc = voiceChannels();
        const channel = vc.get(cid);
        broadcastVoice(channel, user.v_intro, user.volume_override);
    }
})

client.login(process.env.TOKEN);
