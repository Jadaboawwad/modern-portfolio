import { containsArabic } from "./portfolioChat";

const LTR_ISOLATE_RE =
  /\+[\d\s\-().]{6,30}\d|\b(?:\+?962|00962)[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|\b0\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/[^\s<>"']+|\b\d{1,4}(?:[\s\-]\d{2,5}){2,4}\b/g;

const INLINE_AR_NUM_RE = /(?<=[^\n])\s+([٠-٩]{1,2})\.\s+/g;
const INLINE_EN_NUM_RE = /(?<=[^\n])\s+(\d{1,2})\.\s+/g;
const NUM_HEADING_RE = /^([٠-٩]+|\d{1,2})\.\s*(.+)$/;

function splitInlineNumberedItems(text) {
  if (!text) return text;
  return text
    .replace(INLINE_AR_NUM_RE, "\n$1. ")
    .replace(INLINE_EN_NUM_RE, "\n$1. ");
}

function wrapLtrIsolates(text) {
  const parts = [];
  let last = 0;

  for (const match of text.matchAll(LTR_ISOLATE_RE)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push(text.slice(last, index));
    }
    parts.push(
      <span
        key={`ltr-${index}`}
        dir="ltr"
        className="inline-block [unicode-bidi:isolate]"
        style={{ direction: "ltr" }}
      >
        {match[0].trim()}
      </span>
    );
    last = index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length ? parts : [text];
}

function renderNumberedList(lines) {
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const match = trimmed.match(NUM_HEADING_RE);
        if (match) {
          const [, num, body] = match;
          return (
            <div key={`item-${index}`} className="block leading-relaxed">
              <span className="font-bold">{num}.</span>{" "}
              <span className="font-medium">{wrapLtrIsolates(body)}</span>
            </div>
          );
        }

        return (
          <div key={`pre-${index}`} className="mb-1">
            {wrapLtrIsolates(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

/** Keep phone numbers, emails, and URLs LTR inside Arabic bubbles. */
export function renderBidiContent(text, language) {
  const useRtl = language === "ar" || containsArabic(text);
  const prepared = splitInlineNumberedItems(text);
  const lines = prepared.split("\n");

  const hasNumberedItems = lines.some((line) => NUM_HEADING_RE.test(line.trim()));
  if (hasNumberedItems) {
    return renderNumberedList(lines);
  }

  if (!useRtl) {
    return prepared;
  }

  return lines.map((line, lineIndex) => (
    <span key={`line-${lineIndex}`}>
      {lineIndex > 0 && <br />}
      {wrapLtrIsolates(line)}
    </span>
  ));
}
