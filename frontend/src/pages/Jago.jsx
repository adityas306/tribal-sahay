import { useState } from "react";

import API from "../api/api";

function Jago() {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Namaste! I am JAGO. You can ask me about scholarships, documents, eligibility, applications, payments, or any related problem. I will try to understand your problem and provide a practical solution.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    // Prevent sending empty messages or multiple requests while loading
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    /*
      Convert the existing conversation into the format
      expected by the backend AI service.
    */
    const history = messages.map((message) => ({
      role:
        message.role === "user"
          ? "user"
          : "model",
      text: message.text,
    }));

    // Immediately display the user's message in the chat
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    // Clear the input field
    setQuestion("");

    // Show the loading state while JAGO processes the request
    setLoading(true);

    try {
      /*
        Send the current question along with the previous
        conversation history to the backend.
      */
      const response = await API.post(
        "/api/chat",
        {
          message: userQuestion,

          // Send previous messages so the AI can understand context
          history: history,
        }
      );

      /*
        Read the AI response from the backend.
        The fallback message is used if no response is returned.
      */
      const reply =
        response.data?.reply ||
        response.data?.answer ||
        "JAGO could not generate a solution right now.";

      // Add JAGO's response to the conversation
      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text: reply,
        },
      ]);
    } catch (error) {
      // Log the error for debugging purposes
      console.error(
        "JAGO ERROR:",
        error
      );

      let errorMessage =
        "JAGO could not connect to the server. Please try again later.";

      /*
        If the backend provides a specific error message,
        display that message to the user.
      */
      if (error.response?.data?.detail) {
        errorMessage =
          error.response.data.detail;
      }

      // Display the error message in the chat
      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      // Stop the loading state after the request is completed
      setLoading(false);
    }
  };

  return (
    <div className="page">

      <div className="pageTitle">

        <span className="eyebrow">
          JAGO AI
        </span>

        <h1>
          Your AI Problem Solver
        </h1>

        <p>
          Describe your problem. JAGO will understand it,
          analyze the available information, and suggest
          practical next steps.
        </p>

      </div>

      <div className="chat">

        <div className="chatMsgs">

          {messages.map(
            (message, index) => (
              <div
                key={index}
                className={message.role}
              >
                {message.text}
              </div>
            )
          )}

          {/* Display a temporary message while JAGO is processing */}
          {loading && (
            <div className="bot">
              JAGO is analyzing your problem...
            </div>
          )}

        </div>

        <form
          onSubmit={sendMessage}
        >
          <input
            type="text"
            placeholder="Describe your problem here..."
            value={question}
            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }
            disabled={loading}
          />

          <button
            type="submit"
            className="btn"
            disabled={
              loading ||
              !question.trim()
            }
          >
            {loading
              ? "Thinking..."
              : "Send"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Jago;