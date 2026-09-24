const path = './my_simple_ai_model/memory.json', http = require('http'), fs = require('fs')

var memory = {
    bank: [{
        data: '',
        frequency: 0
    }],
    patterns: {
        delimiter: '',
        strings: [{
            data: '',
            notedFollowers: [],
            frequency: 0
        }]
    }
}

fs.readFile(path, (err, data)=>{
    if (!err) try {
        memory = JSON.parse(data)
    } catch (err) {}
    setInterval(()=>{fs.writeFile(path, JSON.stringify(memory), {encoding:'utf-8'}, err=>{})}, 1000)
})

function generateResponse(input) {
    var response = `${input}`;

    for (var i = 0; i < response.length; i++) storeMemorydata(response.charAt(i))

    var string = ''
    for (var i = 0; i < response.length; i++) {
        var character = response.charAt(i);
        string+=character
        if (i > 0) storeMemorydata(string)
    }

    var str = []
    memory.patterns.delimiter=ghf(memory.bank)
    string = string.split(memory.patterns.delimiter)
    for (var i = 0; i < string.length; i++) if (string[i] != '') {
        storeString(string[i])
        str.push(string[i])
    }

    var storedwords = getDatas(memory.patterns.strings)
    for (var i = 0; i < str.length; i++) {
        var follower = str[(i+1)]
        if (storedwords.includes(str[i]) && storedwords.includes(follower)) storeFollower(storedwords, str[i], follower)
    }

    var hash = rand(0, storedwords.length-1), p=''
    for (var i = 0; i < rand(1, str.length); i++) {
        var word = storedwords[hash], followers = getDatas(memory.patterns.strings[hash].notedFollowers)
        if (followers.length>0) {
            var next = followers[rand(0, followers.length-1)]
            p+=word+memory.patterns.delimiter+next+memory.patterns.delimiter
            hash=gtn(memory.patterns.strings[hash].notedFollowers, next)
        } else p+=word+memory.patterns.delimiter
    } p = p.substring(0, p.lastIndexOf(memory.patterns.delimiter))
    return p;
}

function rand(min, max) {return (Math.floor(Math.random()*(max-min)))+min}

function storeString(data) {
    if (!getDatas(memory.patterns.strings).includes(data)) snd(memory.patterns.strings, data)
    else atf(memory.patterns.strings, data)
}

function storeMemorydata(data) {
    if (!getDatas(memory.bank).includes(data)) snd(memory.bank, data)
    else atf(memory.bank, data)
}

function storeFollower(words, word, follower) {
    for (var i = 0; i < words.length; i++) {
        if (words[i]==word) {
            var allfolowers = getDatas(memory.patterns.strings[i].notedFollowers)
            if (!allfolowers.includes(follower)) snd(memory.patterns.strings[i].notedFollowers, follower)
            else atf(memory.patterns.strings[i].notedFollowers, follower)
            break;
        }
    }
}

function ghf(type) {
    var ans = ''
    var compare = 0
    for (var i = 0; i < type.length; i++) if (type[i].frequency > compare) {
        ans = type[i].data
        compare = type[i].frequency
    }
    return ans;
}

function ghfn(type) {
    var compare = 0
    for (var i = 0; i < type.length; i++) if (type[i].frequency > compare) compare = type[i].frequency
    return compare;
}

function snd(type, data) {
    if (type != memory.patterns.strings) type.push({
        data: data,
        frequency: 1
    })
    else type.push({
        data: data,
        notedFollowers: [],
        frequency: 1
    })
}

function atf(type, data) {
    for (var i = 0; i < type.length; i++) if (type[i].data == data) {
        type[i].frequency++
        break;
    }
}

function gtn(type, data) {
    var ans = 0
    for (var i = 0; i < type.length; i++) if (type[i].data == data) {ans = i; break;}
    return ans;
}

function getDatas(type) {
    var ans = [];
    for (var i = 0; i < type.length; i++) ans.push(type[i].data)
    return ans;
}

http.createServer((req, res)=>{
    var message = decodeURI(`${req.url}`.substring(1))
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (message.startsWith('message/')) {
        res.end(JSON.stringify(generateResponse(message.substring(8))))
        res.writeHead(200, {'Content-Type':'application/json'})
    } else {
        res.writeHead(200, {'Content-Type':'text/html'})
        fs.readFile('./index.html', {encoding:'utf-8'}, (err, data)=>{
            if (!err) res.end(data)
            else res.end('Page not found!')
        });
    }
}).listen(process.env.PORT)
