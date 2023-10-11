const fs = require("fs");
const login = require("fb-chat-api");
const moment = require("moment");

const loginCred = {
  appState: JSON.parse(fs.readFileSync("session.json", "utf-8")),
};

function sendMessageToThread(api, threadID, message) {
  // Simulate typing
  api.sendTypingIndicator(threadID, (err) => {
    if (err) return console.error(err);

    // Wait for a few seconds to simulate typing
    setTimeout(() => {
      api.sendMessage(message, threadID, (err, messageInfo) => {
        if (err) return console.error(err);

        console.log(
          `Message sent to thread ${threadID}. Message ID: ${messageInfo.messageID}`
        );

        // If there are more messages in the queue, send the next one
        if (messagesQueue.length > 0) {
          const nextMessage = messagesQueue.shift();
          sendMessageToThread(api, threadID, nextMessage);
        } else {
          // All messages have been sent, now read and send the content of message.txt
          const lastMessage = fs.readFileSync("message.txt", "utf-8");
          api.sendMessage(lastMessage, threadID, (err, messageInfo) => {
            if (err) return console.error(err);

            console.log(
              `Message sent to thread ${threadID}. Message ID: ${messageInfo.messageID}`
            );
            process.exit(); // Exit the program after sending all messages
          });
        }
      });
    }, 3000); // Wait for 3 seconds (3000 milliseconds) before sending the message
  });
}

function scheduleMessage(desiredTime, messages) {
  const formattedTime = moment(desiredTime, "hh:mm a");
  const timeDiff = formattedTime.diff(moment());

  setTimeout(() => {
    login(loginCred, (err, api) => {
      if (err) {
        console.error("login cred error", err);
        return;
      }

      const threadID = "100077094964729";

      // Use a queue to send messages in order
      messagesQueue = [...messages]; // Copy the array to avoid modifying the original

      // Start sending messages
      const firstMessage = messagesQueue.shift();
      sendMessageToThread(api, threadID, firstMessage);
    });
  }, timeDiff);
}

// Example usage: Schedule messages for 7:30 PM
const messages = ["Message 1", "Message 2", "Message 3"];

scheduleMessage("1:22 PM", messages);
