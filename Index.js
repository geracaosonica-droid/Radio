const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk');
const { fetchInstagramMedia, checkLiveStatus, downloadAndExtractAudio, MUSIC_DIR } = require('./instagram');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.INSTAGRAM_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const EXPO_ACCESS_TOKEN = process.env.EXPO_ACCESS_TOKEN;
let expo = new Expo({ accessToken: EXPO_ACCESS_TOKEN });
let pushTokens = [];

app.post('/register-push', (req, res) => {
  const { token } = req.body;
  if (token && !pushTokens.includes(token)) pushTokens.push(token);
  res.json({ success: true });
});

app.get('/radio/playlist.m3u', (req, res) => {
  const files = fs.readdirSync(MUSIC_DIR).filter(f => f.endsWith('.mp3'));
  if (files.length === 0) return res.status(404).send('Nenhuma música ainda.');
  const host = req.get('host');
  let playlist = '#EXTM3U\n';
  files.forEach((file, i) => { playlist += `#EXTINF:-1,Música ${i+1}\nhttp://${host}/music/${file}\n`; });
  res.setHeader('Content-Type', 'audio/x-mpegurl');
  res.send(playlist);
});

app.get('/api/musics', (req, res) => {
  const files = fs.readdirSync(MUSIC_DIR).filter(f => f.endsWith('.mp3'));
  const host = req.get('host');
  res.json(files.map((f, i) => ({ id: f.replace('.mp3',''), title: `Música ${i+1}`, url: `http://${host}/music/${f}` })));
});

app.get('/api/live', async (req, res) => {
  if (!TOKEN || !IG_USER_ID) return res.json({ isLive: false });
  res.json(await checkLiveStatus(TOKEN, IG_USER_ID));
});

app.use('/music', express.static(MUSIC_DIR));
app.get('/', (req, res) => res.send('Geração Sônica no ar 🎧'));

async function syncAndMonitor() {
  if (!TOKEN || !IG_USER_ID) return;
  try {
    for (const m of await fetchInstagramMedia(TOKEN, IG_USER_ID)) {
      if (m.media_type === 'VIDEO' || m.media_type === 'REELS') {
        const d = path.join(MUSIC_DIR, `${m.id}.mp3`);
        if (!fs.existsSync(d)) { console.log(m.id); await downloadAndExtractAudio(m.media_url, d); }
      }
    }
  } catch(e){}
  try {
    if ((await checkLiveStatus(TOKEN, IG_USER_ID)).isLive && pushTokens.length) {
      let msgs = pushTokens.filter(t => Expo.isExpoPushToken(t)).map(t => ({ to: t, sound:'default', title:'🔴 Geração Sônica ao vivo!', body:'Toque para assistir.', data:{screen:'Live'} }));
      for (let c of expo.chunkPushNotifications(msgs)) try{await expo.sendPushNotificationsAsync(c)}catch(e){}
    }
  } catch(e){}
}

syncAndMonitor();
cron.schedule('*/30 * * * *', syncAndMonitor);
app.listen(PORT, () => console.log('Rodando'));