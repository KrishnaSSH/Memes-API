
## Supported Endpoints (GET Request)

### - `/give`
Retrieve one meme from r/memes

### - `/give/{count}`
Retrieve a specified number of memes from r/memes. Integer must be between 1 - 100

### - `/give/{subreddit}`
Retrieve a random meme from the given subreddit.

### - `/give/{subreddit}/{count}`
Retrieve a specified number of memes  from the given subreddit.  Integer must be between 1 - 100


## [URL for the Enpoints](https://memesapi.vercel.app/) 



## Example Response 
### - `/give`
Retrieve one meme from r/memes
```json
{
"count": 1,
"memes": [
{
"postLink": "https://redd.it/1fynxnn",
"subreddit": "memes",
"title": "Guess the game….",
"url": "https://i.redd.it/0p3d88a3nftd1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "Holiday_Box9404",
"ups": 12519
}
]
}
```

### - `/give/{count}`
Retrieve a specified number of memes from r/memes. Integer must be between 1 - 100

```json
{
"count": 2,
"memes": [
{
"postLink": "https://redd.it/1fyqlf1",
"subreddit": "memes",
"title": "They pronounce words with letters that aren't even there ",
"url": "https://i.redd.it/utixv6nqbgtd1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "Next_Airport_7230",
"ups": 4438
},
{
"postLink": "https://redd.it/1fynxnn",
"subreddit": "memes",
"title": "Guess the game….",
"url": "https://i.redd.it/0p3d88a3nftd1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "Holiday_Box9404",
"ups": 12561
}
]
}
```

### - `/give/{subreddit}`
Retrieve a random meme from the given subreddit.

```json
{
"count": 1,
"memes": [
{
"postLink": "https://redd.it/1fysqs3",
"subreddit": "ProgrammerHumor",
"title": "whenDeploymentWasAFloppyDisk",
"url": "https://i.redd.it/7ykxfftnzgtd1.png",
"nsfw": false,
"spoiler": false,
"author": "derjanni",
"ups": 2628
}
]
}
```


### - `/give/{subreddit}/{count}`
Retrieve a specified number of memes  from the given subreddit.  Integer must be between 1 - 100


```json
{
"count": 2,
"memes": [
{
"postLink": "https://redd.it/1fysqs3",
"subreddit": "ProgrammerHumor",
"title": "whenDeploymentWasAFloppyDisk",
"url": "https://i.redd.it/7ykxfftnzgtd1.png",
"nsfw": false,
"spoiler": false,
"author": "derjanni",
"ups": 2632
},
{
"postLink": "https://redd.it/1fyvuu2",
"subreddit": "ProgrammerHumor",
"title": "notStressfulAtAll",
"url": "https://i.redd.it/re4ed02y5itd1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "skeletium",
"ups": 1167
}
]
}
```
