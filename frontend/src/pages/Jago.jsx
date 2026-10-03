import { useEffect, useRef, useState } from "react";
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
  streaming: false,
};

function Jago() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [language, setLanguage] = useState("auto");

  const [historyLoading, setHistoryLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const baseURL =
    API.defaults.baseURL ||
    "https://tribal-sahay.onrender.com";

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("ts_token");
  };

  // =========================================================
  // LOAD CONVERSATIONS
  // =========================================================

  const loadConversations = async () => {
    try {
      const token = getToken();

      if (!token) {
        setHistoryLoading(false);
        return;
      }

      const response = await fetch(
        `${baseURL}/api/chat/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load chat history");
      }

      const data = await response.json();

      setConversations(
        Array.isArray(data)
          ? data
          : data.conversations || []
      );
    } catch (error) {
      console.error("History loading error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current.scrollIntoView({
      behavior: loading ? "auto" : "smooth",
      block: "nearest",
    });
  }, [messages, loading]);

  // =========================================================
  // LOAD SINGLE CONVERSATION
  // =========================================================

  const loadConversation = async (id) => {
    if (loading) return;

    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(
        `${baseURL}/api/chat/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = await response.json();

      const loadedMessages = data.messages || [];

      setConversationId(
        data.id ||
          data.conversation_id ||
          id
      );

      setLanguage(data.language || "auto");

      setMessages([
        INITIAL_MESSAGE,

        ...loadedMessages.map((message) => ({
          role:
            message.role === "user"
              ? "user"
              : "bot",

          text:
            message.text ||
            message.content ||
            "",

          streaming: false,
        })),
      ]);
    } catch (error) {
      console.error(
        "Conversation loading error:",
        error
      );
    }
  };

  // =========================================================
  // NEW CHAT
  // =========================================================

  const startNewChat = () => {
    if (loading) return;

    setConversationId(null);
    setLanguage("auto");
    setMessages([INITIAL_MESSAGE]);
    setQuestion("");
  };

  // =========================================================
  // DELETE CONVERSATION
  // =========================================================

  const deleteConversation = async (id) => {
    if (loading) return;

    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(
        `${baseURL}/api/chat/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete conversation"
        );
      }

      setConversations((previous) =>
        previous.filter(
          (conversation) =>
            (conversation.id ||
              conversation.conversation_id) !== id
        )
      );

      if (conversationId === id) {
        startNewChat();
      }
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error
      );
    }
  };

  // =========================================================
  // RENAME CONVERSATION
  // =========================================================

  const renameConversation = async (
    id,
    currentTitle
  ) => {
    if (loading) return;

    const newTitle = window.prompt(
      "Enter new chat name:",
      currentTitle || "New Chat"
    );

    if (!newTitle?.trim()) return;

    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(
        `${baseURL}/api/chat/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: newTitle.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to rename conversation"
        );
      }

      setConversations((previous) =>
        previous.map((conversation) => {
          const idValue =
            conversation.id ||
            conversation.conversation_id;

          if (idValue === id) {
            return {
              ...conversation,
              title: newTitle.trim(),
            };
          }

          return conversation;
        })
      );
    } catch (error) {
      console.error(
        "Rename conversation error:",
        error
      );
    }
  };

  // =========================================================
  // COPY
  // =========================================================

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // =========================================================
  // UPDATE STREAMING MESSAGE
  // =========================================================

  const updateBotMessage = (text) => {
    setMessages((previous) => {
      const updated = [...previous];

      const lastIndex = updated.length - 1;

      if (updated[lastIndex]?.role === "bot") {
        updated[lastIndex] = {
          ...updated[lastIndex],
          text,
          streaming: true,
        };
      }

      return updated;
    });
  };

  // =========================================================
  // FINAL MESSAGE
  // =========================================================

  const finishBotMessage = (text) => {
    setMessages((previous) => {
      const updated = [...previous];

      const lastIndex = updated.length - 1;

      if (updated[lastIndex]?.role === "bot") {
        updated[lastIndex] = {
          ...updated[lastIndex],
          text,
          streaming: false,
        };
      }

      return updated;
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userQuestion = question.trim();

    if (!userQuestion || loading) return;

    const token = getToken();

    if (!token) {
      alert(
        "Please login again. Authentication token not found."
      );
      return;
    }

    // -------------------------------------------------------
    // HISTORY
    // -------------------------------------------------------

    const history = messages
      .filter(
        (message, index) =>
          message.text && index !== 0
      )
      .slice(-8)
      .map((message) => ({
        role:
          message.role === "user"
            ? "user"
            : "assistant",
        text: message.text,
      }));

    // -------------------------------------------------------
    // ADD USER + EMPTY BOT
    // -------------------------------------------------------

    setMessages((previous) => [
      ...previous,

      {
        role: "user",
        text: userQuestion,
        streaming: false,
      },

      {
        role: "bot",
        text: "",
        streaming: true,
      },
    ]);

    setQuestion("");
    setLoading(true);

    let botReply = "";
    let currentConversationId = conversationId;

    try {
      const response = await fetch(
        `${baseURL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: userQuestion,
            history,
            language,
            conversation_id: conversationId,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Something went wrong.";

        try {
          const errorData =
            await response.json();

          errorMessage =
            errorData.detail ||
            errorData.message ||
            errorMessage;
        } catch {
          // ignore
        }

        throw new Error(errorMessage);
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

      // =====================================================
      // PROCESS SSE
      // =====================================================

      const processEvent = (rawEvent) => {
        const lines =
          rawEvent.split(/\r?\n/);

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith("data:")) {
            continue;
          }

          const dataText =
            trimmed.slice(5).trim();

          if (!dataText) {
            continue;
          }

          // -------------------------------------------------
          // DONE
          // -------------------------------------------------

          if (dataText === "[DONE]") {
            continue;
          }

          let data;

          try {
            data = JSON.parse(dataText);
          } catch {
            // Old backend compatibility
            botReply += dataText;
            updateBotMessage(botReply);
            continue;
          }

          // -------------------------------------------------
          // CONVERSATION ID
          // -------------------------------------------------

          if (
            data.type ===
            "conversation_id"
          ) {
            if (data.conversation_id) {
              currentConversationId =
                data.conversation_id;

              setConversationId(
                data.conversation_id
              );
            }

            continue;
          }

          // -------------------------------------------------
          // ERROR
          // -------------------------------------------------

          if (data.type === "error") {
            throw new Error(
              data.message ||
                "AI response error"
            );
          }

          // -------------------------------------------------
          // TEXT
          // -------------------------------------------------

          const chunk =
            typeof data.text === "string"
              ? data.text
              : typeof data.content ===
                "string"
              ? data.content
              : typeof data.delta ===
                "string"
              ? data.delta
              : "";

          if (chunk) {
            botReply += chunk;

            /*
             * IMPORTANT:
             *
             * ReactMarkdown renders even while
             * the response is streaming.
             */
            updateBotMessage(botReply);
          }
        }
      };

      // =====================================================
      // READ STREAM
      // =====================================================

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
          buffer.split(/\r?\n\r?\n/);

        buffer =
          events.pop() || "";

        for (const event of events) {
          if (event.trim()) {
            processEvent(event);
          }
        }
      }

      // =====================================================
      // FLUSH DECODER
      // =====================================================

      buffer += decoder.decode();

      if (buffer.trim()) {
        processEvent(buffer);
      }

      // =====================================================
      // EMPTY RESPONSE
      // =====================================================

      if (!botReply.trim()) {
        botReply =
          "Sorry, I could not generate a response. Please try again.";
      }

      // =====================================================
      // FINAL
      // =====================================================

      finishBotMessage(botReply);

      if (currentConversationId) {
        setConversationId(
          currentConversationId
        );
      }

      // Only refresh sidebar.
      // Do NOT reload current messages.

      await loadConversations();
    } catch (error) {
      console.error(
        "JAGO AI error:",
        error
      );

      finishBotMessage(
        `⚠️ ${
          error?.message ||
          "Something went wrong while connecting to JAGO AI."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // =========================================================
  // MARKDOWN COMPONENTS
  // =========================================================

  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="jagoMdH1">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="jagoMdH2">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="jagoMdH3">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="jagoMdP">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="jagoMdUl">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="jagoMdOl">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="jagoMdLi">
        {children}
      </li>
    ),

    blockquote: ({ children }) => (
      <blockquote className="jagoMdQuote">
        {children}
      </blockquote>
    ),

    table: ({ children }) => (
      <div className="jagoTableWrap">
        <table className="jagoMdTable">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead>{children}</thead>
    ),

    tbody: ({ children }) => (
      <tbody>{children}</tbody>
    ),

    tr: ({ children }) => (
      <tr>{children}</tr>
    ),

    th: ({ children }) => (
      <th>{children}</th>
    ),

    td: ({ children }) => (
      <td>{children}</td>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    code: ({
      inline,
      className,
      children,
    }) => {
      const match =
        /language-(\w+)/.exec(
          className || ""
        );

      if (inline) {
        return (
          <code className="jagoInlineCode">
            {children}
          </code>
        );
      }

      return (
        <pre className="jagoCodeBlock">
          <code
            className={
              match
                ? `language-${match[1]}`
                : ""
            }
          >
            {children}
          </code>
        </pre>
      );
    },
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page jagoPage">

      {/* PAGE TITLE */}

      <div className="pageTitle jagoPageTitle">
        <div className="eyebrow">
          TribalSahay
        </div>

        <h1>JAGO AI</h1>

        <p>
          Your intelligent scholarship &
          government scheme assistant
        </p>
      </div>

      <div className="jagoLayout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="jagoSidebar">

          <button
            className="btn newChatBtn"
            onClick={startNewChat}
            disabled={loading}
          >
            <span>＋</span>
            New Chat
          </button>

          <div className="jagoHistoryTitle">
            <span>Chat History</span>

            <span className="jagoHistoryCount">
              {conversations.length}
            </span>
          </div>

          <div className="jagoHistory">

            {historyLoading ? (
              <div className="jagoHistoryEmpty">
                Loading chats...
              </div>
            ) : conversations.length === 0 ? (
              <div className="jagoHistoryEmpty">
                <span>💬</span>
                <p>No previous chats</p>
              </div>
            ) : (
              conversations.map(
                (conversation) => {
                  const id =
                    conversation.id ||
                    conversation.conversation_id;

                  const title =
                    conversation.title ||
                    "New Chat";

                  return (
                    <div
                      key={id}
                      className={`jagoHistoryItem ${
                        conversationId === id
                          ? "active"
                          : ""
                      }`}
                    >
                      <button
                        className="jagoHistoryOpen"
                        onClick={() =>
                          loadConversation(id)
                        }
                        disabled={loading}
                        title={title}
                      >
                        <span className="jagoHistoryIcon">
                          💬
                        </span>

                        <span className="jagoHistoryText">
                          {title}
                        </span>
                      </button>

                      <div className="jagoHistoryActions">

                        <button
                          className="jagoIconBtn"
                          onClick={() =>
                            renameConversation(
                              id,
                              title
                            )
                          }
                          disabled={loading}
                          title="Rename"
                        >
                          ✏️
                        </button>

                        <button
                          className="jagoIconBtn delete"
                          onClick={() =>
                            deleteConversation(id)
                          }
                          disabled={loading}
                          title="Delete"
                        >
                          🗑️
                        </button>

                      </div>
                    </div>
                  );
                }
              )
            )}

          </div>
        </aside>

        {/* ===================================================
            CHAT
        =================================================== */}

        <main className="chat jagoChat">

          {/* TOOLBAR */}

          <div className="jagoToolbar">

            <div className="jagoAssistantInfo">

              <div className="jagoAvatar">
                J
              </div>

              <div>
                <strong>JAGO</strong>

                <span>
                  AI Assistant
                </span>
              </div>

              <span
                className={`jagoStatus ${
                  loading
                    ? "thinking"
                    : ""
                }`}
              >
                <span />
                {loading
                  ? "Thinking..."
                  : "Online"}
              </span>

            </div>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(
                  event.target.value
                )
              }
              disabled={loading}
              className="jagoLanguageSelect"
            >
              {LANGUAGE_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
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
              (message, index) => {

                const isLastMessage =
                  index ===
                  messages.length - 1;

                const isStreaming =
                  message.streaming === true;

                const isBot =
                  message.role === "bot";

                return (
                  <div
                    key={`${conversationId || "new"}-${index}`}
                    className={`jagoMessageRow ${
                      isBot
                        ? "bot"
                        : "user"
                    }`}
                  >

                    {/* BOT AVATAR */}

                    {isBot && (
                      <div className="jagoMessageAvatar">
                        J
                      </div>
                    )}

                    <div className="jagoMessageColumn">

                      <div
                        className={`jagoMessageBubble ${
                          isBot
                            ? "botBubble"
                            : "userBubble"
                        }`}
                      >

                        {message.text ? (
                          <div
                            className={`jagoMarkdown ${
                              isStreaming
                                ? "jagoMarkdownStreaming"
                                : ""
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                              components={
                                markdownComponents
                              }
                            >
                              {message.text}
                            </ReactMarkdown>

                            {isStreaming && (
                              <span className="jagoStreamCursor" />
                            )}
                          </div>
                        ) : null}

                        {/* TYPING */}

                        {loading &&
                          isLastMessage &&
                          isBot &&
                          !message.text && (
                            <span className="jagoTyping">
                              <span />
                              <span />
                              <span />
                            </span>
                          )}

                      </div>

                      {/* COPY */}

                      {isBot &&
                        message.text &&
                        !isStreaming && (
                          <div className="jagoMessageActions">
                            <button
                              className="jagoCopyBtn"
                              onClick={() =>
                                copyMessage(
                                  message.text
                                )
                              }
                              title="Copy response"
                            >
                              ⧉ Copy
                            </button>
                          </div>
                        )}

                    </div>

                  </div>
                );
              }
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <form
            className="jagoInputArea"
            onSubmit={handleSubmit}
          >

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask JAGO about scholarships, schemes, documents, eligibility..."
              disabled={loading}
              rows={1}
            />

            <button
              type="submit"
              className="jagoSendBtn"
              disabled={
                loading ||
                !question.trim()
              }
            >
              {loading ? (
                <>
                  <span className="jagoSendSpinner" />
                  Thinking
                </>
              ) : (
                <>
                  Send
                  <span>➤</span>
                </>
              )}
            </button>

          </form>

          <div className="jagoInputHint">
            Enter to send · Shift + Enter
            for a new line
          </div>

        </main>
      </div>
    </div>
  );
}

export default Jago;