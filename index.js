const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { Client, MessageAttachment } = require('discord.js');
const warns = JSON.parse(fs.readFileSync('./warns.json'));
const ytdl = require('ytdl-core');
const Canvas = require('canvas');
var prefix = "?";
 
client.login('NzAwMzE1Nzc1Mzc4MTI4OTU2.XqLuiw.DaHGKmw_QQ6Og9rf88mW2q8pAic');


client.on('message', message => {
  if (message.content === prefix + "code") {
    if (message.member.hasPermission("ADMINISTRATOR")){
      const buffer = fs.readFileSync('./index.js');
      const attachment = new MessageAttachment(buffer, 'index.js');
      message.channel.send(`${message.author}, my code : `, attachment);
  }}
});

client.on('message', message => {
  if (message.content === prefix + "js") {
    const attachment = new MessageAttachment('./js.png');
    message.channel.send(`${message.author},`, attachment);
  }
});

client.on('message', message => {
  if (message.content === prefix + "nodejs") {
    const attachment = new MessageAttachment('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1024px-Node.js_logo.svg.png');
    message.channel.send(attachment);
  }
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
        if (!args[0]) return message.channel.send("Veuillez **poser une question** :x:")
        let rep = ["yes yes yesss :x:", "always:heart_eyes: ", "no :face_palm:", "hummm... :thinking:", "... :interrobang:"];
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
 
client.on('message', msg =>{
    if(msg.content === prefix + "bot"){
        msg.channel.send({embed: {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: "Js_Bot:",
            description: "Made by Mr. wolf",
            fields: [{
                name: "bot .js",
                value: "node.js / discord.js"
              }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "©Js_Bot"
            }
          }
        });
}});

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

client.on('message', message => {

  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'rps') {
      let replies = ['rock', 'paper', 'scissors'];
      let result = Math.floor((Math.random() * replies.length));

      let uReply = args[0];
      if (!uReply) return message.channel.send(`Please play with one of these responses: \`${replies.join(', ')}\``);
      if (!replies.includes(uReply)) return message.channel.send(`Only these responses are accepted: \`${replies.join(', ')}\``);

      if (replies[result] === uReply) {
          console.log(replies[result]);
          return message.channel.send('It\'s a tie! We had the same choice.');
      } else if (uReply === 'rock') {
          console.log(replies[result]);
          if (replies[result] === 'paper') return message.channel.send('paper I won!');
          else return message.channel.send('You won!');
      } else if (uReply === 'scissors') {
          console.log(replies[result]);
          if (replies[result] === 'rock') return message.channel.send('rock I won!');
          else return message.channel.send('You won!');
      } else if (uReply === 'paper') {
          console.log(replies[result]);
          if (replies[result] === 'scissors') return message.channel.send('scissors I won!');
          else return message.channel.send('You won!');
      }
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

client.on('message', message => {
	if (message.content === prefix +'testa') {
		client.emit('guildMemberAdd', message.member);
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


client.on("message", async message =>{
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let command = messageArray [0];
  let args = messageArray.slice(1);
 
  if (message.content === prefix +'serverinfo') {
    
      let embed = new Discord.MessageEmbed()
      embed.setDescription("This is all the Infomation you need to know about our server!")
      embed.addField('Name', `${message.guild.name}`, (`${message.guild.nameAcronym, true}`))
      embed.addField('Server Owner', message.guild.owner.user.tag, true)
      embed.addField("Server Create Date", message.guild.createdAt, true)
      embed.addField("Member Count", message.guild.memberCount, true)
      embed.addField("Channel Count", message.guild.channels.count)
      embed.setColor("#FFD97C")
      embed.setFooter("Made by 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™")


          message.channel.send(embed);

          return;
         
          }
      });

      
client.on('message', message => {
  if (message.content.startsWith(prefix + 'help')) {
      let args = message.content.split(" ").slice(1);
      let thingToEcho = args.join(" ")
      message.delete()
      const ayy = client.emojis.cache.find(emoji => emoji.name === "load");
      message.channel.send(`${ayy} Connecting to API, please wait...`).then(m => {
          setTimeout(() => {
              m.edit(`${ayy} Connecting to server, please wait...`);
              m.delete({
                  timeout: 5000
              }).then(() => {
                  var embed = new Discord.MessageEmbed()
                      .setDescription("commands :")
                      .addField('help command', '?help')
                      .addField('see info of server', '?serverinfo')
                      .addField('emit a new member', '?testa')
                      .addField('rock paper ...', '?rps')
                      .addField('set activity of bot', '?activity')
                      .addField('poll comand', '?poll')
                      .addField('add template', '?upload')
                      .addField('picture from google', '?picture')
                      .addField('play url', '?play')
                      .addField('skip', '?skip')
                      .addField('stop playing', '?stop')
                      .addField('classic music list', '?music')
                      .addField('your info', '?user-info')
                      .addField('pong', '?ping')
                      .addField('say good night', '?goodn')
                      .addField('ask bot', '?questiion')
                      .addField('info of bot', '?bot')
                      .addField('warn a member', '?warn')
                      .addField('see warn of a member', '?warns')
                      .addField('clear msg max: 99', '?clear')
                      .setColor("#FFD97C")
                      .setTimestamp()
                      .setFooter("Made by 𝑺𝒊𝒓. 𝑾𝒐𝒍𝒇™");
                  message.channel.send(embed)
              })
          }, 1000)
      })
  }
});

client.on('message', message => {
    if (message.content === prefix +'loadtest') {
      const ayy = client.emojis.cache.find(emoji => emoji.name === "load");
      message.channel.send(`${ayy} Connecting to API, please wait...`).then(m => {
        setTimeout(()=>{m.edit(`${ayy} Connecting to server, please wait...`); m.delete({timeout:3000})},1000)
    })}
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
    message.channel.send("this words is banned");
  }
});


const Commande2 = '?banword '

client.on('message', message => {
  if (message.content.startsWith(Commande2)) {
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


client.on('message', message => {
  if (message.content === prefix +'server') {
    let servericon = message.guild.iconURL;
let serverembed = new Discord.MessageEmbed()
.setTitle("Server Information")
.setColor("RANDOM")
.setThumbnail(servericon)
.addField("Server Name", message.guild.name)
.addField("Owner", `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}`, true)
.addField("Channels", message.guild.channels.cache.size, true)
.addField("Roles", message.guild.roles.cache.size, true)
.addField("Created On", message.guild.createdAt)
.addField("You Joined", message.member.joinedAt)
.addField("Total Members", message.guild.memberCount)
.setThumbnail(message.guild.iconURL())
.setTimestamp()
.setFooter(message.author.username, message.author.avatarURL);
message.channel.send(serverembed);
}});

client.on('message', message => {
  if (message.content.startsWith(prefix+"user")) {
    var mention = message.mentions.members.first()
    if(!mention) return message.channel.send("Please mention someone to get their user info.")
    const userlol = new Discord.MessageEmbed()
    .setThumbnail(mention.user.avatarURL)
    .setColor("RANDOM")
    .addField(`${mention.user.username}\'s ID`, mention.user.id)
    .addField("Account created at", `${mention.user.createdAt}`)
    .addField("Joined at", `${mention.joinedAt}`)
    message.channel.send(userlol)
    console.log(`USERINFO command from ${message.author.username} USER ID= ${message.author.id}`)
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

