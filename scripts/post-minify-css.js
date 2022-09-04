const fs = require("fs");
const path = require("path");

const distPath = "../dist";

fs.unlinkSync(path.resolve(__dirname, distPath, "styles.css"));
fs.renameSync(
  path.resolve(__dirname, distPath, "styles.min.css"),
  path.resolve(__dirname, distPath, "styles.css")
);
