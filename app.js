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
    'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
  },
});

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

app.use(compression());
app.use(morgan('tiny'));

app.use(express.static('public', {
  maxAge: '1d', // Set caching for 1 day
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
  let subreddit = req.params.subreddit;

  const defaultSubreddits = ['memes', 'meme', 'dankmemes', 'cleanmemes'];

  // Validate count
  if (count < 1 || count > 100) {
    return res.status(400).json({ error: 'Count must be between 1 and 100.' });
  }

  // If no specific subreddit is provided, select from the default list randomly
  if (!subreddit) {
    subreddit = defaultSubreddits[Math.floor(Math.random() * defaultSubreddits.length)];
  } else if (!isNaN(subreddit) && subreddit >= 1 && subreddit <= 100) {
    count = subreddit;
    subreddit = defaultSubreddits[Math.floor(Math.random() * defaultSubreddits.length)];
  }

  let memes = []; // Initialize memes array to store fetched memes
  let after = null;

  // Loop to fetch memes until we reach the requested count
  while (memes.length < count) {
    try {
      for (let i = 0; i < defaultSubreddits.length && memes.length < count; i++) {
        const selectedSubreddit = defaultSubreddits[i];

        const response = await axiosInstance.get(`https://www.reddit.com/r/${selectedSubreddit}/hot.json`, {
          params: {
            limit: Math.min(count - memes.length, 100), // Fetch only remaining memes
            after: after,
          }
        });

        const posts = response.data.data.children;
        const newMemes = posts.filter(post => post.data.url && /\.(jpg|jpeg|png|gif)$/.test(post.data.url));

        if (newMemes.length === 0) {
          break; // Stop if no more valid memes
        }

        memes = memes.concat(newMemes); // Add new memes to the array
        after = response.data.data.after;

        if (!after) {
          break; // Stop if there's no more data
        }
      }
    } catch (error) {
      console.error(`Error fetching memes:`, error);
      return res.status(500).json({ error: 'Failed to fetch memes' });
    }
  }

  // Cache the memes for future requests
  cache.set('memes', memes);

  // Return the requested number of memes
  const selectedMemes = getMemesExactly(memes, Math.min(count, memes.length));
  return res.json({ count: selectedMemes.length, memes: selectedMemes.map(formatMemeResponse) });
});

// Function to format the meme response
const formatMemeResponse = (post) => {
  const data = post.data; // Accessing the correct data
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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
