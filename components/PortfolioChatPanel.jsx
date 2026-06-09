import { useEffect, useRef, useState } from "react";
import { HiArrowPath } from "react-icons/hi2";
import {
  UI,
  detectLanguage,
  retryRagApiConnection,
  sendPortfolioQuestion,
  warmupRagApi,
} from "../lib/portfolioChat";
import { renderBidiContent } from "../lib/formatBidiText";

function MessageBubble({ role, content, language }) {
  const isUser = role === "user";
  const isArabic = language === "ar";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-accent text-white rounded-br-md"
            : "bg-white/10 text-white/95 rounded-bl-md"
        }`}
      >
        {renderBidiContent(content, language)}
      </div>
    </div>
  );
}

const PortfolioChatPanel = () => {
  const [language, setLanguage] = useState("en");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const bottomRef = useRef(null);
  const strings = UI[language];

  useEffect(() => {
    let cancelled = false;

    warmupRagApi().then((ok) => {
      if (cancelled) return;
      setReady(ok);
      setChecking(false);
      setMessages([{ role: "assistant", content: strings.welcome }]);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMessages((current) => {
      const hasUser = current.some((message) => message.role === "user");
      if (hasUser) return current;
      return [{ role: "assistant", content: strings.welcome }];
    });
  }, [language, strings.welcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const switchLanguage = (code) => {
    if (code === language) return;
    setLanguage(code);
  };

  const handleRetryConnection = async () => {
    setRetrying(true);
    const ok = await retryRagApiConnection();
    setReady(ok);
    setRetrying(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    const replyLang = detectLanguage(question, language);
    setInput("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    setSending(true);

    try {
      const answer = await sendPortfolioQuestion(question, replyLang);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer, language: replyLang },
      ]);
      setReady(true);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : strings.error;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: message, language },
      ]);
      setReady(false);
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-4 bg-primary"
        role="status"
        aria-live="polite"
      >
        <HiArrowPath className="h-8 w-8 animate-spin text-accent" aria-hidden />
        <div className="text-center px-6">
          <p className="text-base font-semibold text-white">Loading assistant…</p>
          <p className="mt-1 text-sm text-white/60">Waking up the chat service</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-primary">
      <div className="flex shrink-0 items-center justify-end gap-2 border-b border-white/10 px-3 py-2">
        <button
          type="button"
          onClick={() => switchLanguage("en")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            language === "en"
              ? "bg-accent text-white"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          {strings.langEn}
        </button>
        <button
          type="button"
          onClick={() => switchLanguage("ar")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            language === "ar"
              ? "bg-accent text-white"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          {strings.langAr}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/20">
        {!ready && (
          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3 text-sm leading-relaxed text-amber-50/95"
            role="status"
          >
            <p>{strings.offline}</p>
            <button
              type="button"
              onClick={handleRetryConnection}
              disabled={retrying}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-60"
            >
              {retrying && (
                <HiArrowPath className="h-4 w-4 animate-spin" aria-hidden />
              )}
              {strings.retry}
            </button>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.role}-${index}`}
            role={message.role}
            content={message.content}
            language={message.language || language}
          />
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <HiArrowPath className="h-5 w-5 animate-spin text-accent" aria-hidden />
            {strings.searching}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-white/10 bg-black/30 p-3"
      >
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            rows={2}
            dir={language === "ar" ? "rtl" : "ltr"}
            placeholder={strings.placeholder}
            disabled={sending}
            className="w-full max-h-36 min-h-[5.75rem] flex-1 resize-none overflow-y-auto rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-[15px] leading-normal text-white placeholder:text-white/40 focus:border-accent/60 focus:outline-none disabled:opacity-60 max-md:min-h-[6.5rem]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-full shrink-0 rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioChatPanel;
