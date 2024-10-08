const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const NodeCache = require('node-cache');

// Load environment variables from .env file
dotenv.config();

// Create an Axios instance with defaults
const axiosInstance = axios.create({
  baseURL: 'https://www.reddit.com/r/memes/',
  headers: {
    'User-Agent': process.env.REDDIT_USER_AGENT,
    'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`
  },
});

// Initialize cache (cache time in seconds)
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Initialize Express
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Enable Gzip compression
app.use(compression());

// Logging middleware for better performance tracking
app.use(morgan('tiny'));

// Middleware to serve static files with caching headers
app.use(express.static('public', {
  maxAge: '1d', // Set caching for 1 day
}));

// Function to select exactly the requested number of memes
const getMemesExactly = (memes, count) => {
  const shuffled = memes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Homepage Route (renders index.ejs)
app.get('/', (req, res) => {
  res.render('index');
});

// Docs Route (renders docs.ejs)
app.get('/docs', (req, res) => {
  res.render('docs');
});

// Endpoint to fetch memes from a specific subreddit or default subreddit
app.get('/give/:subreddit?/:count?', async (req, res) => {
  let count = parseInt(req.params.count) || 1;
  let subreddit = req.params.subreddit;

  if (!isNaN(subreddit) && subreddit >= 1 && subreddit <= 100) {
    count = subreddit;
    subreddit = 'memes'; // Set to default subreddit
  } else if (!subreddit) {
    subreddit = 'memes'; // Default subreddit if none is provided
  }

  if (count < 1 || count > 100) {
    return res.status(400).json({ error: 'Count must be between 1 and 100.' });
  }

  let memes = [];
  let after = null;

  // Loop to fetch memes until we reach the requested count
  while (memes.length < count) {
    try {
      const response = await axiosInstance.get(`https://www.reddit.com/r/${subreddit}/hot.json`, {
        params: {
          limit: Math.min(count - memes.length, 100), // Limit to fetch only the remaining required memes
          after: after
        }
      });

      const posts = response.data.data.children;
      const newMemes = posts.filter(post => post.data.url && /\.(jpg|jpeg|png|gif)$/.test(post.data.url));

      if (newMemes.length === 0) {
        break; // Exit if no more valid memes are found
      }

      memes = memes.concat(newMemes);
      after = response.data.data.after;

      if (!after) {
        break; // Exit if there's no more data to fetch
      }
    } catch (error) {
      console.error(`Error fetching memes from subreddit ${subreddit}:`, error);
      return res.status(500).json({ error: `Failed to fetch memes from r/${subreddit}` });
    }
  }

  // Cache the memes for future requests
  cache.set('memes', memes);

  // Ensure we return exactly the requested number of memes, or fewer if not available
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
