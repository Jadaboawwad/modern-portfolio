import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioChatPanel from "./PortfolioChatPanel";
import { warmupRagApi } from "../lib/portfolioChat";

const STREAMLIT_TAB_URL =
  "https://jehadabuawwad.com/chat/?portfolio=true&_cv=5";

const ChatbotFloat = ({ inline = false }) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    warmupRagApi();
  }, []);

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

  const modal =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close chat assistant"
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="AI chat assistant"
              className="fixed z-[110] flex w-full max-w-full flex-col overflow-hidden border border-white/10 bg-secondary shadow-2xl inset-x-0 bottom-[5.5rem] h-[min(calc(100dvh-7rem),85dvh)] rounded-t-2xl md:inset-x-auto md:bottom-28 md:right-8 md:h-[min(560px,calc(100vh-8rem))] md:w-[min(420px,calc(100vw-2rem))] md:max-w-[420px] md:rounded-2xl xl:right-[calc(2%+6rem)] xl:h-[min(800px,calc(100vh-4rem))] xl:w-[min(640px,calc(100vw-14rem))] xl:max-w-[640px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex shrink-0 flex-col gap-3 border-b border-white/10 bg-black/40 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white md:text-lg">
                    Portfolio Assistant
                  </p>
                  <p className="text-sm text-white/60 md:text-base">
                    Ask about my experience, skills, certifications, and background
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2 self-end sm:self-auto">
                  <a
                    href={STREAMLIT_TAB_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
                  >
                    Open in tab
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <HiXMark className="text-xl" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="relative min-h-0 min-w-0 flex-1">
                <PortfolioChatPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

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

      {modal}
    </>
  );
};

export default ChatbotFloat;
