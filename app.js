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
  // Shuffle memes to ensure randomness and select the requested count
  const shuffled = memes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Routes

// Homepage Route (renders index.ejs)
app.get('/', (req, res) => {
  res.render('index');
});

// Docs Route (renders docs.ejs)
app.get('/docs', (req, res) => {
  res.render('docs');
});

app.get('/give/:count?', async (req, res) => {
  let count = parseInt(req.params.count) || 1; // Default to 1 if no count specified
  if (count < 1 || count > 100) {
    return res.status(400).json({ error: 'Count must be between 1 and 100.' });
  }

  // Check cache first
  const cachedMemes = cache.get('memes');
  if (cachedMemes) {
    const selectedMemes = getMemesExactly(cachedMemes, count);
    return res.json({ count: selectedMemes.length, memes: selectedMemes.map(formatMemeResponse) });
  }

  let memes = [];
  let after = null; // Variable to hold the after parameter for pagination

  // Keep fetching until we reach the desired count
  while (memes.length < count) {
    try {
      const response = await axiosInstance.get('hot.json', {
        params: {
          limit: 100,
          after: after // Use the after parameter for pagination
        }
      });

      const posts = response.data.data.children;
      const newMemes = posts.filter(post => post.data.url && /\.(jpg|jpeg|png|gif)$/.test(post.data.url));

      // Log the total fetched posts and the count of valid memes
      console.log('Total Fetched Posts:', posts.length);
      console.log('Valid Memes After Filtering:', newMemes.length);

      if (newMemes.length === 0) {
        break; // Exit the loop if no more valid memes are found
      }

      memes = memes.concat(newMemes); // Add new memes to the array

      // Update after parameter for the next request
      after = response.data.data.after;

    } catch (error) {
      console.error('Error fetching memes:', error);
      return res.status(500).json({ error: 'Failed to fetch memes' });
    }

    // Prevent infinite loops by breaking after a reasonable number of attempts (optional)
    if (after === null || memes.length >= 1000) {
      break; // Exit if there are no more posts to fetch or if we've reached 1000 memes
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
    // Removed the preview field
  };
};

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
