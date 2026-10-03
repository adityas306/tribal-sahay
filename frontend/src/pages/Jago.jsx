import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import API from "../api/api";
import "./Jago.css";

const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto Detect" },
  { value: "english", label: "English" },
  { value: "hindi", label: "हिंदी" },
  { value: "hinglish", label: "Hinglish" },
];

const INITIAL_MESSAGE = {
  role: "bot",
  text:
    "Namaste! I am JAGO. You can ask me about scholarships, documents, eligibility, applications, payments, or any related problem. I will try to understand your problem and provide a practical solution.",
};

function Jago() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    INITIAL_MESSAGE,
  ]);

  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] =
    useState([]);

  const [conversationId, setConversationId] =
    useState(null);

  const [language, setLanguage] =
    useState("auto");

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const baseURL =
    API.defaults.baseURL ||
    "https://tribal-sahay.onrender.com";

  // =====================================================
  // GET CURRENT TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("ts_token");
  };

  // =====================================================
  // LOAD ALL CHAT HISTORY
  // =====================================================

  const loadConversations = async () => {
    const token = getToken();

    if (!token) {
      setConversations([]);
      setHistoryLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${baseURL}/api/chat/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load chat history."
        );
      }

      const data = await response.json();

      setConversations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "HISTORY ERROR:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadConversations();
  }, []);

  // =====================================================
  // LOAD SINGLE CONVERSATION
  // =====================================================

  const loadConversation = async (id) => {
    if (loading) return;

    const token = getToken();

    if (!token) {
      return;
    }

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${baseURL}/api/chat/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load conversation."
        );
      }

      const data =
        await response.json();

      setConversationId(data.id);

      setLanguage(
        data.language || "auto"
      );

      const loadedMessages =
        Array.isArray(data.messages)
          ? data.messages.map(
              (message) => ({
                role:
                  message.role ===
                  "user"
                    ? "user"
                    : "bot",

                text:
                  message.text || "",
              })
            )
          : [];

      setMessages(
        loadedMessages.length
          ? loadedMessages
          : [INITIAL_MESSAGE]
      );

      setQuestion("");

    } catch (error) {
      console.error(
        "CONVERSATION ERROR:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const startNewChat = () => {
    if (loading) return;

    setConversationId(null);

    setLanguage("auto");

    setMessages([
      INITIAL_MESSAGE,
    ]);

    setQuestion("");
  };

  // =====================================================
  // DELETE CHAT
  // =====================================================

  const deleteConversation = async (id) => {
    if (loading) return;

    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) return;

    const token = getToken();

    if (!token) return;

    try {
      const response =
        await fetch(
          `${baseURL}/api/chat/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to delete conversation."
        );
      }

      // Immediately update UI
      setConversations(
        (previous) =>
          previous.filter(
            (chat) =>
              chat.id !== id
          )
      );

      // If currently opened chat was deleted
      if (conversationId === id) {
        setConversationId(null);

        setLanguage("auto");

        setMessages([
          INITIAL_MESSAGE,
        ]);

        setQuestion("");
      }

    } catch (error) {
      console.error(
        "DELETE CHAT ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete chat."
      );
    }
  };

  // =====================================================
  // RENAME CHAT
  // =====================================================

  const renameConversation = async (
    id,
    currentTitle
  ) => {
    if (loading) return;

    const newTitle =
      window.prompt(
        "Enter chat name:",
        currentTitle
      );

    if (!newTitle?.trim()) {
      return;
    }

    const token = getToken();

    if (!token) return;

    try {
      const response =
        await fetch(
          `${baseURL}/api/chat/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              title:
                newTitle.trim(),
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to rename chat."
        );
      }

      const data =
        await response.json();

      // Immediately update UI
      setConversations(
        (previous) =>
          previous.map(
            (chat) =>
              chat.id === id
                ? {
                    ...chat,
                    title:
                      data.title ||
                      newTitle.trim(),
                  }
                : chat
          )
      );

    } catch (error) {
      console.error(
        "RENAME ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to rename chat."
      );
    }
  };

  // =====================================================
  // COPY RESPONSE
  // =====================================================

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch (error) {
      console.error(
        "COPY ERROR:",
        error
      );
    }
  };

  // =====================================================
  // UPDATE LAST BOT MESSAGE
  // =====================================================

  const updateBotMessage = (text) => {
    setMessages(
      (previous) => {
        const updated =
          [...previous];

        const lastIndex =
          updated.length - 1;

        if (
          updated[lastIndex]
            ?.role === "bot"
        ) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            text,
          };
        }

        return updated;
      }
    );
  };

  // =====================================================
  // PROCESS SSE DATA
  // =====================================================

  const processSSEData = (
    rawData,
    state
  ) => {
    if (!rawData) return;

    if (rawData === "[DONE]") {
      return;
    }

    let parsedData = null;

    try {
      parsedData =
        JSON.parse(rawData);
    } catch {
      parsedData = null;
    }

    // =================================================
    // JSON EVENT
    // =================================================

    if (
      parsedData &&
      typeof parsedData ===
        "object"
    ) {
      // Conversation ID
      if (
        parsedData.type ===
          "conversation_id" &&
        parsedData.conversation_id
      ) {
        state.conversationId =
          parsedData.conversation_id;

        setConversationId(
          parsedData.conversation_id
        );

        return;
      }

      // Backend error
      if (
        parsedData.type ===
          "error"
      ) {
        throw new Error(
          parsedData.message ||
            "JAGO error."
        );
      }

      return;
    }

    // =================================================
    // NORMAL AI TEXT
    // =================================================

    let chunk = rawData;

    try {
      const decodedChunk =
        JSON.parse(rawData);

      if (
        typeof decodedChunk ===
        "string"
      ) {
        chunk =
          decodedChunk;
      }
    } catch {}

    state.botReply += chunk;

    updateBotMessage(
      state.botReply
    );
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async (event) => {
    event.preventDefault();

    if (
      !question.trim() ||
      loading
    ) {
      return;
    }

    const userQuestion =
      question.trim();

    const token = getToken();

    // =================================================
    // FRONTEND HISTORY
    // =================================================

    const history = messages
      .filter(
        (message, index) =>
          message.text &&
          index !== 0
      )
      .slice(-8)
      .map((message) => ({
        role:
          message.role === "user"
            ? "user"
            : "assistant",

        text:
          message.text,
      }));

    // =================================================
    // SHOW USER MESSAGE + EMPTY BOT MESSAGE
    // =================================================

    setMessages(
      (previous) => [
        ...previous,

        {
          role: "user",
          text: userQuestion,
        },

        {
          role: "bot",
          text: "",
        },
      ]
    );

    setQuestion("");
    setLoading(true);

    try {
      // =================================================
      // API REQUEST
      // =================================================

      const response =
        await fetch(
          `${baseURL}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              message:
                userQuestion,

              history,

              language,

              conversation_id:
                conversationId,
            }),
          }
        );

      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok) {
        let detail =
          "JAGO server error.";

        try {
          const data =
            await response.json();

          detail =
            data?.detail ||
            detail;
        } catch {}

        throw new Error(
          detail
        );
      }

      if (!response.body) {
        throw new Error(
          "Streaming response is not available."
        );
      }

      // =================================================
      // STREAM READER
      // =================================================

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder(
          "utf-8"
        );

      let buffer = "";

      const state = {
        botReply: "",
        conversationId:
          conversationId,
      };

      // =================================================
      // READ STREAM
      // =================================================

      while (true) {
        const {
          value,
          done,
        } =
          await reader.read();

        if (done) break;

        buffer +=
          decoder.decode(
            value,
            {
              stream: true,
            }
          );

        const events =
          buffer.split(
            "\n\n"
          );

        buffer =
          events.pop() || "";

        // =================================================
        // PROCESS SSE EVENTS
        // =================================================

        for (
          const eventText of events
        ) {
          const lines =
            eventText.split(
              "\n"
            );

          for (
            const line of lines
          ) {
            if (
              !line.startsWith(
                "data:"
              )
            ) {
              continue;
            }

            const rawData =
              line
                .slice(5)
                .trim();

            if (!rawData) {
              continue;
            }

            processSSEData(
              rawData,
              state
            );
          }
        }
      }

      // =================================================
      // PROCESS REMAINING BUFFER
      // =================================================

      if (buffer.trim()) {
        const lines =
          buffer.split(
            "\n"
          );

        for (
          const line of lines
        ) {
          if (
            !line.startsWith(
              "data:"
            )
          ) {
            continue;
          }

          const rawData =
            line
              .slice(5)
              .trim();

          if (!rawData) {
            continue;
          }

          processSSEData(
            rawData,
            state
          );
        }
      }

      // =================================================
      // KEEP CONVERSATION ID
      // =================================================

      if (
        state.conversationId
      ) {
        setConversationId(
          state.conversationId
        );
      }

      // =================================================
      // EMPTY RESPONSE
      // =================================================

      if (
        !state.botReply.trim()
      ) {
        updateBotMessage(
          "JAGO response generate nahi kar paaya. Please try again."
        );
      }

      // =================================================
      // REFRESH CHAT HISTORY
      // NO PAGE RELOAD REQUIRED
      // =================================================

      await loadConversations();

    } catch (error) {
      console.error(
        "JAGO ERROR:",
        error
      );

      // =================================================
      // SHOW ERROR
      // =================================================

      setMessages(
        (previous) => {
          const updated =
            [...previous];

          const lastIndex =
            updated.length - 1;

          if (
            updated[lastIndex]
              ?.role === "bot"
          ) {
            updated[lastIndex] = {
              ...updated[lastIndex],

              text:
                error?.message ||
                "JAGO could not connect to the server. Please try again later.",
            };
          }

          return updated;
        }
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="page">

      {/* PAGE TITLE */}

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

      {/* MAIN LAYOUT */}

      <div className="jagoLayout">

        {/* SIDEBAR */}

        <aside className="jagoSidebar">

          {/* NEW CHAT */}

          <button
            type="button"
            className="btn newChatBtn"
            onClick={
              startNewChat
            }
            disabled={loading}
          >
            + New Chat
          </button>

          {/* HISTORY TITLE */}

          <div className="jagoHistoryTitle">
            Chat History
          </div>

          {/* HISTORY */}

          <div className="jagoHistory">

            {historyLoading ? (

              <div className="jagoHistoryEmpty">
                Loading...
              </div>

            ) : conversations.length ===
              0 ? (

              <div className="jagoHistoryEmpty">
                No previous chats
              </div>

            ) : (

              conversations.map(
                (chat) => (

                  <div
                    key={chat.id}
                    className={`jagoHistoryItem ${
                      conversationId ===
                      chat.id
                        ? "active"
                        : ""
                    }`}
                  >

                    {/* OPEN CHAT */}

                    <button
                      type="button"
                      className="jagoHistoryOpen"
                      onClick={() =>
                        loadConversation(
                          chat.id
                        )
                      }
                      disabled={loading}
                    >
                      <span>
                        {chat.title}
                      </span>
                    </button>

                    {/* ACTIONS */}

                    <div className="jagoHistoryActions">

                      <button
                        type="button"
                        title="Rename"
                        onClick={() =>
                          renameConversation(
                            chat.id,
                            chat.title
                          )
                        }
                        disabled={loading}
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          deleteConversation(
                            chat.id
                          )
                        }
                        disabled={loading}
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </aside>

        {/* CHAT AREA */}

        <div className="chat">

          {/* TOOLBAR */}

          <div className="jagoToolbar">

            <label htmlFor="jago-language">
              🌐 Language
            </label>

            <select
              id="jago-language"
              value={language}
              onChange={(event) =>
                setLanguage(
                  event.target.value
                )
              }
              disabled={loading}
            >

              {LANGUAGE_OPTIONS.map(
                (option) => (

                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>

                )
              )}

            </select>

          </div>

          {/* MESSAGES */}

          <div className="chatMsgs">

            {messages.map(
              (message, index) => (

                <div
                  key={`${conversationId || "new"}-${index}`}
                  className={
                    message.role
                  }
                >

                  {/* MESSAGE */}

                  {message.text && (

                    <ReactMarkdown
                      remarkPlugins={[
                        remarkGfm,
                      ]}
                    >
                      {message.text}
                    </ReactMarkdown>

                  )}

                  {/* TYPING */}

                  {loading &&
                    index ===
                      messages.length -
                        1 &&
                    message.role ===
                      "bot" &&
                    !message.text && (

                      <span className="jagoTyping">
                        ● ● ●
                      </span>

                  )}

                  {/* COPY */}

                  {message.role ===
                    "bot" &&
                    message.text &&
                    index !== 0 && (

                    <div className="jagoMessageActions">

                      <button
                        type="button"
                        onClick={() =>
                          copyMessage(
                            message.text
                          )
                        }
                      >
                        📋 Copy
                      </button>

                    </div>

                  )}

                </div>

              )
            )}

          </div>

          {/* INPUT */}

          <form
            onSubmit={
              sendMessage
            }
          >

            <input
              type="text"
              placeholder="Describe your problem here..."
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
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
                ? "Generating..."
                : "Send"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Jago;