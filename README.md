# Trivia.io

![alt](https://cdn.discordapp.com/attachments/1005211638191890532/1152556081986420857/header.png)

### Version 9.16.23 - Edit Sentences

A Multiplayer IO Game for family and Coach Play

_the host must be a computer, while the client can be either a phone or a pc_

## The Game

The Game is all about answering. The game includes normal questions that i gathered with Chat-GPT, heres the game flow:

-   The Host Ask a Question
-   The Client Give an Answer
-   The Host reveals all Answers
-   The Client pick the best Answer
-   The Host reveals how was the pickiest Answer
-   The Host Send Coins that calculates in this formula: a
    1. Each Answer get a score, that represent the number of the clients who picked it.
    2. Each score is multiplied by 100
    3. Then The host Adds the score to the Player Coins stat.
    4. Then The host send it to the player.

## How to run the project

theres `src/config.ts` file that is hidden (inside .gitignore file), that his structure is:

```ts
export default {
	CODE_PREFIX: <string> // required,
	PEER_SERVER_HOST: <string?>, // optional
	PEER_SERVER_PORT: <number?>, // optional, default 443
	PEER_SECURE: <boolean?>, // optional, default false
	PEER_DEBUG_LEVEL: <number?>, // optional, default 0
};
```

## Dependencies:

1. React.js
2. Peer.js
3. Typescript

## Credits:

loading gifs - https://loading.io/
