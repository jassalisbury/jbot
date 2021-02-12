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
    'bell',
    'goofy',
    'growing on my skin',
    'nelson',
    'philly',
    'random',
    'rick and morty',
    'stock',
    'tooltime',
    'tourettes',
];

function readAudioDir(directory) {
    return fs.readdirSync(directory).map((file) => {
        return {
            category: directory,
            filename: `${directory}/${file}`,
            name: file.replace('.mp3', '').trim(),
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

function filesWithCategory(category) {
    return _.filter(audioFiles, (file) => {
        return category.includes(file.category);
    });
}

function findCategory(command) {
    return _.find(audioCategories, (category) => {
        return command.startsWith(category);
    })
}

function runCommand(str, message) {
    if (!str.startsWith(CMD)) {
        return;
    }

    let command = str.replace(CMD, '').trim();
    const category = findCategory(command);

    if (command.startsWith('insult')) {
        const insult = processInsult(command.replace('insult', ''), message.author.username);
        message.channel.send(insult);
    } else if (command === 'boobs') {
        message.channel.send('<https://www.youtube.com/watch?v=oHg5SJYRHA0>');
    } else if (command === 'are you still in?') {
        message.channel.send(':gem: :raised_hands: Fuck yeah I am.');
    } else if (command.startsWith('list')) {
        const category = command.replace('list', '').trim();
        if (category) {
            const files = filesWithCategory(category);
            message.channel.send(`Files for category '${category}':\n\n${files.map((f) => f.name).join(', ')}\n\ntype "jbot ${category} #file" to play the file`)
        } else {
            message.channel.send(`Audio categories:\n\n${audioCategories.join(', ')}\n\ntype "jbot #category list" or "jbot list #category" to view files for each category`)
        }
    } else if (category) {
        const file = command.replace(category, '').trim();
        const files = filesWithCategory(category);

        if (!file && message.member.voice.channel) {
            const { channel } = message.member.voice;
            broadcastVoice(channel, _.sample(files).filename);
        } else if (file === 'list') {
            message.channel.send(`Files for category ${category}:\n\n${files.map((f) => f.name).join(', ')}\n\ntype "jbot ${category} #file" to play the file`)
        } else if (message.member.voice.channel) {
            const { channel } = message.member.voice;
            const audio = files.find((f) => f.name === file)
            if (audio) {
                broadcastVoice(channel, audio.filename);
            }
        }
    } else if (command === 'random' && message.member.voice.channel) {
        const { channel } = message.member.voice;
        broadcastVoice(channel, _.sample(audioFiles).filename);
    } else if (command === 'admin') {
        if (message.member.roles.cache.has('706971279739191407')) {
            message.channel.send('Nelson is the Admin of this server');
        } else {
            message.member.roles.add('706971279739191407');
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
