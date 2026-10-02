import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    // Chat history
    const history = messages.slice(-6).map((message) => ({
      role:
        message.role === "user"
          ? "user"
          : "assistant",
      text: message.text,
    }));

    // Add user message + empty bot message
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userQuestion,
      },
      {
        role: "bot",
        text: "",
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("ts_token");

      const baseURL =
        API.defaults.baseURL || "https://tribal-sahay.onrender.com";
      const response = await fetch(
        `${baseURL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            message: userQuestion,
            history: history,
          }),
        }
      );

      if (!response.ok) {
        let detail = "JAGO server error.";

        try {
          const data = await response.json();

          detail =
            data?.detail || detail;
        } catch {
          // Keep default error
        }

        throw new Error(detail);
      }

      if (!response.body) {
        throw new Error(
          "Streaming response is not available."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let buffer = "";
      let botReply = "";

      const updateBotMessage = (text) => {
        setMessages((previous) => {
          const updated = [...previous];

          const lastIndex =
            updated.length - 1;

          if (
            updated[lastIndex]?.role === "bot"
          ) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: text,
            };
          }

          return updated;
        });
      };

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) break;

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const events =
          buffer.split("\n\n");

        buffer =
          events.pop() || "";

        for (const eventText of events) {
          const lines =
            eventText.split("\n");

          for (const line of lines) {
            if (
              !line.startsWith("data: ")
            ) {
              continue;
            }

            const rawData =
              line.slice(6);

            if (
              rawData === "[DONE]"
            ) {
              continue;
            }

            let chunk = rawData;

            // JSON response support
            try {
              chunk =
                JSON.parse(rawData);
            } catch {
              // Plain text support
            }

            if (
              typeof chunk !== "string"
            ) {
              continue;
            }

            botReply += chunk;

            updateBotMessage(
              botReply
            );
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const lines =
          buffer.split("\n");

        for (const line of lines) {
          if (
            !line.startsWith("data: ")
          ) {
            continue;
          }

          const rawData =
            line.slice(6);

          if (
            rawData === "[DONE]"
          ) {
            continue;
          }

          let chunk = rawData;

          try {
            chunk =
              JSON.parse(rawData);
          } catch {
            // Plain text support
          }

          if (
            typeof chunk === "string"
          ) {
            botReply += chunk;

            updateBotMessage(
              botReply
            );
          }
        }
      }

      if (!botReply.trim()) {
        updateBotMessage(
          "JAGO response generate nahi kar paaya. Please try again."
        );
      }

    } catch (error) {
      console.error(
        "JAGO ERROR:",
        error
      );

      setMessages((previous) => {
        const updated = [...previous];

        const lastIndex =
          updated.length - 1;

        if (
          updated[lastIndex]?.role === "bot"
        ) {
          updated[lastIndex] = {
            ...updated[lastIndex],

            text:
              error?.message ||
              "JAGO could not connect to the server. Please try again later.",
          };
        }

        return updated;
      });

    } finally {
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
          Describe your problem. JAGO
          will understand it, analyze
          the available information,
          and suggest practical next
          steps.
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

                {message.text && (
                  <ReactMarkdown
                    remarkPlugins={[
                      remarkGfm,
                    ]}
                  >
                    {message.text}
                  </ReactMarkdown>
                )}

                {loading &&
                  index ===
                    messages.length - 1 &&
                  message.role === "bot" &&
                  !message.text && (
                    <span className="jagoTyping">
                      ● ● ●
                    </span>
                  )}

              </div>

            )
          )}

        </div>

        <form onSubmit={sendMessage}>

          <input
            type="text"
            placeholder="Describe your problem here..."
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
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
              ? "Generating..."
              : "Send"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Jago;