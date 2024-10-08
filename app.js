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
