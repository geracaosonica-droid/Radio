const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const MUSIC_DIR = path.join(__dirname, 'music');
if (!fs.existsSync(MUSIC_DIR)) fs.mkdirSync(MUSIC_DIR);

async function fetchInstagramMedia(token, igUserId) {
  const url = `https://graph.facebook.com/v18.0/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${token}`;
  const response = await axios.get(url);
  return response.data.data || [];
}

async function checkLiveStatus(token, igUserId) {
  const url = `https://graph.facebook.com/v18.0/${igUserId}/live_media?fields=id,status,media_url,permalink&access_token=${token}`;
  try {
    const response = await axios.get(url);
    const liveData = response.data.data;
    if (liveData && liveData.length > 0 && liveData[0].status === 'LIVE') {
      return { isLive: true, videoUrl: liveData[0].media_url, permalink: liveData[0].permalink };
    }
  } catch (e) { console.error(e.message); }
  return { isLive: false };
}

async function downloadAndExtractAudio(videoUrl, outputPath) {
  const tempVideo = path.join(__dirname, 'temp_video.mp4');
  const response = await axios.get(videoUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream(tempVideo);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
  return new Promise((resolve, reject) => {
    ffmpeg(tempVideo).noVideo().audioCodec('libmp3lame').audioQuality(2).save(outputPath)
      .on('end', () => { fs.unlink(tempVideo, () => {}); resolve(); })
      .on('error', (err) => { fs.unlink(tempVideo, () => {}); reject(err); });
  });
}

module.exports = { fetchInstagramMedia, checkLiveStatus, downloadAndExtractAudio, MUSIC_DIR };