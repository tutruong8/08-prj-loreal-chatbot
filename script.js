/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestionCard = document.getElementById("latestQuestionCard");
const latestQuestionText = document.getElementById("latestQuestion");

// Replace this URL with your deployed Cloudflare Worker URL
const workerUrl = "https://lorealbot.travistu8.workers.dev/";

function appendMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${sender}`;
  messageDiv.textContent = text;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showWelcomeMessage() {
  chatWindow.innerHTML = "";
  appendMessage(
    "Bonjour! I am your L'Oréal Beauty Advisor. Ask me about products, routines, or skincare recommendations.",
    "assistant",
  );
}

showWelcomeMessage();

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();
  if (!question) return;

  // Reset the conversation display for each new question
  chatWindow.innerHTML = "";
  latestQuestionCard.classList.remove("hidden");
  latestQuestionText.textContent = question;

  appendMessage(question, "user");
  userInput.value = "";

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "chat-message assistant";
  loadingMessage.textContent = "Typing...";
  chatWindow.appendChild(loadingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a L'Oréal assistant that provides only information and only answers questions about L'Oréal products, services, and routines.",
          },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get a reply from the bot.";

    loadingMessage.remove();
    appendMessage(reply, "assistant");
  } catch (error) {
    loadingMessage.remove();
    appendMessage(
      "There was an error connecting to the chatbot. Please try again.",
      "assistant",
    );
    console.error("Chatbot request failed", error);
  }
});
