const outputDiv = document.getElementById("output");
const socket = new WebSocket("ws://localhost:3000");
const downloadButton = document.querySelector(
  ".button-container button:nth-child(1)"
); // Assuming the first button is the Download button

// Disable the download button initially
downloadButton.disabled = true;

socket.onopen = () => {
  console.log("WebSocket connection opened");
};

socket.onmessage = (event) => {
  console.log("Message received:", event.data);
  outputDiv.textContent += event.data;
  outputDiv.scrollTop = outputDiv.scrollHeight;
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
  // Enable the download button when the WebSocket connection is closed
  downloadButton.disabled = false;
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Add event listener to download button
downloadButton.addEventListener("click", () => {
  if (!downloadButton.disabled) {
    window.location.href = "http://localhost:3000/download-intune-config";
  }
});
