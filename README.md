# Chess-3d
A small chess game in created in `three.js`. It uses `webpack` as a bundling tool. The game has a simple AI system based on the minimax algorithm with
alpha beta pruning. In order to not the main thread (and do not block entire application) the AI is instantiated on a `webworker` instance.

## Deployed version
#### Important!
If you are encountering performance issues make sure you have **hardware acceleration** switched on. It will allow the browser to use GPU for rendering which will improve performance significantly. 

The guides for different browsers are available here:
[Chrome](https://help.clickup.com/hc/en-us/articles/6327835447191-Enable-hardware-acceleration-in-Google-Chrome) | [Firefox](https://support.mozilla.org/en-US/kb/performance-settings) | [Opera](https://windowsreport.com/opera-browser-hardware-acceleration/)

Game available on: https://chess-game-3d.herokuapp.com/

## Useful commands

```
// run the application on development mode
npm run start:dev

// build application for development
npm run build:dev

// build application for production
npm run build:prod

// run the application in production mode
npm run start
```
