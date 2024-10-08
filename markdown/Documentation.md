# Supported Endpoints

#  [/give](https://memesapi.vercel.app/)

Send a GET request to  [/give](https://memesapi.vercel.app/)
### Example Response
```json
{
"count": 1,
"memes": [
{
"postLink": "https://redd.it/1fyn3wk",
"subreddit": "memes",
"title": "Did you know as an actor, your job makes sure you can act??\n",
"url": "https://i.redd.it/zmj5os5qfftd1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "lorelaidoordie",
"ups": 29
}
]
}
```

#  [/give/{count}](https://memesapi.vercel.app/) (MAX 100)

Send a GET request to  [/give/{count}](https://memesapi.vercel.app/) 

## Example Response

```json
{
"count": 3,
"memes": [
{
"postLink": "https://redd.it/1fxzqzl",
"subreddit": "memes",
"title": "why does this always happen (by me)",
"url": "https://i.redd.it/jsc19k7sk9td1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "JKowlpine7",
"ups": 2728
},
{
"postLink": "https://redd.it/1fygosn",
"subreddit": "memes",
"title": "idk just randomly thought of this",
"url": "https://i.redd.it/cc12k3ie1etd1.jpeg",
"nsfw": false,
"spoiler": false,
"author": "JKowlpine7",
"ups": 184
},
{
"postLink": "https://redd.it/1fxycul",
"subreddit": "memes",
"title": "6am to 3pm is awful ",
"url": "https://i.redd.it/p3bga5or59td1.gif",
"nsfw": false,
"spoiler": false,
"author": "Jacobelemauve",
"ups": 5079
}
]
}
```