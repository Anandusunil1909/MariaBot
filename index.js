require('dotenv/config');
const { default: axios } = require('axios');
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const URL = process.env.API_URL
let source_url;
let id;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  //if (message.content.startsWith('!')) return;
  //function calling
  if (message.content.startsWith("!")) {
    // source_url = null
    await postTextData()
    if (!source_url) {
      return;
    }
    id = null
    await postVideoData();

    setTimeout(function () {
      getVideoData()
    }, 5000);


  }
  //tts api call
  async function postTextData() {
    const inputText = message.content
    const data = {
      text: inputText,
      author: "bot-anandu"
    }
    await axios.post("http://3.111.82.58:8080/text", data).then((res) => {
      console.log(res.data)
      source_url = res.data["src"]//output data as wav file

    }).catch(err => {
      console.log(err)
    })
  }

  //D-id api call

  async function getVideoData() {
    await axios.get(`https://api.d-id.com/talks/${id}`, {
      headers: {
        'Authorization': 'Basic YW5hbmR1c3VuaWxrdW1hcjIwMjNAY3MuYWpjZS5pbg:RLCZcKhgyevbg0lOKGCm7'
      }
    }
    ).then(response => {
      output = response.data
      console.log(output);
      console.log(response.data.result_url)
      if (!response.data.result_url) {
        console.log("RESPONSE URL NULL")
        return;
      }
      console.log("Got response")
      // const videoUrl ='https://d-id-talks-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C108544693372677068629/tlk_x1yrbvOB_AJbciRqgvaLf/1683525176611.mp4?AWSAccessKeyId=AKIA5CUMPJBIK65W6FGA&Expires=1683611645&Signature=ScC0owPHbC%2BQYlBpCBUvpYY8RXg%3D&X-Amzn-Trace-Id=Root%3D1-64588e7d-3b7307c142881133661e463d%3BParent%3D6b7e8674008ae007%3BSampled%3D1%3BLineage%3D6b931dd4%3A0';
      //video embed in the discord
      const embed = new EmbedBuilder()
        .setTitle('My Video Preview')
        .setDescription('Check out this cool video!')
        //.setImage(`https://img.youtube.com/vi/${videoUrl.split('https://youtu.be/')[1]}/maxresdefault.jpg`)
        .setURL(response.data.result_url);
      message.channel.send({ embeds: [embed] });

    })
      .catch(error => {
        console.log(error);
      });

  }

  async function postVideoData() {
    console.log(source_url)

    let body = {
      "source_url": "https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg",
      "script": {
        "type": "audio",
        "audio_url": source_url,//input wav file
      }
    };

    await axios.post("https://api.d-id.com/talks", body,
      {
        headers: {
          'Authorization': 'Basic YW5hbmR1c3VuaWxrdW1hcjIwMjNAY3MuYWpjZS5pbg:RLCZcKhgyevbg0lOKGCm7'
        }
      },
    ).then(response => {
      console.log(response)
      id = response.data["id"]
      console.log(id)

    }).catch(error => {
      console.log(error);
    })


  }

});

client.login(process.env.TOKEN);

//   let conversationLog = [{ role: 'system', content: 'You are a friendly chatbot.' }];

//   try {
//     await message.channel.sendTyping();

//     let prevMessages = await message.channel.messages.fetch({ limit: 15 });
//     prevMessages.reverse();

//     prevMessages.forEach((msg) => {
//       if (message.content.startsWith('!')) return;
//       if (msg.author.id !== client.user.id && message.author.bot) return;
//       if (msg.author.id !== message.author.id) return;

//       conversationLog.push({
//         role: 'user',
//         content: msg.content,
//       });
//     });

//     const result = await openai
//       .createChatCompletion({
//         model: 'gpt-3.5-turbo',
//         messages: conversationLog,
//         // max_tokens: 256, // limit token usage
//       })
//       .catch((error) => {
//         console.log(`OPENAI ERR: ${error}`);
//       });

//     message.reply(result.data.choices[0].message);
//   } catch (error) {
//     console.log(`ERR: ${error}`);
//   }
