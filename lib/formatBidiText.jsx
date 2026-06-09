import { containsArabic } from "./portfolioChat";

const LTR_ISOLATE_RE =
  /\+[\d\s\-().]{6,30}\d|\b(?:\+?962|00962)[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|\b0\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/[^\s<>"']+|\b\d{1,4}(?:[\s\-]\d{2,5}){2,4}\b/g;

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

/** Keep phone numbers, emails, and URLs LTR inside Arabic bubbles. */
export function renderBidiContent(text, language) {
  const useRtl = language === "ar" || containsArabic(text);
  if (!useRtl) {
    return text;
  }

  const lines = text.split("\n");
  return lines.map((line, lineIndex) => (
    <span key={`line-${lineIndex}`}>
      {lineIndex > 0 && <br />}
      {wrapLtrIsolates(line)}
    </span>
  ));
}
