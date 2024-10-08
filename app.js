const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const NodeCache = require('node-cache');

dotenv.config();

const axiosInstance = axios.create({
  baseURL: 'https://www.reddit.com/r/memes/',
  headers: {
    'User-Agent': process.env.REDDIT_USER_AGENT,
    'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`
  },
});

const cache = new NodeCache({ stdTTL: 600 });
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use(compression());
app.use(morgan('tiny'));
app.use(express.static('public', {
  maxAge: '1d',
}));

const getMemesExactly = (memes, count) => {
  const shuffled = memes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/docs', (req, res) => {
  res.render('docs');
});

app.get('/give/:subreddit?/:count?', async (req, res) => {
  let count = parseInt(req.params.count) || 1;
  let subreddit = req.params.subreddit || 'memes';

  if (count < 1 || count > 100) {
    return res.status(400).json({ error: 'Count must be between 1 and 100.' });
  }

  let memes = [];
  let after = null;

  while (memes.length < count) {
    try {
      const response = await axiosInstance.get(`https://www.reddit.com/r/${subreddit}/hot.json`, {
        params: {
          limit: Math.min(count - memes.length, 100),
          after: after
        }
      });

      const posts = response.data.data.children;
      const newMemes = posts.filter(post => post.data.url && /\.(jpg|jpeg|png|gif)$/.test(post.data.url));

      if (newMemes.length === 0) {
        break;
      }

      memes = memes.concat(newMemes);
      after = response.data.data.after;

      if (!after) {
        break;
      }
    } catch (error) {
      console.error(`Error fetching memes from subreddit ${subreddit}:`, error);
      return res.status(500).json({ error: `Failed to fetch memes from r/${subreddit}` });
    }
  }

  cache.set('memes', memes);
  const selectedMemes = getMemesExactly(memes, Math.min(count, memes.length));
  return res.json({ count: selectedMemes.length, memes: selectedMemes.map(formatMemeResponse) });
});

const formatMemeResponse = (post) => {
  const data = post.data;
  return {
    postLink: `https://redd.it/${data.id}`,
    subreddit: data.subreddit,
    title: data.title,
    url: data.url,
    nsfw: data.over_18,
    spoiler: data.spoiler,
    author: data.author,
    ups: data.ups,
  };
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
