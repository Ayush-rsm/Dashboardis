import { useState } from "react";
import { Send, X, Sparkles, Bot } from "lucide-react";
import { sendChatMessage } from "../../api/chat";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can help you understand your ticket operations and dashboard data.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const data = await sendChatMessage(trimmedMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            fixed
            bottom-6
            right-6
            z-50
            w-14
            h-14
            rounded-full
            bg-indigo-600
            text-white
            shadow-lg
            shadow-indigo-200
            flex
            items-center
            justify-center
            hover:bg-indigo-700
            hover:scale-105
            transition-all
          "
          aria-label="Open AI assistant"
        >
          <Sparkles size={23} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-50
            w-[360px]
            max-w-[calc(100vw-32px)]
            h-[560px]
            max-h-[calc(100vh-32px)]
            bg-white
            rounded-2xl
            border
            border-slate-200
            shadow-2xl
            flex
            flex-col
            overflow-hidden
          "
        >
          {/* Header */}
          <div
            className="
              px-5
              py-4
              bg-slate-950
              text-white
              flex
              items-center
              justify-between
            "
          >
            <div className="flex items-center gap-3">

              <div
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-indigo-600
                  flex
                  items-center
                  justify-center
                "
              >
                <Bot size={19} />
              </div>

              <div>
                <p className="font-semibold text-sm">
                  TicketFlow Assistant
                </p>

                <p className="text-xs text-slate-400">
                  ● Live dashboard assistant
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
                text-slate-400
                hover:bg-slate-800
                hover:text-white
                transition
              "
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">

            {messages.map((item, index) => {
              const isUser = item.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-[82%]
                      px-4
                      py-3
                      rounded-2xl
                      text-sm
                      leading-relaxed
                      ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-br-md"
                          : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                      }
                    `}
                  >
                    {item.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="
                    bg-white
                    border
                    border-slate-200
                    px-4
                    py-3
                    rounded-2xl
                    rounded-bl-md
                    text-sm
                    text-slate-400
                  "
                >
                  Thinking...
                </div>
              </div>
            )}

          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white">

            <div
              className="
                flex
                items-end
                gap-2
                bg-slate-50
                border
                border-slate-200
                rounded-xl
                p-2
                focus-within:border-indigo-400
                focus-within:ring-2
                focus-within:ring-indigo-100
                transition
              "
            >
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your tickets..."
                rows={1}
                disabled={loading}
                className="
                  flex-1
                  resize-none
                  bg-transparent
                  border-none
                  outline-none
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  px-2
                  py-2
                "
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || loading}
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-indigo-600
                  text-white
                  flex
                  items-center
                  justify-center
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-indigo-700
                  transition
                  flex-shrink-0
                "
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-2">
              Answers are based on current dashboard data
            </p>

          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;