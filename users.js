
// consts
const JOSH = '355856039003815936';
const KEVIN = '355869488685514753';
const NATE = '209483103612174336';
const WYATT = '159102727887126528';
const NELSON = '367863632375316482';
const NICK = '249824869133451264';
const TANNER = '463493575116849152';
const JORDAN = '225783104189497344';
const RANDOM_BOT = '705141350345080842';
const ZACH = '230836793384239125';
const J_BOT = '705089896850653295';
const KP = '110954163566829568';
const JBUTT = '477695309816791040';
const PRESTON = '146412187534098442';
const KURTIS = '704042267291156610'
const DEFAULT = 'DEFAULT';

const users = {
    [WYATT]: {
        name: 'wyatt',
        v_intro: './intros/wyatt.mp3',
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
    [KP]: {
        name: 'kp',
        v_intro: './intros/kp.mp3',
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
    [JORDAN]: {
        name: 'jordan',
        v_intro: './intros/jordan.mp3',
    },
    [ZACH]: {
        name: 'zach',
        v_intro: './intros/zach.mp3',
    },
    [KURTIS]: {
        name: 'kurtis',
        v_intro: './intros/default.mp3'
    },
    [PRESTON]: {
        name: 'preston',
        v_intro: './intros/preston.mp3'
    },
    [DEFAULT]: {
        name: 'unknown',
        v_intro: './intros/default.mp3',
    },
    [JBUTT]: {
        name: 'jbutt',
        v_intro: './intros/jbutt.mp3'
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

module.exports = users;