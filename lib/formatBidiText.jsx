import { containsArabic } from "./portfolioChat";

const LTR_ISOLATE_RE =
  /\+[\d\s\-().]{6,30}\d|\b(?:\+?962|00962)[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|\b0\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/[^\s<>"']+|\b\d{1,4}(?:[\s\-]\d{2,5}){2,4}\b/g;

const INLINE_AR_NUM_RE = /(?<=[^\n])\s+([٠-٩]{1,2})\.\s+/g;
const INLINE_EN_NUM_RE = /(?<=[^\n])\s+(\d{1,2})\.\s+/g;
const NUM_HEADING_RE = /^([٠-٩]+|\d{1,2})\.\s*(.+)$/;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

function splitInlineNumberedItems(text) {
  if (!text) return text;
  return text
    .replace(INLINE_AR_NUM_RE, "\n$1. ")
    .replace(INLINE_EN_NUM_RE, "\n$1. ");
}

function wrapLtrIsolates(text, keyPrefix = "ltr") {
  const parts = [];
  let last = 0;
  let isolateIndex = 0;

  for (const match of text.matchAll(LTR_ISOLATE_RE)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push(text.slice(last, index));
    }
    parts.push(
      <span
        key={`${keyPrefix}-iso-${isolateIndex++}`}
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

/** Render **bold** markdown as <strong>; keep emails/phones LTR inside segments. */
function renderFormattedText(text, keyPrefix = "fmt") {
  if (!text) return null;

  const segments = [];
  let last = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(BOLD_RE)) {
    const index = match.index ?? 0;
    if (index > last) {
      segments.push({
        bold: false,
        text: text.slice(last, index),
        key: `${keyPrefix}-p-${matchIndex++}`,
      });
    }
    segments.push({
      bold: true,
      text: match[1],
      key: `${keyPrefix}-b-${matchIndex++}`,
    });
    last = index + match[0].length;
  }

  if (last < text.length) {
    segments.push({
      bold: false,
      text: text.slice(last),
      key: `${keyPrefix}-p-${matchIndex++}`,
    });
  }

  if (!segments.length) {
    return wrapLtrIsolates(text, keyPrefix);
  }

  return segments.map((segment) => {
    const children = wrapLtrIsolates(segment.text, segment.key);
    if (segment.bold) {
      return (
        <strong key={segment.key} className="font-bold">
          {children}
        </strong>
      );
    }
    return <span key={segment.key}>{children}</span>;
  });
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
              {renderFormattedText(body, `item-${index}`)}
            </div>
          );
        }

        return (
          <div key={`pre-${index}`} className="mb-1">
            {renderFormattedText(trimmed, `pre-${index}`)}
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
    return renderFormattedText(prepared, "plain");
  }

  return lines.map((line, lineIndex) => (
    <span key={`line-${lineIndex}`}>
      {lineIndex > 0 && <br />}
      {renderFormattedText(line, `line-${lineIndex}`)}
    </span>
  ));
}
