const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { Client, MessageAttachment } = require('discord.js');
const warns = JSON.parse(fs.readFileSync('./warns.json'));
const ytdl = require('ytdl-core');
const Canvas = require('canvas');
var prefix = "?";
 
client.login('NzAwMzE1Nzc1Mzc4MTI4OTU2.XqctLw.8BnkZO5b_oOde6jVxNGvquLV1uY');


client.on('message', message => {
  if (message.content === prefix + "code") {
    if (message.member.hasPermission("ADMINISTRATOR")){
      const buffer = fs.readFileSync('./index.js');
      const attachment = new MessageAttachment(buffer, 'index.js');
      message.channel.send(`${message.author}, my code : `, attachment);
  }}
});

 
client.on("message", message => {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
    if (args[0].toLowerCase() === prefix + "warn") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Veuillez mentionner un membre")
        let reason = args.slice(2).join(' ')
        if (!reason) return message.channel.send("Veuillez indiquer une raison")
        if (!warns[member.id]) {
            warns[member.id] = []
        }
        warns[member.id].unshift({
            reason: reason,
            date: Date.now(),
            mod: message.author.id
        })
        fs.writeFileSync('./warns.json', JSON.stringify(warns))
        message.channel.send(member + " a été warn pour " + reason + " :white_check_mark:")
    }
 
    if (args[0].toLowerCase() === prefix + "warns") {
      
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Veuillez mentionner un membre")
        let embed = new Discord.MessageEmbed()
            .setAuthor(member.user.username, member.user.displayAvatarURL)
            .addField('10 derniers warns', ((warns[member.id]) ? warns[member.id].slice(0, 10).map(e => e.reason) : "Ce membre n'a aucun warns"))
            .setTimestamp()
        message.channel.send(embed)
    }
})
 
client.on('message',message => {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
 
   
    if (args[0].toLocaleLowerCase() === prefix + 'question'){
        if (!args[0]) return message.channel.send("Please **ask a question** :x:")
        let rep = ["yes yes yesss :x:", "always :heart_eyes: ", "no :face_palm:", "hummm... :thinking:", "... :interrobang:"];
        let reptaille = Math.floor((Math.random() * rep.length));
        let question = args.slice(0).join(" ");
 
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag)
            .setColor("ORANGE")
            .addField("Question:", question)
            .addField("Réponse:", rep[reptaille]);
        message.channel.send(embed)
    }
})
 
 
client.on('ready', function() {
    console.log("I am Ready!");
});
 

const queue = new Map();

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } 
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.on('message', message => {
  if(message.content === prefix + "join"){
    const voiceChannel = message.member.voice.channel;
    voiceChannel.join()
    return message.channel.send(
      "I join you !")
  }});

client.on('message', message => {
  if(message.content === prefix + "music"){
    let embed = new Discord.MessageEmbed()
        .setAuthor('Music :')
        .addField('Radetzky March - Johann Strauss Sr','https://www.youtube.com/watch?v=eab_eFtTKFs&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=5')
        .addField('Wolfgang Amadeus Mozart - Piano Concerto No. 21 - Andante','https://www.youtube.com/watch?v=df-eLzao63I&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=7&pbjreload=10')
        .addField('Johann Sebastian Bach-Air on G String','https://www.youtube.com/watch?v=GMkmQlfOJDk&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=9')
        .addField('The Elegance of Pachelbel – Serenade','https://www.youtube.com/watch?v=BNVzNftY22g&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=10')
        .addField('Chopin - Nocturne op.9 No.2','https://www.youtube.com/watch?v=9E6b3swbnWg&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=11')
        .addField('Turkish march(Rondo Alla Turca ) -mp3 - Wolfgang Amadeus Mozart','https://www.youtube.com/watch?v=C4YB0-xji7k&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=12')
        .addField('Antonio Vivaldi - Storm','https://www.youtube.com/watch?v=NqAOGduIFbg&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=13')
        .addField('Chopin: Impromptu No.4 in C sharp minor, Op.66 "Fantaisie-Impromptu"','https://www.youtube.com/watch?v=9_pb1lCNrEo&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=14')
        .addField('Beethoven Symphony No.9','https://www.youtube.com/watch?v=YAOTCtW9v0M&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=15')
        .addField('Mozart-The Marriage of Figaro','https://www.youtube.com/watch?v=8OZCyp-LcGw&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=17')
        .addField('Luigi Boccherini: Minuetto','https://www.youtube.com/watch?v=kSE15tLBdso&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=18')
        .addField('Franz Liszt La Campanella','https://www.youtube.com/watch?v=WqrusoQ6xVM&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=19')
        .addField('Johann Pachelbel Canon in D Major','https://www.youtube.com/watch?v=jQkb9DWCbZ8&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=20')
        .addField('Beethoven - Moonlight Sonata (FULL)','https://www.youtube.com/watch?v=4Tr0otuiQuU&list=PLULDfVZegdm-Y_ut4y0KjyjNZsmqePe-F&index=21')
        .setTimestamp()
        message.channel.send(embed)
  }});

var cheerio = require("cheerio"); 
var request = require("request"); 

client.on("message", function(message) {
  var parts = message.content.split(" ");
  if (parts[0] === prefix + "picture") {    
      image(message, parts); 
  }
});

function image(message, parts) {
  var search = parts.slice(1).join(" ");
  var options = {
      url: "http://results.dogpile.com/serp?qc=images&q=" + search,
      method: "GET",
      headers: {
          "Accept": "text/html",
          "User-Agent": "Chrome"
      }
  };
  request(options, function(error, response, responseBody) {
      if (error) {
          return;
      }
      $ = cheerio.load(responseBody);       
      var links = $(".image a.link");    
      var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
      console.log(urls);
      if (!urls.length) {
          return;
      }
      message.channel.send( urls[0] );
  });

}

const Commande = '?upload '

client.on('message', message => {
  if (message.content.startsWith(Commande)) {
    const ayy = client.emojis.cache.find(emoji => emoji.name === "load");
    message.channel.send(`${ayy} Connecting to API, please wait...`).then(m => {
        setTimeout(() => {
            m.edit(`${ayy} Connecting to server, please wait...`);
            m.delete({
                timeout: 5000
            }).then(() => {
              if (message.content.includes("discordapp.com") || message.content.includes('discord.new')) {
                const str = '**link :** '+ message.content.substring(Commande.length) 
                client.channels.cache.get('699619772568043611').send(str)
                client.channels.cache.get('699619772568043611').send('=======================================')
                  }
                }, 1000)
                     })
})}

});

client.on('message', message => { 
  if(message.content.startsWith(prefix + 'poll')){
    let args = message.content.split(" ").slice(1);
    let thingToEcho = args.join(" ")
    message.delete()
    var embed = new Discord.MessageEmbed()
    .setDescription("Poll : ")
    .addField("Reply with :white_check_mark: or :x:", thingToEcho )
    .setColor("0x840404")
    .setTimestamp()

    message.channel.send(embed)
    .then(function (message){
      message.react("✔️")
      message.react("❌")
    }).catch(function(){

    })
  }
});


client.on('message', message => {
  const Commande2 = '?activity'
  if (message.content.startsWith(Commande2)) {
      const ayy = client.emojis.cache.find(emoji => emoji.name === "load");
      message.channel.send(`${ayy} Connecting to API, please wait...`).then(m => {
          setTimeout(() => {
              m.edit(`${ayy} Connecting to server, please wait...`);
              m.delete({
                  timeout: 5000
              }).then(() => {
                  if (!message.member.hasPermission("ADMINISTRATOR")) {return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")}
                  if (message.member.hasPermission("ADMINISTRATOR")){
                    let act = message.content.substring(Commande2.length) 
                      client.user.setActivity(act, { type: "WATCHING"})
                    }
                  }, 1000)
                       })
  })}
  
});

let act = "by 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™"

client.on("ready", () => {
  client.user.setActivity(act, { type: "WATCHING"})
})

client.on("message", async (message) => {
  if(message.content.startsWith(prefix + 'rps')) {
      let replies = ['💎', '📰', '✂️'];
      let result = Math.floor((Math.random() * replies.length));
      let uReply = "";
      message.reply(`React to emoji :gem: or :newspaper: or :scissors: !`)
          message.react(`💎`)
          message.react(`📰`)
          message.react(`✂️`)
      message.awaitReactions((reaction, user) => user.id === message.author.id && (reaction.emoji.name === '💎' || reaction.emoji.name === '📰' || reaction.emoji.name === '✂️'),
                          { max: 1, time: 30000 }).then(collected => {
                                  if (collected.first().emoji.name === '💎') {
                                          if (replies[result] === '📰') return message.channel.send(`I won the game!`);
                                          else return message.channel.send('You have won!');
                                  }
                                  if (collected.first().emoji.name === '📰') {
                                          if (replies[result] === '✂️') return message.channel.send(`I won the game!`);
                                          else return message.channel.send('You have won!');
                                  }
                                  if (collected.first().emoji.name === '✂️') {
                                          if (replies[result] === '💎') return message.channel.send(`I won the game!`);
                                          else return message.channel.send('You have won!');
                                  }
                                  }).catch(collected => {
                                      message.reply('No reaction after 30 seconds, operation aborted');
                              });
}
});


client.on('messageDelete', message => {
  if(!message.partial) {
      const channel = client.channels.cache.get('700022577472733254');
      if(channel) {
          const embed = new Discord.MessageEmbed()
              .setTitle('Deleted Message')
              .addField('💼 __author :__', `${message.author.tag} (${message.author.id})`, true)
              .addField('📝__Channel__', `${message.channel.name} (${message.channel.id})`, true)
              .setDescription(message.content)
              .setTimestamp()
              .setColor("#FFD97C");
          channel.send(embed);
      }
  }
});



client.on("messageUpdate", (oldMessage, newMessage) => {
  if (!oldMessage.content || !newMessage.content) return;
  const messageedit = new Discord.MessageEmbed()
  .setDescription("📝 **Message edit !**")
  .addField(`💼 __author :__ `,`${newMessage.author.tag}`, true)
  .addField(`📝 __old Message :__`,`${oldMessage.content}`, true) 
  .addField(`📝 __new Message :__ `,`${newMessage.content}`, true) 
  .addField("💾 __ID :__", `https://canary.discordapp.com/channels/512075961219416086/${newMessage.id}/${newMessage.id}`, true)
  .setTimestamp()
  .setColor("#FFD97C");
  client.channels.cache.get('700022577472733254').send(messageedit)
 });

client.on('message', (message) => {
if (
  message.content
    .toLowerCase()
    .includes('discord.gg' || 'discordapp.com/invite')
) {
  const embed = new Discord.MessageEmbed()
    .setTitle('__Invite posted__')
    .addField('__Channel__', `${message.channel.name} (${message.channel.id})`, true)
    .addField('__Message__', message.content, true)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL())
    .setColor("#FFD97C");
  client.channels.cache.get('700022577472733254').send(embed);
}
});


const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};


client.on('guildMemberAdd', async member => {
	const channel = client.channels.cache.get('699616898329083975')
	if (!channel) return;

	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('./wall2.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	// Slightly smaller text placed above the member's display name
	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

	// Add an exclamation point here and below
	ctx.font = applyText(canvas, `${member.displayName}!`);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

	channel.send(`Welcome to the server, ${member}!`, attachment);
});




client.on("message", message => {
  if (!message.guild) return
  let args = message.content.trim().split(/ +/g)

  if (args[0].toLowerCase() === prefix + "clear") {
    const ayy = client.emojis.cache.find(emoji => emoji.name === "load");
    message.channel.send(`${ayy} Connecting to API, please wait...`).then(m => {
        setTimeout(() => {
            m.edit(`${ayy} Connecting to server, please wait...`);
            m.delete({
                timeout: 5000
            }).then(() => {
              if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You do not have permission to use this command")
              let count = args[1]
              if (!count) return message.channel.send("Please indicate a number of messages to delete")
              if (isNaN(count)) return message.channel.send("Please enter a valid number")
              if (count < 1 || count > 100) return message.channel.send("Please enter a number between 1 and 100")
              message.channel.bulkDelete(parseInt(count) + 1)
            })
        }, 1000)
    })
  }
});


client.on("message", message => {
  if (message.author.bot) return;

  let data = JSON.parse(fs.readFileSync("./words.json","utf8"));
  var messages = message.content;
  const messageList = messages.split(" ");

  if (data.theArray.some(w => messageList.includes(w))) {
    message.delete();
    message.channel.send("that words is banned");
  }
});


const Commande2 = '?banword '

client.on('message', message => {
  if (message.content.startsWith(Commande2)) {
    if (message.author.bot) return;x
    const ayy = client.emojis.cache.find(emoji => emoji.name === "load");
    message.channel.send(`${ayy} Connecting to API, please wait...`).then(m => {
        setTimeout(() => {
            m.edit(`${ayy} Connecting to server, please wait...`);
            m.delete({
                timeout: 5000
            }).then(() => {
              if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You do not have permission to use this command")
              const str = message.content.substring(Commande2.length) 
              let data = JSON.parse(fs.readFileSync("./words.json","utf8"))
            
              data["theArray"].push(str)
              fs.writeFileSync("./words.json",JSON.stringify(data))
                }
        )}, 1000)
                     })

}});


client.on('message', message => {
  if (message.content === prefix +'hentai') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
superagent.get('https://nekos.life/api/v2/img/anal')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("Hentai")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: anal`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
})

}});
const rp = require('request-promise-native');

client.on('message', message => {
  if (message.content === prefix +'ass') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')


    return rp.get('http://api.obutts.ru/butts/0/1/random').then(JSON.parse).then(function(res)  {
      return rp.get({
          url:'http://media.obutts.ru/' + res[0].preview,
          encoding: null
      });
  }).then(function(res)   {
  
  const lewdembed = new Discord.MessageEmbed()
        .setTitle("Ass")
        .setColor(`#000000`)
        .setImage("attachment://file.png").attachFiles([{ attachment: res, name: "file.png" }])
  
  
      message.channel.send(lewdembed);
  });

}});

const superagent = require("snekfetch");

client.on('message', message => {
  if (message.content === prefix +'anal') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
superagent.get('https://nekos.life/api/v2/img/anal')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("Hentai")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: anal`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
})}});

client.on('message', message => {
  if (message.content === prefix +'boobs') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')


  return rp.get('http://api.oboobs.ru/boobs/0/1/random').then(JSON.parse).then(function(res)  {
    return rp.get({
        url:'http://media.oboobs.ru/' + res[0].preview,
        encoding: null
    });
}).then(function(res)   {

const lewdembed = new Discord.MessageEmbed()
      .setTitle("Boobs")
      .setColor(`#000000`)
      .setImage("attachment://file.png").attachFiles([{ attachment: res, name: "file.png" }])


    message.channel.send(lewdembed);
});
  }});

 
client.on('message', message => {
    if (message.content === prefix +'cum') {
      if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
        superagent.get('https://nekos.life/api/v2/img/cum')
            .end((err, response) => {
          const lewdembed = new Discord.MessageEmbed()
          .setTitle("cum")
          .setImage(response.body.url)
          .setColor(`#000000`)
          .setFooter(`Tags: cum`)
          .setURL(response.body.url);
        message.channel.send(lewdembed);
        })
}});

client.on('message', message => {
  if (message.content === prefix +'blowjob') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/blowjob')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle("blowjob")
      .setImage(response.body.url)
      .setColor(`#000000`)
      .setFooter(`Tags: blowjob`)
      .setURL(response.body.url);
    message.channel.send(lewdembed);
    })
}});


const { version } = require("discord.js");
const moment = require("moment");
const m = require("moment-duration-format");
let os = require('os')
let cpuStat = require("cpu-stat")
const ms = require("ms")

client.on('message', message => {
  if (message.content.startsWith(prefix+"ping")) {
    let cpuLol;
    cpuStat.usagePercent(function(err, percent, seconds) {
        if (err) {
            return console.log(err);
        }
        const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(client.user.username)
            .setTitle("__**Stats:**__")
            .setColor("RANDOM")
            .addField("� Mem Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
            .addField("� Uptime ", `${client.uptime} ms`, true)
            .addField("� Users", `${client.users.cache.size}`, true)
            .addField("� Servers", `${client.guilds.cache.size}`, true)
            .addField("� Channels ", `${client.channels.cache.size}`, true)
            .addField("� Discord.js", `v${version}`, true)
            .addField("� Node", `${process.version}`, true)
            .addField("� CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
            .addField("� CPU usage", `\`${percent.toFixed(2)}%\``, true)
            .addField("� Arch", `\`${os.arch()}\``, true)
            .addField("� Platform", `\`\`${os.platform()}\`\``, true)
            .addField("API Latency", `${(client.ws.ping)}ms`)  
        message.channel.send(embedStats)
    });
    }

}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"time")) {
    var today = new Date()
    let Day = today.toString().split(" ")[0].concat("day");
    let Month = today.toString().split(" ")[1]
    let Year = today.toString().split(" ")[3]
    const embed = new Discord.MessageEmbed()
      .setColor(`RANDOM`)
      .addField("Today is", `\`${Day}\` ,\`${Month}\` ,\`${Year}\`\n\`Time of day:\` \`${today.toString().split(" ")[4]}\``)
    message.channel.send({ embed })
}}); 

const randomPuppy = require("random-puppy");


client.on('message', message => {
  if (message.content.startsWith(prefix+"kiss")) {
    const user = message.mentions.users.first();
    if(!user)
        return message.reply('Mention someone to kiss');

    superagent.get('https://nekos.life/api/v2/img/kiss')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle(user.username + " Just got a kiss from " + message.author.username)
      .setImage(response.body.url)
      .setColor(`RANDOM`)
      .setDescription((user.toString() + " goxt a kiss from " + message.author.toString()))
      .setFooter(`this is so cute`)
      .setURL(response.body.url);
  message.channel.send(lewdembed);
    })
}}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"slap")) {
    const user = message.mentions.users.first();
    if(!user)
        return message.reply('Mention someone to slap!');

    superagent.get('https://nekos.life/api/v2/img/slap')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle(user.username + " just got slapped by " + message.author.username)
      .setImage(response.body.url)
      .setColor(`RANDOM`)
      .setDescription((user.toString() + " got slapped by " + message.author.toString()))
      .setFooter(`RIP`)
      .setURL(response.body.url);
  message.channel.send(lewdembed);
    })
}});

client.on('message', message => {
  if (message.content.startsWith(prefix+"tickle")) {
    const user = message.mentions.users.first();
    if(!user)
        return message.reply('Mention someone to tickle!');

    superagent.get('https://nekos.life/api/v2/img/tickle')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle(user.username + " just got tickled by " + message.author.username)
      .setImage(response.body.url)
      .setColor(`RANDOM`)
      .setDescription((user.toString() + " got tickled by " + message.author.toString()))
      .setFooter(`._.`)
      .setURL(response.body.url);
  message.channel.send(lewdembed);
    })
}});


client.on('message', message => {
  if (message.content.startsWith(prefix+"kill")) {
    superagent.get('https://nekos.life/api/v2/img/smug')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle("( ͡° ͜ʖ ͡°)")
      .setImage(response.body.url)
      .setColor(`RANDOM`)
      .setFooter(`( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°) ( ͡° ͜ʖ ͡°)`)
      .setURL(response.body.url);
  message.channel.send(lewdembed);
    })
}});


client.on('message', message => {
  if (message.content.startsWith(prefix+"spanked")) {
    const user = message.mentions.users.first();
    if(!user)
        return message.reply('Mention someone to spank! ._.');

    superagent.get('https://nekos.life/api/v2/img/spank')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle(user.username + " just got spanked by " + message.author.username)
      .setImage(response.body.url)
      .setColor(`RANDOM`)
      .setDescription((user.toString() + " got SPANKED! by " + message.author.toString()))
      .setFooter(`That must hurt ._.`)
      .setURL(response.body.url);
  message.channel.send(lewdembed);
})}})

client.on('message', message => {
  if (message.content.startsWith(prefix+"hug")) {
    const user = message.mentions.users.first();
    if(!user)
        return message.reply('Mention someone to give a hug to.');
    
    superagent.get('https://nekos.life/api/v2/img/hug')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle(user.username + " Just got a hug from " + message.author.username)
      .setImage(response.body.url)
      .setColor(`RANDOM`)
      .setDescription((user.toString() + " got a hug from " + message.author.toString()))
      .setFooter(`this is so cute`)
      .setURL(response.body.url);
    message.channel.send(lewdembed);
})}})


client.on('message', message => {
  if (message.content === prefix +'pussy') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/pussy')
        .end((err, response) => {
      const lewdembed = new Discord.MessageEmbed()
      .setTitle("pussy")
      .setImage(response.body.url)
      .setColor(`#000000`)
      .setFooter(`Tags: pussy`)
      .setURL(response.body.url);
    message.channel.send(lewdembed);
    })
}});


client.on('message', message => {
  if (message.content === prefix +'porn-gif') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/pussy')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("Pussy Gif")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: pussy gif`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
    })
}});



client.on('message', message => {
  if (message.content === prefix +'cuni') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/kuni')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("cuni")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: kuni`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
    })
}});

client.on('message', message => {
  if (message.content === prefix +'solo') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/solog')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("Girl solo gif")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
    })
}});

client.on('message', message => {
  if (message.content === prefix +'fendom') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/femdom')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("femdom")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: femdom`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
    })
}});

client.on('message', message => {
  if (message.content === prefix +'cum-in') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/cum_jpg')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("cumarts")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: cumarts`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
    })
}});

client.on('message', message => {
  if (message.content === prefix +'bj') {
    if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
    superagent.get('https://nekos.life/api/v2/img/bj')
    .end((err, response) => {
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("bj")
  .setImage(response.body.url)
  .setColor(`#000000`)
  .setFooter(`Tags: bj`)
  .setURL(response.body.url);
message.channel.send(lewdembed);
    })
}});

client.on('message', async message => {
  if (!message.guild) return;
  if (message.content.startsWith(prefix + 'giveaway')) {
  if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('You don\'t have enough permissions to use this command.');
  if (message.content.split(' ')[1] === '') return messages.channel.send('Please enter a duration for the giveaway (in hours).');
  const stated_duration_hours = message.content.split(' ')[1];
  const actual_duration_hours = stated_duration_hours * 3600000;
  const prize = message.content.split(' ').slice(2).join(' ');
  if (isNaN(stated_duration_hours)) return message.channel.send('The duration time has to be a number.');
  if (stated_duration_hours < 1) return message.channel.send('The duration time has to be atleast 1.');
  if (prize === '') return message.channel.send('You have to enter a price.');
  const embed = new Discord.MessageEmbed()
  .setTitle(`${prize}`)
  .setColor('36393F')
  .setDescription(`React with 🎉 to enter!\nTime duration: **${stated_duration_hours}** hours\nHosted by: ${message.author}`)
  .setTimestamp(Date.now() + (stated_duration_hours *60*60*1000))
  .setFooter('Ends at')
  let msg = await message.channel.send(':tada: **GIVEAWAY** :tada:', embed)
  await msg.react('🎉')
  setTimeout(() => {
    msg.reactions.cache.get('🎉').users.remove(client.user.id)
    setTimeout(() => {
    let winner = msg.reactions.cache.get('🎉').users.cache.random();
    if (msg.reactions.cache.get('🎉').users.cache.size < 1) {
      const winner_embed = new Discord.MessageEmbed()
      .setTitle(`${prize}`)
      .setColor('36393F')
      .setDescription(`Winner:\nNo one entered the giveaway.\nHosted by: ${message.author}`)
      .setTimestamp()
      .setFooter('Ended at')
      msg.edit(':tada: **GIVEAWAY ENDED** :tada:', winner_embed);
    }
    if (!msg.reactions.cache.get('🎉').users.cache.size < 1) {
    const winner_embed = new Discord.MessageEmbed()
    .setTitle(`${prize}`)
    .setColor('36393F')
    .setDescription(`Winner:\n${winner}\nHosted by: ${message.author}`)
    .setTimestamp()
    .setFooter('Ended at')
    msg.edit(':tada: **GIVEAWAY ENDED** :tada:', winner_embed);
    }
  }, 1000);
  }, actual_duration_hours);
  }
});



const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
	warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
	kickThreshold: 7, // Amount of messages sent in a row that will cause a ban.
	banThreshold: 15, // Amount of messages sent in a row that will cause a ban.
	maxInterval: 2000, // Amount of time (in milliseconds) in which messages are considered spam.
	warnMessage: '{@user}, Please stop spamming.', // Message that will be sent in chat upon warning a user.
	kickMessage: '**{user_tag}** has been kicked for spamming.', // Message that will be sent in chat upon kicking a user.
	banMessage: '**{user_tag}** has been banned for spamming.', // Message that will be sent in chat upon banning a user.
	maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
	exemptPermissions: [ 'ADMINISTRATOR'], // Bypass users with any of these permissions.
	ignoreBots: true, // Ignore bot messages.
	verbose: true, // Extended Logs from module.
	ignoredUsers: [], // Array of User IDs that get ignored.
	// And many more options... See the documentation.
});


client.on('message', (message) => antiSpam.message(message)); 
antiSpam.on("banAdd", (member) => console.log(`${member.user.tag} has been banned.`));
antiSpam.on("kickAdd", (member) => console.log(`${member.user.tag} has been kicked.`));
antiSpam.on("spamThresholdWarn", (member) => console.log(`${member.user.tag} has reached the warn threshold.`));
antiSpam.on("error", (message, error, type) => {
	console.log(`${message.author.tag} couldn't receive the sanction '${type}', error: ${error}`);
});

client.on('message', message => {
if ((message.content.includes("@everyone") || message.content.includes("@here")) && !message.member.hasPermission("ADMINISTRATOR")) {
  message.channel.send(`?warn ${message.author} @every... or @he...`);
}}); 



client.on('message', message => {
  if (message.content.startsWith(prefix + 'mute')) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let user = message.guild.member(message.mentions.users.first())
    let muteRole = message.guild.roles.cache.find(r => r.name === 'Muted')
    user.roles.add(muteRole.id)
    message.channel.send(`<@${user.id}> est muté.`);
  }
});
client.on('message', message => {
if ((message.content.includes("@everyone") || message.content.includes("@here")) && !message.member.hasPermission("ADMINISTRATOR")) {
  let muteRole = message.guild.roles.cache.find(r => r.name === 'Muted')
  message.member.roles.add(muteRole.id)
  message.channel.send(`muté.`);
}
});

client.on('message', message => {
  if (message.content.startsWith(prefix + 'unmute')) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let user = message.guild.member(message.mentions.users.first())
    let muteRole = message.guild.roles.cache.find(r => r.name === 'Muted')
    if(!user.roles.cache.has(muteRole.id)) return message.reply("l'utilisateur mentionné n'est pas muté!");
    user.roles.remove(muteRole.id);
    message.channel.send(`<@${user.id}> n'est plus muté.`);
  }
});



client.on('message', message => {
  if (message.content.startsWith(prefix + 'report')) {
    let args = message.content.trim().split(/ +/g)
    message.delete()
    // mentioned or grabbed user
    let target = message.mentions.members.first() 
    if(!target) return message.channel.send("Please provide a valid user").then(m => m.delete(15000))
    
    // reasoning definition
    let reason = args.slice(1).join(" ")
    if(!reason) return message.channel.send(`Please provide a reason for reporting **${target.user.tag}**`).then(m => m.delete(15000))
    
    // grab reports channel
    let sChannel = message.guild.channels.cache.find(x => x.name === "『📜』report")
    
    // send to reports channel and add tick or cross
    
    message.channel.send("Your report has been filed to the staff team. Thank you!").then(m => m.delete(15000))
    sChannel.send(`**${message.author.tag}** has reported **${target.user.tag}** for **${reason}**.`).then(async msg => {
        msg.react("✅")
        msg.react("❌")
    })
    
    }
  }
);


client.on('message', message =>{
  if (message.content.startsWith(prefix + 'off')) {
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('You don\'t have enough permissions to use this command.'); 
    console.log("shutdown")
    process.exit()
}});


client.on('message', message => {
  if (message.content.startsWith(prefix + 'new')) {
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('You don\'t have enough permissions to use this command.'); 
    
    let args = message.content.trim().split(/ +/g)
    let msg = args.slice(1).join(" ")
    if(!msg) return message.channel.send(`***Please provide announcement ***`).then(m => m.delete(15000))

    let sChannel = message.guild.channels.cache.find(x => x.name === "〔🔍〕║𝐍𝐞𝐰𝐬")
    const news = `**__Announcement:__** **${msg}** `
    sChannel.send(news).then(async react => {
      react.react("👀")
})}});




client.on('message', message => {
  if (message.content === prefix +'help'){
        const embedStats = new Discord.MessageEmbed()
            .setAuthor("List of ALL. bot's commands", client.user.displayAvatarURL)

            .setTitle("__**Help:**__")

            .setColor("RANDOM")

            .addField(
              "🛂 Moderation:", `
            > **${prefix}help/mod** : To see the moderation commands.`
            )
            
            .addField(
              "🛠️ Nsfw:", `
            > **${prefix}help/useful** : To see the useful commands.`
            )
            
            .addField(
              "🔞 Nsfw:", `
            > Show NSFW commands by typing **${prefix}help/nsfw** . Make sure not to use these in any other channel, anyways the bot will require you to enable NSFW in your channel.`
            )
            
            .addField(
              "💸 Economy:", `
            > **${prefix}help/economy** : to see economy command.`)
            
            .addField(
              "🎲 Fun/Other:", `
            > **${prefix}help/fun** : To see the fun or off-category commands.`
            )
            
            .addField(
              "🦠 Corona:", `
            > **${prefix}help/corona** : To see covid commands.`
            )
            
            .addField(
              "⭐ Level:", `
            > **${prefix}help/level** : To see level commands.`
            )
            .addField(
              "💌 ALL.:", `
            > **${prefix}info** : about ALL.`
            )

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"help/mod")) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You don\'t have enough permissions to use this command.")
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**🛂\ Mod :**__")

            .setColor("RANDOM")

            .addField("To warn a user :", `\`\`?warn @.... reason\`\``, true)

            .addField("To view a user’s list of warns :", `\`\`?warns @...\`\``, true)
            
            .addField("To do a poll :", `\`\`?poll  Your Question here ?\`\``, true)

            .addField("To define the activities of the main bot :", `\`\`?activity Your text here\`\``, true)

            .addField("To delete a defined message number (maximum 80) :", `\`\`?clear x\`\``, true)

            .addField("To ban a word from the server :", `\`\`?banword word here\`\``, true)

            .addField("To view user information :", `\`\`?user @...\`\``, true)

            .addField("For information on the bot :", `\`\`?ping\`\``, true)

            .addField("To make a giveaway :", `\`\`?giveaway hour rewards \`\``, true)

            .addField("For mute a user:", `\`\`?mute @... \`\``, true)

            .addField("For unmute a user:", `\`\`?unmute @... \`\``, true)

            .addField("To turn off the bot:", `\`\`?off \`\``, true)

            .addField("for an announcement:", `\`\`?new Your announcement here \`\``, true)

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"help/nsfw")) {
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**🔞\ Nsfw :**__")

            .setDescription('all commands can be run only in a nsfw channel')

            .setColor("RANDOM")

            .addField("See hentai :", `\`\`?hentai\`\``, true)

            .addField("See ass :", `\`\`?ass\`\``, true)
            
            .addField("See annal :", `\`\`?anal\`\``, true)

            .addField("See boobs :", `\`\`?boobs\`\``, true)

            .addField("See cum :", `\`\`?cum\`\``, true)

            .addField("See blowjob:", `\`\`?blowjob\`\``, true)

            .addField("See pussy :", `\`\`?pussy\`\``, true)

            .addField("See porn GIF :", `\`\`?porn-gif\`\``, true)

            .addField("See cuni :", `\`\`?cuni \`\``, true)

            .addField("See solo girl :", `\`\`?solo \`\``, true)

            .addField("See fendom:", `\`\`?fendom \`\``, true)

            .addField("See cum in:", `\`\`?cum-in \`\``, true)

            .addField("See bj:", `\`\`?bj \`\``, true)

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 

client.on('message', message => {
  if (message.content.startsWith(prefix+"help/corona")) {
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**🦠 \ Corona :**__")

            .setColor("RANDOM")

            .addField("For global coronavirus statistics :", `\`\`?all\`\``, true)

            .addField("To see the top 30 most infecting countries (top 1 to 15):", `\`\`?top/1\`\``, true)

            .addField("To see the top 30 most infecting countries (top 15 to 30):", `\`\`?top/2\`\``, true)
            
            .addField("For see a corona meme:", `\`\`?coronameme\`\``, true)
            
            .addField("For see cases :", `\`\`?cases\`\``, true)

            .addField("For coronavirus statistics at country level :", `\`\`?country us/fr/china...\`\``, true)

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 

client.on('message', message => {
  if (message.content.startsWith(prefix+"help/useful")) {
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**🛠️\ Useful :**__")

            .setColor("RANDOM")

            .addField("To add a template to the list :", `\`\`?upload link here\`\``, true)

            .addField("To see information about the server :", `\`\`?server\`\``, true)
            
            .addField("to look at time :", `\`\`?time\`\``, true)

            .addField("To report a user to the moderator :", `\`\`?report @... reason\`\``, true)

            .addField("Markdown lisr :", `\`\`?markdown\`\``, true)

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
});


client.on('message', message => {
  if (message.content.startsWith(prefix+"help/fun")) {
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**🔮\ Fun :**__")

            .setColor("RANDOM")

            .addField("To ask the bot a question :", `\`\`?question Your question here ?\`\``, true)

            .addField("To search for an image on google :", `\`\`?picture Any word here\`\``, true)
            
            .addField("To play stone want scissors with the bot :", `\`\`?rps rock/paper/scissors\`\``, true)

            .addField("To kiss someone :", `\`\`?kiss @...\`\``, true)

            .addField("To slap someone :", `\`\`?slap @...\`\``, true)

            .addField("To tickle someone:", `\`\`?tickle @...\`\``, true)

            .addField("To see weather in location :", `\`\`?weather location\`\``, true)

            .addField("To hug someone :", `\`\`?hug @...\`\``, true)

            .addField("To kill someone :", `\`\`?kill @...\`\``, true)

            .addField("To spanked someone :", `\`\`?spanked @... \`\``, true)

            .addField("To tell you a nice joke:", `\`\`?joke \`\``, true)

            .addField("to see a meme :", `\`\`?meme or ?memes \`\``, true)

            .addField("to make me say something :", `\`\`?say text \`\``, true)

            .addField("To use the discord Markdown quickly and simply :", `\`\`?say/markdown \`\``, true)

            .addField("to see a beautiful picture of astronomy :", `\`\`?astronomy\`\``, true)

            .addField("to see a beautiful picture of space :", `\`\`?space\`\``, true)

            .addField("to see a beautiful picture of aviation :", `\`\`?aviation\`\``, true)

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 

client.on('message', message => {
  if (message.content.startsWith(prefix+"help/music")) {
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**🎵\ Music :**__")

            .setColor("RANDOM")

            .addField("To play a url :", `\`\`?play url here\`\``, true)

            .addField("To move to the next music:", `\`\`?skip\`\``, true)
            
            .addField("To stop the music:", `\`\`?stop\`\``, true)

            .addField("To join the bot in case of bug:", `\`\`?join\`\``, true)

            .addField("To have cool classic music url list:", `\`\`?music\`\``, true)

            .setThumbnail('https://img2.pngio.com/need-help-png-transparent-need-helppng-150532-png-images-pngio-i-need-help-png-266_300.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"user")) {
    let user = message.mentions.users.first() || message.author; 
    
    if (user.presence.status === "dnd") user.presence.status = "Do Not Disturb";
    if (user.presence.status === "idle") user.presence.status = "Idle";
    if (user.presence.status === "offline") user.presence.status = "Offline";
    if (user.presence.status === "online") user.presence.status = "Online";
    
    function game() {
      let game;
      if (user.presence.activities.length >= 1) game = `${user.presence.activities[0].type} ${user.presence.activities[0].name}`;
      else if (user.presence.activities.length < 1) game = "None"; 
      return game; 
    }
    
    let x = Date.now() - user.createdAt; 
    let y = Date.now() - message.guild.members.cache.get(user.id).joinedAt; 
    let created = Math.floor(x / 86400000); 
    let joined = Math.floor(y / 86400000);
    
    const member = message.guild.member(user);
    let nickname = member.nickname !== undefined && member.nickname !== null ? member.nickname : "None"; 
    let createdate = moment.utc(user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss"); 
    let joindate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss"); 
    let status = user.presence.status; 
    let avatar = user.avatarURL({size: 2048}); 
    
    const embed = new Discord.MessageEmbed()
    .setAuthor(user.tag, avatar)
    .setThumbnail(avatar)
    .setTimestamp()
    .setColor("RANDOM")
    .addField("ID", user.id, true)
    .addField("Nickname", nickname, true)
    .addField("Created Account Date", `${createdate} \nsince ${created} day(s) ago`, true)
    .addField("Joined Guild Date", `${joindate} \nsince ${joined} day(s) ago`, true)
    .addField("Status", status, true)
    .addField("Game", game(), true)
    
    message.channel.send(embed); 
    };
}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"server")) {
    const dateformat = require('dateformat')
    let icon = message.guild.iconURL({size: 2048}); 
    
    let region = {
      "brazil": "Brazil",
      "eu-central": "Central Europe",
      "singapore": "Singapore",
      "london": "London",
      "russia": "Russia",
      "japan": "Japan",
      "hongkong": "Hongkong",
      "sydney": "Sydney",
      "us-central": "U.S. Central",
      "us-east": "U.S. East",
      "us-south": "U.S. South",
      "us-west": "U.S. West",
      "eu-west": "Western Europe"
    }

    let member = message.guild.members;
    let offline = member.cache.filter(m => m.user.presence.status === "offline").size,
        online = member.cache.filter(m => m.user.presence.status === "online").size,
        idle = member.cache.filter(m => m.user.presence.status === "idle").size,
        dnd = member.cache.filter(m => m.user.presence.status === "dnd").size,
        robot = member.cache.filter(m => m.user.bot).size,
        total = message.guild.memberCount;
    

    let channels = message.guild.channels;
    let text = channels.cache.filter(r => r.type === "text").size,
        vc = channels.cache.filter(r => r.type === "voice").size,
        category = channels.cache.filter(r => r.type === "category").size,
        totalchan = channels.cache.size;
    

    let location = region[message.guild.region];
    

    let x = Date.now() - message.guild.createdAt;
    let h = Math.floor(x / 86400000) 
    let created = dateformat(message.guild.createdAt); 
    
    const embed = new Discord.MessageEmbed()
    .setTitle("Server Information")
    .setColor(0x7289DA)
    .setTimestamp(new Date())
    .setThumbnail(icon)
    .setAuthor(message.guild.name, icon)
    .setDescription(`**ID:** ${message.guild.id}`)
    .addField("Region", location)
    .addField("Date Created", `${created} \nsince **${h}** day(s)`)
    .addField("Owner", `**${message.guild.owner.user.tag}** \n\`${message.guild.owner.user.id}\``)
    .addField(`Members [${total}]`, `Online: ${online} \nIdle: ${idle} \nDND: ${dnd} \nOffline: ${offline} \nBots: ${robot}`)
    .addField(`Channels [${totalchan}]`, `Text: ${text} \nVoice: ${vc} \nCategory: ${category}`)
    .addField("Roles", message.guild.roles.cache.size, true)
    .addField("You Joined", message.member.joinedAt)
    message.channel.send(embed); 
    };
}); 


client.on('message', message => {
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let msg = message.content.toLowerCase();
  let cmd = args.shift().toLowerCase();
  if (msg.startsWith(prefix + "meme") || msg.startsWith(prefix + "memes")) {
    const got = require('got')
    got('https://www.reddit.com/r/meme/random/.json').then(response => {
      let content = JSON.parse(response.body),
          image = content[0].data.children[0].data.url,
          embed = new Discord.MessageEmbed()
      .setImage(image)
      .setTimestamp()
      .setFooter('from: r/meme')
      message.channel.send(embed);
    }).catch(console.log)
}});

  client.on('message', msg => { 
    if (msg.content === '?all') { 
      msg.delete();
      const url = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Confirmed%22%2C%22outStatisticFieldName%22%3A%22confirmed%22%7D%2C%20%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Deaths%22%2C%22outStatisticFieldName%22%3A%22deaths%22%7D%2C%20%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Recovered%22%2C%22outStatisticFieldName%22%3A%22recovered%22%7D%5D"
      request(url, function (err, response, body) { 
        if (err) return msg.send("ERR") 
        body = JSON.parse(body) 
        infected = body['features'][0]['attributes']['confirmed']
        dead = body['features'][0]['attributes']['deaths']
        recovered = body['features'][0]['attributes']['recovered']
        let sEmbed = new Discord.MessageEmbed()
        .setColor('#346beb')
        .setTitle("Corona stats :")
        .addField(':white_check_mark: Confirmed:',`${infected}`)
        .addField(':skull: Deaths:', `${dead}`)
        .addField(':repeat: Recovered:', `${recovered}`)
        .setThumbnail('https://images-ext-1.discordapp.net/external/GqXCIgSn9p4qSpkyLb285ZVwNYFnZAvRpJN-ywDOe4M/%3Ft%3D1588578572.7076507/https/upload.wikimedia.org/wikipedia/commons/thumb/2/26/COVID-19_Outbreak_World_Map.svg/langfr-1000px-COVID-19_Outbreak_World_Map.svg.png')
        .setFooter( ` Lookup was requested by ${ msg.author.username }  `,)
        .setTimestamp()
        return msg.channel.send({embed: sEmbed});
         })
      }
      })
      
        client.on('message', msg => { 
        if (msg.content === '?top/1') { 
          msg.delete();
          const url = "https://coronavirus.zone/data.json"
          request(url, function (err, response, body , ) { 
            if (err) return msg.send("ERR") 
            body = JSON.parse(body) 
            id1 = body[0]['region']
            id1 = body[0]['cases']
            d1  = body[0]['death']
            
            id2 = body[1]['region']
            id2 = body[1]['cases']
            d2  = body[1]['death']
            
            id3 = body[2]['region']
            id3 = body[2]['cases']
            d3  = body[2]['death']
            
            id4 = body[3]['region']
            id4 = body[3]['cases']
            d4  = body[3]['death']
            
            id5 = body[4]['region']
            id5 = body[4]['cases']
            d5  = body[4]['death']

            id6 = body[5]['region']
            id6 = body[5]['cases']
            d6  = body[5]['death']
            
            id7 = body[6]['region']
            id7 = body[6]['cases']
            d7  = body[6]['death']

            id8 = body[7]['region']
            id8 = body[7]['cases']
            d8  = body[7]['death']

            id9 = body[8]['region']
            id9 = body[8]['cases']
            d9  = body[8]['death']

            id10 = body[9]['region']
            id10 = body[9]['cases']
            d10  = body[9]['death']

            id11 = body[10]['region']
            id11 = body[10]['cases']
            d11  = body[10]['death']
           
            id12 = body[11]['region']
            id12 = body[11]['cases']
            d12  = body[11]['death']

            id13 = body[12]['region']
            id13 = body[12]['cases']
            d13  = body[12]['death']

            id14 = body[13]['region']
            id14 = body[13]['cases']
            d14  = body[13]['death']

            id15 = body[14]['region']
            id15 = body[14]['cases']
            d15  = body[14]['death']

            id16 = body[15]['region']
            id16 = body[15]['cases']
            d16  = body[15]['death']

            id17 = body[16]['region']
            id17 = body[16]['cases']
            d17  = body[16]['death']

            id18 = body[17]['region']
            id18 = body[17]['cases']
            d18  = body[17]['death']

            id19 = body[18]['region']
            id19 = body[18]['cases']
            d19  = body[18]['death']

            id20 = body[19]['region']
            id20 = body[19]['cases']
            d20  = body[19]['death']

            id21 = body[20]['region']
            id21 = body[20]['cases']
            d21  = body[20]['death']

            id22 = body[21]['region']
            id22 = body[21]['cases']
            d22  = body[21]['death']

            id23 = body[22]['region']
            id23 = body[22]['cases']
            d23  = body[22]['death']

            id24 = body[23]['region']
            id24 = body[23]['cases']
            d24  = body[23]['death']
            
            id25 = body[24]['region']
            id25 = body[24]['cases']
            d25  = body[24]['death']

            id26 = body[25]['region']
            id26 = body[25]['cases']
            d26  = body[25]['death']

            id27 = body[26]['region']
            id27 = body[26]['cases']
            d27  = body[26]['death']

            id28 = body[27]['region']
            id28 = body[27]['cases']
            d28  = body[27]['death']

            id29 = body[28]['region']
            id29 = body[28]['cases']
            d29  = body[28]['death']

            id30 = body[29]['region']
            id30 = body[29]['cases']
            d30  = body[29]['death']
           
            
            let sEmbed = new Discord.MessageEmbed()
            .setColor("#346beb")
            .setTitle("🦠Corona full stats page 1 (30/all)🦠")
            .addField("Rank💠     Check✅     Dead💀   Country🗺️",`\`\`\`\
01     ${id1}    ${d1}    ${body[0].region}
02     ${id2}     ${d2}      ${body[1].region}
03     ${id3}     ${d3}      ${body[2].region}
04     ${id4}      ${d4}      ${body[3].region}
05     ${id5}      ${d5}       ${body[4].region}
06     ${id6}      ${d6}       ${body[5].region}
07     ${id7}      ${d7}       ${body[6].region}
08     ${id8}      ${d8}       ${body[7].region}
09     ${id9}      ${d9}       ${body[8].region}
10     ${id10}       ${d10}       ${body[9].region}
11     ${id11}       ${d11}       ${body[10].region}
12     ${id12}       ${d12}       ${body[11].region}
13     ${id13}       ${d13}       ${body[12].region}
14     ${id14}       ${d14}       ${body[13].region}
15     ${id15}       ${d15}       ${body[14].region}
      \`\`\`\ ` ,) 
            .setFooter( ` Lookup was requested by ${ msg.author.username }  `,)
            .setTimestamp()
return msg.channel.send({embed: sEmbed});
})
}});

client.on('message', msg => { 
  if (msg.content === '?top/2') { 
    msg.delete();
    const url = "https://coronavirus.zone/data.json"
    request(url, function (err, response, body , ) { 
      if (err) return msg.send("ERR") 
      body = JSON.parse(body) 
      id1 = body[0]['region']
      id1 = body[0]['cases']
      d1  = body[0]['death']
      
      id2 = body[1]['region']
      id2 = body[1]['cases']
      d2  = body[1]['death']
      
      id3 = body[2]['region']
      id3 = body[2]['cases']
      d3  = body[2]['death']
      
      id4 = body[3]['region']
      id4 = body[3]['cases']
      d4  = body[3]['death']
      
      id5 = body[4]['region']
      id5 = body[4]['cases']
      d5  = body[4]['death']

      id6 = body[5]['region']
      id6 = body[5]['cases']
      d6  = body[5]['death']
      
      id7 = body[6]['region']
      id7 = body[6]['cases']
      d7  = body[6]['death']

      id8 = body[7]['region']
      id8 = body[7]['cases']
      d8  = body[7]['death']

      id9 = body[8]['region']
      id9 = body[8]['cases']
      d9  = body[8]['death']

      id10 = body[9]['region']
      id10 = body[9]['cases']
      d10  = body[9]['death']

      id11 = body[10]['region']
      id11 = body[10]['cases']
      d11  = body[10]['death']
     
      id12 = body[11]['region']
      id12 = body[11]['cases']
      d12  = body[11]['death']

      id13 = body[12]['region']
      id13 = body[12]['cases']
      d13  = body[12]['death']

      id14 = body[13]['region']
      id14 = body[13]['cases']
      d14  = body[13]['death']

      id15 = body[14]['region']
      id15 = body[14]['cases']
      d15  = body[14]['death']

      id16 = body[15]['region']
      id16 = body[15]['cases']
      d16  = body[15]['death']

      id17 = body[16]['region']
      id17 = body[16]['cases']
      d17  = body[16]['death']

      id18 = body[17]['region']
      id18 = body[17]['cases']
      d18  = body[17]['death']

      id19 = body[18]['region']
      id19 = body[18]['cases']
      d19  = body[18]['death']

      id20 = body[19]['region']
      id20 = body[19]['cases']
      d20  = body[19]['death']

      id21 = body[20]['region']
      id21 = body[20]['cases']
      d21  = body[20]['death']

      id22 = body[21]['region']
      id22 = body[21]['cases']
      d22  = body[21]['death']

      id23 = body[22]['region']
      id23 = body[22]['cases']
      d23  = body[22]['death']

      id24 = body[23]['region']
      id24 = body[23]['cases']
      d24  = body[23]['death']
      
      id25 = body[24]['region']
      id25 = body[24]['cases']
      d25  = body[24]['death']

      id26 = body[25]['region']
      id26 = body[25]['cases']
      d26  = body[25]['death']

      id27 = body[26]['region']
      id27 = body[26]['cases']
      d27  = body[26]['death']

      id28 = body[27]['region']
      id28 = body[27]['cases']
      d28  = body[27]['death']

      id29 = body[28]['region']
      id29 = body[28]['cases']
      d29  = body[28]['death']

      id30 = body[29]['region']
      id30 = body[29]['cases']
      d30  = body[29]['death']
     
      
      let sEmbed = new Discord.MessageEmbed()
      .setColor("#346beb")
      .setTitle("🦠Corona full stats page 2 (30/all)🦠")
      .addField("Rank💠     Check✅     Dead💀   Country🗺️",`\`\`\`\
16     ${id16}       ${d16}       ${body[15].region}
17     ${id17}       ${d17}       ${body[16].region}
18     ${id18}       ${d18}       ${body[17].region}
19     ${id19}       ${d19}       ${body[18].region}
20     ${id20}       ${d20}       ${body[19].region}
21     ${id21}       ${d21}       ${body[20].region}
22     ${id22}       ${d22}       ${body[21].region}
23     ${id23}       ${d23}       ${body[22].region}
24     ${id24}       ${d24}       ${body[23].region}
25     ${id25}       ${d25}       ${body[24].region}
26     ${id26}       ${d26}       ${body[25].region}
27     ${id27}       ${d27}       ${body[26].region}
28     ${id28}       ${d28}       ${body[27].region}
29     ${id29}       ${d29}       ${body[28].region}
30     ${id30}        ${d30}       ${body[29].region}
\`\`\`\ ` ,) 
      .setFooter( ` Lookup was requested by ${ msg.author.username }  `,)
      .setTimestamp()
return msg.channel.send({embed: sEmbed});
})
}});



client.on('message', async message => {

  if (message.content === prefix + 'coronameme') {

      const subRedditss = ["CoronavirusMemes"];
          const randoms = subRedditss[Math.floor(Math.random() * subRedditss.length )];

          const imgs = await randomPuppy(randoms);
          const embeds = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setImage(imgs)
              .setTitle(`From /r/${randoms}`)
              .setThumbnail('https://images-ext-1.discordapp.net/external/GqXCIgSn9p4qSpkyLb285ZVwNYFnZAvRpJN-ywDOe4M/%3Ft%3D1588578572.7076507/https/upload.wikimedia.org/wikipedia/commons/thumb/2/26/COVID-19_Outbreak_World_Map.svg/langfr-1000px-COVID-19_Outbreak_World_Map.svg.png')
              .setURL(`https://reddit.com/r/${randoms}`);
          message.channel.send(embeds)
}});


const api = require('covidapi');
const { NovelCovid } = require('novelcovid');
const track = new NovelCovid();

client.on('message', async message => {
  if (message.author.bot) return;

  if (message.content === prefix + 'cases') {
          api.all().then(console.log)

          const data = await api.all()
          const coronaembed = new Discord.MessageEmbed()
          .setColor("ff2050")
          .setThumbnail('https://images-ext-1.discordapp.net/external/GqXCIgSn9p4qSpkyLb285ZVwNYFnZAvRpJN-ywDOe4M/%3Ft%3D1588578572.7076507/https/upload.wikimedia.org/wikipedia/commons/thumb/2/26/COVID-19_Outbreak_World_Map.svg/langfr-1000px-COVID-19_Outbreak_World_Map.svg.png')
          .setTitle("Global Cases 🦠")
          .setDescription("Number of cases may differ from other sources")
          .addField("🧫 Cases", data.cases, true)
          .addField("🔵 Active", data.active, true)
          .addField("⏳ Cases Today", data.todayCases, true)
          .addField("🚫 Critical Cases", data.critical, true)
          .addField("💀 Deaths", data.deaths, true)
          .addField("✅ Recovered", data.recovered, true)
          message.channel.send(coronaembed)


  } else if(message.content.startsWith(prefix + 'country')) {
      const countrycovid = message.content.slice(prefix.length).split(' ')
      const countrydata = await api.countries({country: countrycovid})
      
      if(!countrydata.cases){return message.channel.send(`**Please specify a country !**`)}
      else {
      const countryembed = new Discord.MessageEmbed()
      .setColor("ff2050")
      .setThumbnail('https://images-ext-1.discordapp.net/external/GqXCIgSn9p4qSpkyLb285ZVwNYFnZAvRpJN-ywDOe4M/%3Ft%3D1588578572.7076507/https/upload.wikimedia.org/wikipedia/commons/thumb/2/26/COVID-19_Outbreak_World_Map.svg/langfr-1000px-COVID-19_Outbreak_World_Map.svg.png')
      .setTitle(`${countrycovid[1]} Cases 🦠`)
      .setDescription("Number of cases may differ from other sources")
      .addField("🧫 Cases", countrydata.cases, true)
      .addField("🔵 Active", countrydata.active, true)
      .addField("⏳ Cases Today", countrydata.todayCases, true)
      .addField("🚫 Critical Cases", countrydata.critical, true)
      .addField("💀 Deaths", countrydata.deaths, true)
      .addField("✅ Recovered", countrydata.recovered, true)
      message.channel.send(countryembed)
}}});

const giveMeAJoke = require('discord-jokes');

client.on('message', async message => {

  if (message.content === prefix + 'joke') {
      giveMeAJoke.getRandomDadJoke (function(joke) {
    message.channel.send(joke);
    });
}});


client.on('message', message => {
  if (message.content.startsWith(prefix+"markdown")) {
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**😎\ Markdown :**__")

            .setColor("RANDOM")

            .addField("Bold :", `\`\`**Bold text**\`\``, true)

            .addField("italics :", `\`\`*italics text*\`\``, true)

            .addField("bold italics :", `\`\`***Bold & italics text***\`\``, true)

            .addField("bared :", `\`\`~~bared text~~\`\``, true)

            .addField("highlighted :", `\`\`__highlightes text__\`\``, true)

            .addField("Bold Italics :", `\`\`***bold italics***\`\``, true)

            .addField("underline bold italics :", `\`\`__***underline bold italics***__\`\``, true)

            .setThumbnail('https://miro.medium.com/max/3000/1*HB9Cy4zmmggm5QUKAOO71g.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 

client.on("message", message => {
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	if(command === "say") {
	  const sayMessage = args.join(` `);
	  if(!sayMessage) return message.reply("Please specify text")
	  message.delete().catch();
	  message.channel.send(sayMessage);
  }
});


client.on("message", message => {
  if(message.author.bot) return;
  if(message.content.indexOf(prefix) !== 0) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if(command === "say/markdown") {
	  const embed = new Discord.MessageEmbed()
		.setColor("RANDOM")
		.setTitle(`😎\ Say Markdown Help`)
		.addField(`${prefix}italic`, `*Italic*`)
		.addField(`${prefix}bold`, `**bold**`)
		.addField(`${prefix}underline`, `__underline__`)
		.addField(`${prefix}strikethrough`, `~~strikethrough~~`)
		.addField(`${prefix}quotes`, `>>> quotes`)
		.addField(`${prefix}spoiler`, `||Spoiler||`)
		.addField(`${prefix}code`, `code`)
		.addField(`${prefix}code-block`, `code-block`)
		.addField(`${prefix}code-color`, `To perform this command, you must skip a line after the defined language!\nExemple: ${prefix}say-code-color Js or other language\nYour code in Js or other language`)
		.setTimestamp()
		.setFooter('Markdown Release Version');
		message.channel.send(embed);
	}
if(command === "italic") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("*" + `${sayMessage}` + "*");
}
if(command === "bold") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("**" + `${sayMessage}` + "**");
}
if(command === "underline") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("__" + `${sayMessage}` + "__");
}
if(command === "strikethrough") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("~~" + `${sayMessage}` + "~~");
}
if(command === "quotes") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send(">>> " + `${sayMessage}`);
}
if(command === "spoiler") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("||" + `${sayMessage}` + "||");
}
if(command === "code") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("`" + `${sayMessage}` + "`");
}
if(command === "code-block") {
  const sayMessage = args.join(` `);
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("```\n" + `${sayMessage}` + "\n```" );
}
if(command === "code-color") {
  const sayColor = args.slice(0).join(' ');
  const sayMessage = args.slice(1).join(' ');
  if(!sayMessage) return message.reply("Please specify text")
  message.delete().catch();
  message.channel.send("```" + `${sayColor}` + "\n" + `${sayMessage}` +"\n```");
}
});


client.on('message', async message => {

  if (message.content === prefix + 'astronomy') {

      const subRedditss = ["Astronomy"];
          const randoms = subRedditss[Math.floor(Math.random() * subRedditss.length )];

          const imgs = await randomPuppy(randoms);
          const embeds = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setImage(imgs)
              .setTitle(`From Nasa Astronomy :`)
              .setThumbnail('https://www.stickpng.com/assets/images/58429400a6515b1e0ad75acc.png')
              .setURL(`https://reddit.com/r/${randoms}`);
          message.channel.send(embeds)
}});


client.on('message', async message => {

  if (message.content === prefix + 'space') {

      const subRedditss = ["space"];
          const randoms = subRedditss[Math.floor(Math.random() * subRedditss.length )];

          const imgs = await randomPuppy(randoms);
          const embeds = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setImage(imgs)
              .setTitle(`From Nasa space :`)
              .setThumbnail('https://www.stickpng.com/assets/images/58429400a6515b1e0ad75acc.png')
              .setURL(`https://reddit.com/r/${randoms}`);
          message.channel.send(embeds)
}});


client.on('message', async message => {

  if (message.content === prefix + 'aviation') {

      const subRedditss = ["aviation"];
          const randoms = subRedditss[Math.floor(Math.random() * subRedditss.length )];

          const imgs = await randomPuppy(randoms);
          const embeds = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setImage(imgs)
              .setTitle(`From aviation :`)
              .setThumbnail('https://cdn.pixabay.com/photo/2018/05/21/12/37/clipart-3418140_960_720.png')
              .setURL(`https://reddit.com/r/${randoms}`);
          message.channel.send(embeds)
}});



const NLP = require('natural');
const classifier = new NLP.LogisticRegressionClassifier(); 

const myData = JSON.parse(fs.readFileSync("./data.json"));

Object.keys(myData).forEach((e, key) => {
    myData[e].questions.forEach((phrase) => {
        classifier.addDocument(phrase.toLowerCase(), e);
    }) 
});
classifier.train();
classifier.save('./classifier.json', (err, classifier) => {
    if (err) {
        console.error(err);
    }
    console.log('Created a Classifier file in ');
});

let message = "hey";
let botAnswer = "Sorry, I'm not sure what you mean";
const guesses = classifier.getClassifications(message.toLowerCase());
const guess = guesses.reduce((x, y) => x && x.value > y.value ? x : y);
if(guess.value > (0.6) && myData[guess.label]) {
    botAnswer = myData[guess.label].answer;
}



const db = require('quick.db')


/*Economy Bot*/
client.on('message', async message => {
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "add") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You don\'t have enough permissions to use this command.")
    let user = message.mentions.members.first() || message.author

    if (isNaN(args[0])) return message.channel.send(`${message.author}, you must enter a number`).then(msg => {
        setTimeout(() => {
           msg.delete() 
        }, 5000);
    })

    db.add(`money_${user.id}`, args[0])
    let bal = await db.fetch(`money_${user.id}`)
    message.channel.send(`you added ${args[0]}. The account balance is now ${bal}`)
  }
  if (command === "bal"){
    
    let user = message.mentions.users.first()  || message.author;

    let money = await db.fetch(`money_${user.id}`)
    if (money === null) money = 0;
    message.channel.send(`${user} you have ${money}$ !`)
} 
  if (command === "buy"){

    let bal = await db.fetch(`money_${message.author.id}`);
    switch (args[0]) {
        case 'premium':
            let PRole = message.guild.roles.cache.find(r => r.name === '💎')
            if(message.member.roles.cache.has(PRole.id)) return message.reply("You already bought it!");
            if (bal < 2000) return message.channel.send(`You don’t have enough money. You miss them  **${2000-bal}$** !`)
            db.subtract(`money_${message.author.id}`, 2000)
            message.channel.send("Bravo! You bought the premium")
            message.member.roles.add(PRole.id)
            break;
        case 'vip':
            let VRole = message.guild.roles.cache.find(r => r.name === '💸')
            if(message.member.roles.cache.has(VRole.id)) return message.reply("You already bought it!");
            if (bal < 1000) return message.channel.send(`You don’t have enough money. You miss them  **${1000-bal}$** !`)
            db.subtract(`money_${message.author.id}`, 1000)
            message.channel.send("Bravo! You bought the Vip")
            message.member.roles.add(VRole.id)
            break;
    
        default: message.channel.send("You must put a valid product.")
            break;
    }


  }
  if (command === "daily"){
    let timeout = 86400000 //24h
      let amount = Math.floor(Math.random() * 999) + 1;
      let daily = await db.fetch(`daily_${message.author.id}`);

      if (daily !== null && timeout - (Date.now() - daily) > 0) {
          let time = ms(timeout - (Date.now() - daily));
          message.channel.send(`You have already recovered your reward of the day. Return to **${time.hours}h ${time.minutes}m ${time.seconds}** !`)
      } else {
          message.channel.send(`You have won a **${amount}$** !`)
          db.add(`money_${message.author.id}`, amount)
          db.set(`daily_${message.author.id}`, Date.now())
      }

  }
  if (command === "remove"){
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You don\'t have enough permissions to use this command.")
    let user = message.mentions.members.first() || message.author

    if (isNaN(args[0])) return message.channel.send(`${message.author}, you must enter a number!`).then(msg => {
        setTimeout(() => {
           msg.delete() 
        }, 5000);
    })

    db.subtract(`money_${user.id}`, args[0])
    let bal = await db.fetch(`money_${user.id}`)
    message.channel.send(`you removed ${args[0]}$ ! The account balance is now **${bal}$** !`)
  } 
  if (command === "shop"){
    const embedStats = new Discord.MessageEmbed()
    .setAuthor(message.guild.name)

    .setTitle("__**💰\ Shop :**__")

    .setDescription("?premium / ?vip")

    .setColor("RANDOM")

    .addField("Premium :", `\`\`2000\`\``, true)

    .addField("VIP :", `\`\`1000\`\``, true)

    .setThumbnail('https://www.icone-png.com/png/43/43290.png')

    .setTimestamp()

    .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
    message.channel.send(embedStats)

    
  }
  if (command === "pay"){

    let user = message.mentions.members.first()
        let member = db.fetch(`money_${message.author.id}`)

        if (!user) {
            return message.channel.send('You must mention one person.');
        }
        if (!args[1]) {
            return message.channel.send('Specify the amount!');
        }
        if (message.content.includes('-')) {
            return message.channel.send('The amount must be positive!')
        }
        if (member < 0) {
            return message.channel.send('You must have some money to make a transfer.' )
        }
        message.channel.send(`${message.author}, you've just given **${args[1]}**$  to ${user.user.username}`)
        db.add(`money_${user.id}`, args[1])
        db.subtract(`money_${message.author.id}`, args[1])
  }
  if(command === "work"){
    let timeout = 1200000; 
    let amount = Math.floor(Math.random() * 500) + 1; //1 to 500
  

    function random() {
      return arguments[Math.floor(Math.random() * arguments.length)];
    }

    let work = await db.fetch(`work_${message.author.id}`);
    let worker = random(
    `You worked as a hacker and got **$${amount}**`,
    `You worked at Discord and earned **$${amount}** because you were active`,
    `You worked at a local bank and tried to rob it but you failed and somehow earned **$${amount}**`,
    `You worked as a Youtuber and got **$${amount}**!`);
    
    if (work !== null && timeout - (Date.now() - work) > 0) {
      let time = ms(timeout - (Date.now() - work));

      message.channel.send(
        `You are too tired to work! You can work again in **20 minutes**!`
    );
  } else {
    let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setAuthor("Work", client.user.displayAvatarURL)
    .setDescription(`${worker}`)
    message.channel.send(embed)
  }
    
      db.add(`money_${message.author.id}`, amount);
      db.set(`work_${message.author.id}`, Date.now());

  }

});

client.on('message', message => {
  if (message.content.startsWith(prefix+"help/economy")) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You don\'t have enough permissions to use this command.")
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**💰\ Economy :**__")

            .setColor("RANDOM")

            .addField("To see your money :", `\`\`?bal\`\``, true)

            .addField("To see your money from someone :", `\`\`?bal @...\`\``, true)
            
            .addField("To pay a user :", `\`\`?pay  @... amount\`\``, true)

            .addField("to obtain money   :", `\`\`?work\`\``, true)

            .addField("to see the shop", `\`\`?shop\`\``, true)

            .addField("To get your reward, every day (the command can sometimes bug (V1.2) :", `\`\`?daily\`\``, true)

            .addField("Admin command to add money to user :", `\`\`?add @... amount\`\``, true)

            .addField("Admin command to remove money to user :", `\`\`?remove @... amount\`\``, true)

            .setThumbnail('https://www.kindpng.com/picc/m/332-3328931_our-ocean-economy-world-economy-icon-hd-png.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 


client.on('message', message => {
  if (message.content.startsWith(prefix+"help/level")) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("You don\'t have enough permissions to use this command.")
        const embedStats = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)

            .setTitle("__**⭐\ Level :**__")

            .setColor("RANDOM")

            .addField("To see your level :", `\`\`?level\`\``, true)

            .setThumbnail('https://pngimage.net/wp-content/uploads/2018/06/lvl-up-png-3.png')

            .setTimestamp()

            .setFooter('Made By 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™');
        message.channel.send(embedStats)
    };
}); 

const { addexp } = require("./handlers/xp.js")
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

["command"].forEach(handler => { 
  require(`./handlers/${handler}`)(client)
})

client.on("message", async message => {
  
  if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;
    
       if (!message.member) message.member = await message.guild.fetchMember(message);
  
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const cmd = args.shift().toLowerCase();
      
      if (cmd.length === 0) return;
      
      // Get the command
      let command = client.commands.get(cmd);
      // If none is found, try to find it by alias
      if (!command) command = client.commands.get(client.aliases.get(cmd));
  
      // If a command is finally found, run the command
      if (command) 
          command.run(client, message, args);
    
  return addexp(message)
  
   }) //All codes link in description
  
  //GONNA USE EVENT HERE
  
  client.on("guildMemberAdd", (member) => {
    let chx = db.get(`welchannel_${member.guild.id}`);
    
    if(chx === null) {
      return;
    }
  
    let wembed = new discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.avatarURL())
    .setColor("#ff2050")
    .setThumbnail(member.user.avatarURL())
    .setDescription(`We are very happy to have you in our server`);
    
    client.channels.cache.get(chx).send(wembed)
  })



client.on('message', message => {
  if (message.content.startsWith(prefix+"info")) {
        const embedStats = new Discord.MessageEmbed()
        .setColor("RANDOM")

        .setAuthor("Information about ALL. bot", client.user.displayAvatarURL) 
  
        .addField("📅 Creation date", "> Mar 18, 2020.")
  
        .addField("👑 Created by", "> 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™#7522.")
  
        .addField(
          "🎗 Support server",
          "> [Click here to join!](https://discord.gg/UqfUHKn)"
        )
  
        .addField(
          "🔎 Invite ALL.",
          "> [Click here to invite!](https://discordapp.com/oauth2/authorize?client_id=700315775378128956&scope=bot&permissions=2146958847)"
        );
        message.channel.send(embedStats)
    };
}); 


