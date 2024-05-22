const { spawn } = require("child_process");
// Define the command to execute
const exportIntuneConfigCMDPath = `./ps-scripts/intune_export_creds.ps1`;
// Function to handle streaming data
function streamIntuneCMDData(ws, res, pathName, fileName) {
  // Execute MS365DSC command and stream output
  const ms365dsc = spawn("./pshell/powershell.exe", [
    "-File",
    exportIntuneConfigCMDPath,
    pathName,
    fileName,
  ]); // 'pwsh' is the command for PowerShell on Ubuntu
  // Stream stdout to the client
  ms365dsc.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
    ws.send(data.toString()); // Send output to the client
    res.write(data.toString()); // Write output to the response stream
  });

  // Stream stderr to the client
  ms365dsc.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
    ws.send(`Error: ${data}`); // Send error to the client
    res.write(`Error: ${data}`); // Write error to the response stream
  });

  // Close the response stream when the process exits
  ms365dsc.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    ws.close(); // Close WebSocket connection when script execution completes
    res.end(); // End the response stream
  });

  // Handle errors
  ms365dsc.on("error", (err) => {
    console.error("Failed to start command:", err);
    res.write(`Error: Failed to start command: ${err}`);
    ws.close(); // Close WebSocket connection on error
    res.end(); // End the response stream
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    ms365dsc.kill(); // Terminate MS365DSC process when WebSocket connection is closed
  });
}
module.exports = streamIntuneCMDData;
