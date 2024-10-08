app.get('/give/:count?', async (req, res) => {
  let count = parseInt(req.params.count) || 1;
  if (count < 1 || count > 100) {
    return res.status(400).json({ error: 'Count must be between 1 and 100.' });
  }

  let memes = [];
  let after = null;

  while (memes.length < count) {
    try {
      const response = await axiosInstance.get('hot.json', {
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
      console.error('Error fetching memes:', error);
      return res.status(500).json({ error: 'Failed to fetch memes' });
    }
  }

  cache.set('memes', memes);
  const selectedMemes = getMemesExactly(memes, Math.min(count, memes.length));
  return res.json({ count: selectedMemes.length, memes: selectedMemes.map(formatMemeResponse) });
});
