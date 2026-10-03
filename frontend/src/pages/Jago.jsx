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

  /*
   * This number changes whenever a streaming response
   * becomes a final response.
   *
   * ReactMarkdown gets a new key and is therefore
   * completely re-mounted with the final Markdown.
   */
  const [markdownVersion, setMarkdownVersion] =
    useState(0);

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
  // LOAD ALL CONVERSATIONS
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
        throw new Error(
          "Failed to load chat history"
        );
      }

      const data = await response.json();

      setConversations(
        Array.isArray(data)
          ? data
          : data.conversations || []
      );
    } catch (error) {
      console.error(
        "History loading error:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // =========================================================
  // LOAD SINGLE CONVERSATION
  // =========================================================

  const loadConversation = async (id) => {
    if (loading) return;

    try {
      const token = getToken();

      if (!token) {
        return;
      }

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
        throw new Error(
          "Failed to load conversation"
        );
      }

      const data = await response.json();

      const loadedMessages =
        data.messages || [];

      setConversationId(
        data.id ||
          data.conversation_id ||
          id
      );

      setLanguage(
        data.language || "auto"
      );

      setMessages([
        INITIAL_MESSAGE,

        ...loadedMessages.map(
          (message) => ({
            role:
              message.role === "user"
                ? "user"
                : "bot",

            text:
              message.text ||
              message.content ||
              "",

            streaming: false,
          })
        ),
      ]);

      /*
       * Make sure loaded messages are treated
       * as final Markdown messages.
       */
      setMarkdownVersion(
        (version) => version + 1
      );
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

    setMessages([
      INITIAL_MESSAGE,
    ]);

    setQuestion("");

    setMarkdownVersion(
      (version) => version + 1
    );
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

      setConversations(
        (previous) =>
          previous.filter(
            (conversation) =>
              (conversation.id ||
                conversation.conversation_id) !==
              id
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

    if (!newTitle?.trim()) {
      return;
    }

    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(
        `${baseURL}/api/chat/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

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

      setConversations(
        (previous) =>
          previous.map(
            (conversation) => {
              const idValue =
                conversation.id ||
                conversation.conversation_id;

              if (idValue === id) {
                return {
                  ...conversation,
                  title:
                    newTitle.trim(),
                };
              }

              return conversation;
            }
          )
      );
    } catch (error) {
      console.error(
        "Rename conversation error:",
        error
      );
    }
  };

  // =========================================================
  // COPY MESSAGE
  // =========================================================

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  // =========================================================
  // UPDATE BOT DURING STREAMING
  // =========================================================

  const updateBotMessage = (text) => {
    setMessages((previous) => {
      const updated = [
        ...previous,
      ];

      const lastIndex =
        updated.length - 1;

      if (
        updated[lastIndex]?.role ===
        "bot"
      ) {
        updated[lastIndex] = {
          ...updated[lastIndex],

          text,

          /*
           * VERY IMPORTANT
           *
           * While streaming:
           * do NOT render ReactMarkdown.
           */
          streaming: true,
        };
      }

      return updated;
    });
  };

  // =========================================================
  // FINALIZE BOT MESSAGE
  // =========================================================

  const finishBotMessage = (text) => {
    /*
     * Debug:
     * Open browser console and verify that this contains
     * proper Markdown.
     */
    console.log(
      "FINAL JAGO RESPONSE:",
      text
    );

    setMessages((previous) => {
      const updated = [
        ...previous,
      ];

      const lastIndex =
        updated.length - 1;

      if (
        updated[lastIndex]?.role ===
        "bot"
      ) {
        updated[lastIndex] = {
          ...updated[lastIndex],

          text,

          /*
           * Streaming finished.
           *
           * ReactMarkdown will now render
           * the complete response.
           */
          streaming: false,
        };
      }

      return updated;
    });

    /*
     * Force ReactMarkdown to mount again.
     *
     * This is the important part for the
     * "works only after reload" issue.
     */
    setMarkdownVersion(
      (version) => version + 1
    );
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userQuestion =
      question.trim();

    if (!userQuestion || loading) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Please login again. Authentication token not found."
      );

      return;
    }

    // =======================================================
    // PREVIOUS HISTORY
    // =======================================================

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

        text: message.text,
      }));

    // =======================================================
    // ADD USER MESSAGE
    // =======================================================

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

    // =======================================================
    // STREAM VARIABLES
    // =======================================================

    let botReply = "";

    let currentConversationId =
      conversationId;

    try {
      const response = await fetch(
        `${baseURL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: userQuestion,

            history,

            language,

            conversation_id:
              conversationId,
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
          // Ignore parsing error
        }

        throw new Error(
          errorMessage
        );
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
      // PROCESS SSE EVENT
      // =====================================================

      const processEvent = (
        rawEvent
      ) => {
        const lines =
          rawEvent.split("\n");

        for (const line of lines) {
          const trimmed =
            line.trim();

          if (
            !trimmed.startsWith(
              "data:"
            )
          ) {
            continue;
          }

          const dataText =
            trimmed
              .slice(5)
              .trim();

          if (!dataText) {
            continue;
          }

          try {
            const data =
              JSON.parse(
                dataText
              );

            // -----------------------------------------------
            // CONVERSATION ID
            // -----------------------------------------------

            if (
              data.type ===
              "conversation_id"
            ) {
              if (
                data.conversation_id
              ) {
                currentConversationId =
                  data.conversation_id;

                setConversationId(
                  data.conversation_id
                );
              }

              continue;
            }

            // -----------------------------------------------
            // ERROR
            // -----------------------------------------------

            if (
              data.type ===
              "error"
            ) {
              throw new Error(
                data.message ||
                  "AI response error"
              );
            }

            // -----------------------------------------------
            // TEXT
            // -----------------------------------------------

            if (
              typeof data.text ===
              "string"
            ) {
              botReply +=
                data.text;

              updateBotMessage(
                botReply
              );

              continue;
            }

            // -----------------------------------------------
            // CONTENT
            // -----------------------------------------------

            if (
              typeof data.content ===
              "string"
            ) {
              botReply +=
                data.content;

              updateBotMessage(
                botReply
              );

              continue;
            }

            // -----------------------------------------------
            // DELTA
            // -----------------------------------------------

            if (
              typeof data.delta ===
              "string"
            ) {
              botReply +=
                data.delta;

              updateBotMessage(
                botReply
              );

              continue;
            }
          } catch (error) {
            /*
             * If backend sends plain text instead
             * of JSON, treat it as text.
             */

            if (
              error instanceof
                SyntaxError &&
              dataText
            ) {
              botReply +=
                dataText;

              updateBotMessage(
                botReply
              );
            } else {
              throw error;
            }
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

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        /*
         * SSE events are separated by
         * an empty line.
         */
        const events =
          buffer.split(
            "\n\n"
          );

        /*
         * Last element may be incomplete.
         */
        buffer =
          events.pop() || "";

        for (
          const event of events
        ) {
          if (
            event.trim()
          ) {
            processEvent(
              event
            );
          }
        }
      }

      // =====================================================
      // FLUSH DECODER
      // =====================================================

      buffer += decoder.decode();

      // =====================================================
      // PROCESS REMAINING BUFFER
      // =====================================================

      if (buffer.trim()) {
        processEvent(buffer);
      }

      // =====================================================
      // FALLBACK
      // =====================================================

      if (!botReply.trim()) {
        botReply =
          "Sorry, I could not generate a response. Please try again.";
      }

      // =====================================================
      // FINAL MARKDOWN RENDER
      // =====================================================

      finishBotMessage(
        botReply
      );

      // =====================================================
      // CONVERSATION ID
      // =====================================================

      if (
        currentConversationId
      ) {
        setConversationId(
          currentConversationId
        );
      }

      /*
       * Only refresh sidebar history.
       *
       * This does NOT replace the current
       * messages array.
       */
      await loadConversations();
    } catch (error) {
      console.error(
        "JAGO AI error:",
        error
      );

      const errorText =
        error?.message ||
        "Something went wrong while connecting to JAGO AI.";

      finishBotMessage(
        `⚠️ ${errorText}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleKeyDown = (event) => {
    /*
     * Enter = send
     *
     * Shift + Enter = new line
     */
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page">

      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <div className="pageTitle">
        <div className="eyebrow">
          TribalSahay
        </div>

        <h1>
          JAGO AI
        </h1>
      </div>


      <div className="jagoLayout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="jagoSidebar">

          <button
            className="btn newChatBtn"
            onClick={
              startNewChat
            }
            disabled={loading}
          >
            + New Chat
          </button>


          <div className="jagoHistoryTitle">
            Chat History
          </div>


          <div className="jagoHistory">

            {historyLoading ? (
              <div className="jagoHistoryEmpty">
                Loading chats...
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="jagoHistoryEmpty">
                No previous chats
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
                      className={
                        `jagoHistoryItem ${
                          conversationId ===
                          id
                            ? "active"
                            : ""
                        }`
                      }
                    >

                      <button
                        className="jagoHistoryOpen"
                        onClick={() =>
                          loadConversation(
                            id
                          )
                        }
                        disabled={
                          loading
                        }
                      >
                        {title}
                      </button>


                      <div className="jagoHistoryActions">

                        <button
                          className="btn"
                          onClick={() =>
                            renameConversation(
                              id,
                              title
                            )
                          }
                          disabled={
                            loading
                          }
                          title="Rename"
                        >
                          ✏️
                        </button>


                        <button
                          className="btn"
                          onClick={() =>
                            deleteConversation(
                              id
                            )
                          }
                          disabled={
                            loading
                          }
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

        <main className="chat">

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="jagoToolbar">

            <div>
              <strong>
                JAGO
              </strong>

              <span>
                AI Assistant
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


          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="chatMsgs">

            {messages.map(
              (message, index) => {

                const isLastMessage =
                  index ===
                  messages.length - 1;

                const isStreaming =
                  message.streaming ===
                  true;

                return (
                  <div
                    key={`${conversationId || "new"}-${index}`}
                    className={
                      message.role ===
                      "user"
                        ? "user"
                        : "bot"
                    }
                  >

                    <div className="jagoMessageContent">

                      {/* =====================================
                          STREAMING
                      ===================================== */}

                      {message.text &&
                      isStreaming ? (
                        <div className="jagoStreamingText">
                          {message.text}
                        </div>
                      ) : message.text ? (

                        /* ===================================
                           FINAL MARKDOWN

                           key forces ReactMarkdown to
                           completely remount after the
                           streaming response finishes.
                        =================================== */

                        <ReactMarkdown
                          key={`markdown-${markdownVersion}-${index}-${message.text.length}`}
                          remarkPlugins={[
                            remarkGfm,
                          ]}
                        >
                          {message.text}
                        </ReactMarkdown>

                      ) : null}


                      {/* =====================================
                          TYPING
                      ===================================== */}

                      {loading &&
                        isLastMessage &&
                        message.role ===
                          "bot" &&
                        !message.text && (
                          <span className="jagoTyping">
                            ● ● ●
                          </span>
                        )}

                    </div>


                    {/* =====================================
                        COPY
                    ===================================== */}

                    {message.role ===
                      "bot" &&
                      message.text &&
                      !isStreaming && (
                        <div className="jagoMessageActions">

                          <button
                            className="btn"
                            onClick={() =>
                              copyMessage(
                                message.text
                              )
                            }
                          >
                            Copy
                          </button>

                        </div>
                      )}

                  </div>
                );
              }
            )}

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <form
            className="jagoInputArea"
            onSubmit={
              handleSubmit
            }
          >

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask JAGO anything about scholarships, schemes, documents, eligibility..."
              disabled={loading}
              rows={1}
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

        </main>

      </div>
    </div>
  );
}

export default Jago;