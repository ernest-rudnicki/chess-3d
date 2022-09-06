const express = require("express");
const PORT = 3000;

const app = express()
app.use(express.static("dist"));
  
app.listen(PORT, () => {
  console.log("server started listening on port " + PORT)
});