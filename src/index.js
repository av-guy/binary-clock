import './styles/main.css';

const TESTING = false;

class BinaryBulb {
    constructor() {
        this.element = null;
    }

    render(ul) {
        let li = document.createElement("li");
        li.classList.add("bulb");
        ul.appendChild(li);
        this.element = li;
    }

    notify(value) {
        if (value === 1) {
            this.element.classList.add('bc-active');
        } else {
            this.element.classList.remove('bc-active');
        }
    }
}

class BinaryClock {
    constructor(parser, app, maxHours = 12) {
        this.parser = parser;
        this.app = app;
        this.segments = {
            hours: {},
            minutes: {},
            seconds: {}
        }
        this.parser.binaryClock = this;
        this.maxHours = maxHours;
    }

    values(label) {
        let tensDigits = 3;
        let onesDigits = 4;
        if (this.maxHours > 12) tensDigits = 4
        if (label === "hours") tensDigits = 2;
        return [
            {id: `${label}-10`, digits: tensDigits},
            {id: `${label}-1`, digits: onesDigits}
        ]
    }

    ui() {
        let segment, div, label, sections, placeValue, ul;
        let hours = this.values("hours");
        let minutes = this.values("minutes");
        let seconds = this.values("seconds");

        sections = [hours, minutes, seconds];

        for (let section of sections) {
            div = document.createElement('div');
            label = section[0].id.split('-')[0];
            div.classList.add(`bc-section-${label}`);
            this.segments[label] = {};
            segment = this.segments[label];
            for (let column of section) {
                placeValue = column.id.split('-')[1];
                segment[placeValue] = [];
                ul = this.column(column.id, column.digits, segment[placeValue]);
                div.appendChild(ul);
            }
            this.app.appendChild(div);
        }
    }

    column(id, digits, segment) {
        let ul = document.createElement('ul');
        for (let i = 0; i < digits; i++) {
            let bulb = new BinaryBulb();
            segment.push(bulb);
            bulb.render(ul);
        }
        return ul;
    }

    hours(dec) {
        if (dec > 12 && this.maxHours < 24) dec = dec - 12;
        this.process('hours', dec);
    }

    minutes(dec) {
        this.process('minutes', dec);
    }

    seconds(dec) {
        this.process('seconds', dec);
    }

    highlight(section, bin) {
        bin = bin.slice(4 - section.length, bin.length);

        for (let i = 0; i < bin.length; i++) {
            try {
                section[i].notify(parseInt(bin[i]));
            } catch (err) {
            }
        }
    }

    process(segment, dec) {
        let tensPlace, onesPlace, onesBin, tensBin;
        dec = dec.toString();
        if (dec.length > 1) {
            [tensPlace, onesPlace] = [dec[0], dec[1]];
        } else {
            onesPlace = dec[0];
            tensPlace = '0';
        }
        onesBin = this.parser.convertToBinary(onesPlace);
        tensBin = this.parser.convertToBinary(tensPlace);
        if (tensPlace) this.highlight(this.segments[segment]['10'], tensBin);
        this.highlight(this.segments[segment]['1'], onesBin);
    }

    setup() {
        this.parser.hoursSub = this.hours;
        this.parser.minutesSub = this.minutes;
        this.parser.secondsSub = this.seconds;
    }
}

class BinaryTimeParser {
    constructor() {
        this.hoursSub = null;
        this.minutesSub = null;
        this.secondsSub = null;
        this.binaryClock = null;
    }

    convertToBinary(dec) {
        let bin = (dec >>> 0).toString(2);
        if (bin.length < 4) {
            for (let i = bin.length; i < 4; i++) {
                bin = '0' + bin;
            }
        }
        return bin;
    }

    processTime() {
        let d = new Date();
        let subscribers = [this.hoursSub, this.minutesSub, this.secondsSub];
        let currentTime = [d.getHours(), d.getMinutes(), d.getSeconds()]

        for (let i = 0; i < currentTime.length; i++) {
            if (subscribers[i] !== null) {
                let callback = subscribers[i]
                callback.call(this.binaryClock, currentTime[i]);
            }
        }
    }

    watch() {
        setInterval(() => {
            this.processTime()
        }, 1000);
    }
}

function initializeApp() {
    let app = document.getElementById('app');
    let timeParser = new BinaryTimeParser();
    let binaryClock = new BinaryClock(timeParser, app);
    binaryClock.setup();
    binaryClock.ui();
    binaryClock.parser.watch();
}

if (!TESTING) {
    initializeApp();
} else {
    module.exports = {
        BinaryTimeParser,
        BinaryBulb,
        BinaryClock
    }
}

