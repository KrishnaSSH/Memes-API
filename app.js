app.get('/give/:subreddit?/:count?', async (req, res) => {
  let count = parseInt(req.params.count) || 1;
  let subreddit = req.params.subreddit;

  // Check if the subreddit is a valid number (between 1 and 100)
  if (!isNaN(subreddit) && subreddit >= 1 && subreddit <= 100) {
    count = subreddit; // If it's a number, set count to subreddit
    subreddit = 'memes'; // Default subreddit
  }

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
