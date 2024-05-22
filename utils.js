const fs = require("fs");
const path = require("path");

const createNestedDir = (folderPath) => {
  // Split the folder path by '/'
  const folders = folderPath.split("/");

  // Initialize current directory
  let currentDir = ".";

  // Iterate through each folder
  for (const folder of folders) {
    // Update the current directory path
    currentDir = path.join(currentDir, folder);

    // Check if the folder exists
    if (!fs.existsSync(currentDir)) {
      // If not, create the folder
      fs.mkdirSync(currentDir);
      console.log(`Created folder: ${currentDir}`);
    }
  }
};

module.exports = {
  createNestedDir,
};
