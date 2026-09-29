import { useState } from "react";

import API from "../api/api";

function Jago() {
  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        role: "bot",
        text:
          "Namaste! I am JAGO. Ask me about scholarships, eligibility, documents, application status or disbursement.",
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!question.trim()) return;

    const userQuestion =
      question.trim();

    setQuestion("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    setLoading(true);

    try {
      const response =
        await API.post(
          "/api/chat",
          {
            message: userQuestion,
          }
        );

      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text:
            response.data.reply ||
            response.data.answer ||
            "I could not find an answer.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "bot",
          text:
            "Please try again after checking your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      <div className="pageTitle">

        <span className="eyebrow">
          JAGO ASSISTANT
        </span>

        <h1>
          Your scholarship guide
        </h1>

        <p>
          Ask questions about scholarships,
          documents and application tracking.
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

          {loading && (
            <div className="bot">
              JAGO is typing...
            </div>
          )}

        </div>

        <form
          onSubmit={sendMessage}
        >
          <input
            placeholder="Ask: What is my application status?"
            value={question}
            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }
          />

          <button
            className="btn"
            disabled={loading}
          >
            Send
          </button>
        </form>

      </div>

    </div>
  );
}

export default Jago;