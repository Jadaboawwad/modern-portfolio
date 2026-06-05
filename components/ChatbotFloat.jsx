import { useEffect, useState } from "react";
import { HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_URL ||
  "https://curable-steerable-obnoxious.ngrok-free.dev";

const iframeSrc = `${CHATBOT_URL.replace(/\/$/, "")}/?embed=true`;

const ChatbotFloat = ({ inline = false }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const buttonClass = inline
    ? "flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-black/30 hover:bg-accent/90 hover:scale-110 transition-all duration-300"
    : "fixed z-30 flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-black/30 hover:bg-accent/90 hover:scale-110 transition-all duration-300 bottom-40 right-4 md:bottom-24 md:right-8 xl:bottom-24 xl:right-24";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Chat with AI assistant"
        aria-label="Open AI chat assistant"
        aria-expanded={open}
        className={buttonClass}
      >
        <HiChatBubbleLeftRight className="text-2xl" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close chat assistant"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="AI chat assistant"
              className="fixed z-[60] flex flex-col overflow-hidden bg-secondary border border-white/10 shadow-2xl inset-x-0 bottom-0 h-[min(78vh,640px)] rounded-t-2xl md:inset-x-auto md:bottom-28 md:right-8 md:w-[min(420px,calc(100vw-2rem))] md:h-[min(560px,calc(100vh-8rem))] md:rounded-2xl xl:right-24"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Portfolio Assistant
                  </p>
                  <p className="text-[11px] text-white/60">
                    Ask about my work, skills, or experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <HiXMark className="text-xl" aria-hidden />
                </button>
              </div>

              <iframe
                title="Portfolio AI chat"
                src={iframeSrc}
                className="min-h-0 flex-1 w-full border-0 bg-white"
                allow="clipboard-read; clipboard-write"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotFloat;
