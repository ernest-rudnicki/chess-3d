# Chess-3D
A small chess game in created in `three.js`. It uses `webpack` as a bundling tool. All the 3D models were created by me in Blender. The game has a simple AI system based on the minimax algorithm with
alpha beta pruning. In order to not block the main thread (and do not freeze entire application) the AI is instantiated on a `webworker` instance.

![Chess 3D](https://user-images.githubusercontent.com/37155981/189495404-d5f2da23-fa9c-49eb-8980-7d8dd977f332.gif)

## Deployed version
#### Important!
If you are encountering performance issues make sure you have **hardware acceleration** switched on. It will allow the browser to use GPU for rendering which will improve performance significantly. 

The guides for different browsers are available here:
[Chrome](https://help.clickup.com/hc/en-us/articles/6327835447191-Enable-hardware-acceleration-in-Google-Chrome) | [Firefox](https://support.mozilla.org/en-US/kb/performance-settings) | [Opera](https://windowsreport.com/opera-browser-hardware-acceleration/)

Game available on: https://chess-3d-mja9.vercel.app/

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
