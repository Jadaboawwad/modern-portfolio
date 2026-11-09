import { useEffect, useRef, useState } from "react";
import { HiArrowPath, HiMicrophone, HiStop } from "react-icons/hi2";
import {
  UI,
  detectLanguage,
  retryRagApiConnection,
  sendPortfolioQuestion,
  warmupRagApi,
} from "../lib/portfolioChat";
import { speakWithAvatarStreaming, transcribeAudio } from "../lib/avatarChat";
import { renderBidiContent } from "../lib/formatBidiText";
import AvatarTalker from "./AvatarTalker";

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
  const [avatarQueue, setAvatarQueue] = useState([]);
  const [avatarAudioUrl, setAvatarAudioUrl] = useState(null);
  const [avatarChunkSeconds, setAvatarChunkSeconds] = useState(null);
  const [avatarStreamDone, setAvatarStreamDone] = useState(true);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState(null);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
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

  // Stop any in-progress recording and release the mic if the panel unmounts
  // mid-recording (e.g. user navigates away).
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const submitQuestion = async (question) => {
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

      // Best-effort: never let the avatar pipeline (separate local service,
      // shares the GPU with the RAG model) block or break the text reply.
      // Streaming: chunks arrive over the whole render, not all at once, so
      // reset the queue for this new answer and let AvatarTalker start
      // playing chunk 0 as soon as it lands instead of waiting for the
      // full clip (which for a long answer can take minutes).
      setAvatarQueue([]);
      setAvatarAudioUrl(null);
      setAvatarChunkSeconds(null);
      setAvatarStreamDone(false);
      setAvatarSpeaking(true);
      speakWithAvatarStreaming(answer, {
        onAudio: (audioUrl, chunkSeconds) => {
          setAvatarAudioUrl(audioUrl);
          if (chunkSeconds) setAvatarChunkSeconds(chunkSeconds);
        },
        onChunk: (videoUrl, isLast) => {
          setAvatarQueue((current) => [...current, videoUrl]);
          if (isLast) setAvatarStreamDone(true);
        },
      }).finally(() => {
        setAvatarSpeaking(false);
        // Safety net: if the stream ended without an explicit is_last
        // chunk (e.g. it errored out mid-stream), make sure AvatarTalker
        // doesn't stay stuck "waiting" for a chunk that's never coming.
        setAvatarStreamDone(true);
      });
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = input.trim();
    setInput("");
    submitQuestion(question);
  };

  const startRecording = async () => {
    if (sending || transcribing || recording) return;
    setMicError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = window.MediaRecorder?.isTypeSupported?.("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = new window.MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        chunksRef.current = [];
        if (blob.size === 0) return;

        setTranscribing(true);
        const text = await transcribeAudio(blob);
        setTranscribing(false);

        if (text) {
          submitQuestion(text);
        } else {
          setMicError(strings.micError);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setMicError(strings.micDenied);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
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
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-primary">
      <div className="flex shrink-0 items-center justify-end gap-2 border-b border-white/10 px-3 py-1 md:py-2">
        <div className="flex items-center gap-1.5 md:gap-2">
        <button
          type="button"
          onClick={() => switchLanguage("en")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:px-3.5 md:py-1.5 md:text-sm ${
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
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:px-3.5 md:py-1.5 md:text-sm ${
            language === "ar"
              ? "bg-accent text-white"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          {strings.langAr}
        </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center border-b border-white/10 bg-black/20 py-2 md:py-5">
        <AvatarTalker
          queue={avatarQueue}
          audioUrl={avatarAudioUrl}
          chunkSeconds={avatarChunkSeconds}
          streamDone={avatarStreamDone}
          speaking={avatarSpeaking}
          size="h-48 w-48 sm:h-48 sm:w-48 md:h-56 md:w-56"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 md:py-4 scrollbar-thin scrollbar-thumb-white/20">
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
        className="shrink-0 border-t border-white/10 bg-black/30 p-2 md:p-3"
      >
        <div className="flex flex-col gap-1.5 md:gap-2">
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
            placeholder={
              recording
                ? strings.listening
                : transcribing
                  ? strings.transcribing
                  : strings.placeholder
            }
            disabled={sending || recording || transcribing}
            className="w-full max-h-36 min-h-[2.75rem] flex-1 resize-none overflow-y-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm leading-normal text-white placeholder:text-white/40 focus:border-accent/60 focus:outline-none disabled:opacity-60 md:min-h-[5.75rem] md:px-3.5 md:py-3 md:text-[15px]"
          />

          {micError && (
            <p
              dir={language === "ar" ? "rtl" : "ltr"}
              className="text-[13px] leading-snug text-red-300"
              role="alert"
            >
              {micError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={sending || transcribing}
              title={recording ? strings.stopTitle : strings.micTitle}
              aria-label={recording ? strings.stopTitle : strings.micTitle}
              aria-pressed={recording}
              className={`flex shrink-0 items-center justify-center rounded-xl px-3 py-2 transition-colors md:px-4 md:py-3 ${
                recording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {recording ? (
                <HiStop className="h-5 w-5" aria-hidden />
              ) : (
                <HiMicrophone className="h-5 w-5" aria-hidden />
              )}
            </button>
            <button
              type="submit"
              disabled={sending || recording || transcribing || !input.trim()}
              className="flex-1 shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:py-3 md:text-[15px]"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PortfolioChatPanel;
