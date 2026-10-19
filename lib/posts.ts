export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  author: string;
  content: Block[];
};

export const posts: Post[] = [
  {
    slug: "encodeuri-vs-encodeuricomponent",
    title: "encodeURI vs encodeURIComponent: When to Use Each (and the Double-Encoding Trap)",
    excerpt:
      "encodeURI is for a whole URL, encodeURIComponent is for one value inside it. Mix them up and you get broken links or %2520 double-encoding.",
    date: "2026-10-14",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: use encodeURI for a whole URL and encodeURIComponent for a single value inside one. encodeURI leaves the characters that give a URL its structure alone, so the result is still a working URL. encodeURIComponent encodes almost everything except letters, digits, and - _ . ! ~ * ' ( ), so the result is safe to drop into a query string as one value. Use the wrong one and you get broken links — or the classic double-encoding bug where a space shows up as %2520.",
      },
      { type: "h2", text: "The one rule" },
      {
        type: "p",
        text: "A URL has two kinds of characters: structure and data. Structure characters like ? & = / : give the URL its shape — they separate the path, the query string, and the key-value pairs. Data characters are the actual values: a search term, a name, a redirect target. encodeURI assumes you are handing it a complete URL, so it preserves the structure and only encodes the characters that are illegal anywhere. encodeURIComponent assumes you are handing it one piece of data, so it encodes the structure characters too — because inside a value, an & is data, not a separator. The rule follows from that: encode each value with encodeURIComponent, then assemble the URL. Encode the whole finished URL with encodeURI only if it still contains raw spaces or unicode.",
      },
      { type: "h2", text: "What each one leaves alone" },
      {
        type: "list",
        items: [
          "encodeURI leaves alone: ; , / ? : @ & = + $ # — the characters that make a URL work. It encodes spaces, unicode, quotes, and angle brackets.",
          "encodeURIComponent leaves alone: A-Z a-z 0-9 - _ . ! ~ * ' ( ) — and encodes everything else, including / ? : @ & = + $ # and spaces.",
          "Use this when: encodeURIComponent for query values, path segments, and anything a user typed. encodeURI for a full URL you already built.",
        ],
      },
      { type: "h2", text: "The bug everyone hits" },
      {
        type: "p",
        text: "The most common mistake is using encodeURI on a value that contains an & or an = sign. Watch what happens to a name with an ampersand in it:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `const name = "John & Jane";\n\n// WRONG: encodeURI leaves & alone, so the value splits in two\n"https://example.com/search?name=" + encodeURI(name);\n// → https://example.com/search?name=John & Jane  (broken: name=John, plus a stray param)\n\n// RIGHT: encodeURIComponent encodes the & as %26\n"https://example.com/search?name=" + encodeURIComponent(name);\n// → https://example.com/search?name=John%20%26%20Jane  (one value, correct)`,
      },
      {
        type: "p",
        text: "The server reads the broken version as two parameters — name=John and a junk parameter — and your search silently returns the wrong results. No error is thrown, which is what makes this bug so annoying to track down.",
      },
      { type: "h2", text: "The double-encoding trap" },
      {
        type: "p",
        text: "The second classic bug is encoding twice. A space becomes %20 after one round of encoding. Run it through the encoder again and the % itself gets encoded to %25, producing %2520. If you see %2520, %252F, or %253A in a URL, something encoded an already-encoded string. The usual culprits are a helper that encodes and a library that encodes again (fetch, axios, and URLSearchParams all encode values for you), or encoding a full URL that was already encoded. The fix is a boundary rule: encode exactly once, at the moment you assemble the URL — never before, never after.",
      },
      {
        type: "code",
        lang: "javascript",
        code: `// WRONG: encoded twice — % becomes %25\nencodeURIComponent(encodeURIComponent("a b")); // "a%2520b"\n\n// RIGHT: encode once\nencodeURIComponent("a b"); // "a%20b"\n\n// Let URLSearchParams do it — it encodes values for you\nconst params = new URLSearchParams({ name: "John & Jane" });\nparams.toString(); // "name=John+%26+Jane"`,
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "What is the difference between %20 and +? Both mean a space in a query string. %20 is the percent-encoding; + is the form-encoding used by URLSearchParams and HTML forms. Servers accept both in query strings, but only %20 is valid inside a URL path.",
          "Should I use URLSearchParams instead? For query strings, yes — it is the safest option. It encodes each value once, handles the & and = cases, and removes the whole class of bugs above. Use encodeURIComponent when you need a single encoded value, for example inside a path segment or a redirect URL.",
          "When is encodeURI the right call? When you have a complete URL that contains raw spaces or unicode characters — for example a URL a user pasted — and you want to make it safe without breaking its structure.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste a value into the [URL & Base64 Encoder](https://byte-kit.dev/tools/url-base64) to see encodeURI and encodeURIComponent side by side — and to catch double-encoding before it ships. If you work with encoded data often, [How to Encode Text to Base64](/posts/how-to-encode-text-to-base64) covers the other encoding you meet everywhere: Base64.",
      },
    ],
  },
  {
    slug: "fix-unexpected-token-not-valid-json",
    title: "Fix 'Unexpected token < is not valid JSON' in JavaScript (fetch)",
    excerpt:
      "If your fetch call fails with 'Unexpected token < is not valid JSON', your API returned an HTML page, not JSON. Here is how to prove it and fix it.",
    date: "2026-10-14",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: if the first character is <, you are not parsing JSON — you got an HTML page. Your fetch call reached an error page, a login page, or a 404 page, and response.json() choked on the < of <!DOCTYPE html>. The fix is almost never in your parsing code. Read the response as text, look at what the server actually sent, then fix the URL or the server behavior that produced HTML instead of JSON.",
      },
      { type: "h2", text: "What the error means" },
      {
        type: "p",
        text: "Unexpected token < in JSON at position 0 is JavaScript telling you the very first character it saw was <, which is never valid at the start of JSON. Valid JSON starts with {, [, a quote, a digit, true, false, or null. A < means the body begins with a tag — almost always <!DOCTYPE html> or <html>. The JSON parser did its job correctly. The real problem happened one step earlier: the server answered with HTML when your code expected JSON. Treating this as a parsing bug sends you down the wrong path. Treat it as a wrong-response bug and the fix becomes obvious.",
      },
      { type: "h2", text: "Diagnose it in four steps" },
      {
        type: "p",
        text: "Before changing any code, find out what the server actually returned. Swap response.json() for response.text() for one run and inspect the body:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `const res = await fetch("/api/users");\nconst text = await res.text();\nconsole.log(res.status, res.headers.get("content-type"));\nconsole.log(text.slice(0, 200));\nconst data = JSON.parse(text); // only after you know it is JSON`,
      },
      {
        type: "list",
        items: [
          "Check the status: a 404, 500, or 301/302 redirect is a red flag — error pages are HTML.",
          "Check the content-type header: it should be application/json. If it says text/html, the server never intended to send JSON.",
          "Read the first 200 characters: a login form means your session expired; a 'Cannot GET /api/...' page means the route does not exist.",
          "Fix the upstream cause — then switch back to response.json().",
        ],
      },
      { type: "h2", text: "Match the error variant to the cause" },
      {
        type: "p",
        text: "The same family of errors has several variants, and each points at a different cause:",
      },
      {
        type: "list",
        items: [
          "Unexpected token < in JSON at position 0 — the body is an HTML page (404, 500, or login redirect).",
          "Unexpected end of JSON input — the body is empty, often a 204 No Content response. Check the status before parsing.",
          "Unexpected token u in JSON at position 0 — you parsed the literal string 'undefined', usually because a variable holding the response was never assigned.",
          "Unexpected token } in JSON — the JSON itself is malformed, often a trailing comma or a missing quote. Paste it into a validator to find the exact spot.",
        ],
      },
      { type: "h2", text: "The usual causes" },
      {
        type: "list",
        items: [
          "Wrong URL: a typo in the API path, a missing /api prefix, or a dev-server proxy that is not running returns your app's HTML shell or a 404 page.",
          "Auth redirect: the session expired and the server redirected to a login page. The browser follows the redirect silently, so fetch sees a 200 with HTML.",
          "Server crash: an unhandled exception renders the framework's HTML error page instead of a JSON error.",
          "Trailing slash or base-path mismatch: /api/users and /api/users/ can hit different routes on some servers.",
        ],
      },
      { type: "h2", text: "A fetch guard that fails loudly" },
      {
        type: "p",
        text: "Once you know the cause, make the failure loud instead of cryptic. Check the status and content-type before parsing, and throw an error that includes the actual body:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `async function fetchJson(url) {\n  const res = await fetch(url);\n  const text = await res.text();\n  if (!res.ok) {\n    throw new Error("Request failed: " + res.status + " " + res.statusText + " — " + text.slice(0, 200));\n  }\n  if (!res.headers.get("content-type")?.includes("application/json")) {\n    throw new Error("Expected JSON, got: " + text.slice(0, 200));\n  }\n  return JSON.parse(text);\n}`,
      },
      {
        type: "p",
        text: "With this guard, the next failure tells you the status code, the content type, and the first 200 characters of the body — everything you need to find the cause in seconds. You can also confirm the diagnosis from the terminal with curl -i, which shows headers and body together.",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Can JSON have comments or trailing commas? No. JSON forbids comments, trailing commas, and single-quoted strings — all three are common reasons a hand-edited file fails to parse.",
          "Does response.json() tell you the body? No. It throws on the first bad character and discards the body, which is why reading as text first is the key diagnostic step.",
          "Is the fix ever in the parser? Almost never. If the body is HTML, no parser option will help — fix the request or the server.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste the raw response into the [JSON Formatter](https://byte-kit.dev/tools/json-formatter) to validate it and see exactly where it breaks — if the body is HTML, the formatter shows you that immediately. If your JSON is valid but hard to read, [How to Format JSON in JavaScript](/posts/how-to-format-json-in-javascript) shows how to pretty-print and minify it.",
      },
    ],
  },
  {
    slug: "how-to-count-tokens-before-prompting-llm",
    title: "How to Count Tokens Before Sending a Prompt to an LLM",
    excerpt:
      "Every LLM charges by the token and thinks in a fixed-size window. Learn what a token is, why the count matters, and how to estimate it before you send.",
    date: "2026-10-14",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Every LLM charges by the token and thinks in a fixed-size window, so a prompt you never measured is a prompt you do not control. Paste a long document into a chat window and one of three things happens: it works, it gets silently truncated, or your API bill surprises you. Counting tokens before you send takes ten seconds and prevents all three. A token is not a word and not a character — it is the chunk an LLM's tokenizer actually sees — and once you understand how text turns into tokens, you can predict cost, fit prompts into context windows, and trim the fat without losing meaning.",
      },
      { type: "h2", text: "What a token actually is" },
      {
        type: "p",
        text: "Large language models never see raw text. Before your prompt reaches the model, a tokenizer splits it into tokens: common words become one token, rare words split into several, and punctuation and spaces get their own. The word 'hello' is one token. 'Unbelievable' might be three: 'un', 'believ', 'able'. Code splits even more aggressively — an identifier like getElementById can become four or five tokens. This is why two prompts with the same character count can cost very different amounts. The tokenizer is fixed per model, so the same text always produces the same tokens for a given model, but different models tokenize differently.",
      },
      { type: "h2", text: "Why the count matters" },
      {
        type: "p",
        text: "Three limits in every LLM workflow are measured in tokens. The context window caps how much the model can consider at once — input plus output combined. Pricing is per thousand tokens, usually split between cheaper input tokens and pricier output tokens. And output length caps how long a response can be. A prompt that fits in one model's 8,000-token window overflows a smaller one. A 'cheap' task repeated ten thousand times in a script is only cheap if you know the per-call token count. Counting first turns all of these from surprises into arithmetic.",
      },
      { type: "h2", text: "The rough math" },
      {
        type: "p",
        text: "When you need a quick estimate without a tokenizer, the standard rule of thumb is one token per four characters of English text, or about 0.75 words per token. A thousand words of prose is roughly 1,300 tokens. That estimate holds for plain English. It breaks for code, JSON, and other languages, which tokenize less efficiently. You can estimate in a line of JavaScript:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function estimateTokens(text) {\n  return Math.ceil(text.length / 4);\n}\n\nconst prompt = "Summarize the following report in three bullet points.";\nconsole.log(estimateTokens(prompt)); // ~14 tokens`,
      },
      {
        type: "p",
        text: "Use this only for ballpark figures. For real budgeting or window checks, count with the actual tokenizer or a counter that approximates it closely, because the four-characters rule can be off by 30% or more on dense text.",
      },
      { type: "h2", text: "What inflates your token count" },
      {
        type: "p",
        text: "Some content is token-hungry. Watch for these:",
      },
      {
        type: "list",
        items: [
          "JSON and code: brackets, quotes, and indentation each cost tokens. A 500-line JSON file can be several thousand tokens.",
          "Repetition: repeated boilerplate, headers, and disclaimers cost the same every time they appear.",
          "Non-English text: languages the tokenizer saw less often split into more tokens per word.",
          "Whitespace: long runs of spaces and blank lines still count. Minified text is cheaper than pretty-printed text.",
          "Long identifiers and URLs: a single 80-character URL can be 20 tokens on its own.",
        ],
      },
      { type: "h2", text: "Trimming a prompt without losing meaning" },
      {
        type: "p",
        text: "When a prompt is over budget, cut in this order. First, remove what the model does not need: repeated instructions, verbose greetings, and context the model cannot use. Second, compress structured data: strip JSON to the fields the task needs, and shorten long identifiers in code samples. Third, summarize instead of pasting: a three-sentence summary of a document usually carries the facts a prompt needs at a tenth of the tokens. What you should not cut is the actual instruction — vague prompts produce vague output, and saving fifty tokens is not worth a useless answer. Keep the instruction crisp and cut the filler around it.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste any prompt into the [LLM Token Counter](https://byte-kit.dev/tools/llm-token-counter) to see its estimated tokens, characters, and words before you send it. If you write prompts often, the [Prompt Template Generator](https://byte-kit.dev/tools/prompt-template-generator) builds reusable structured prompts with role, task, and constraints filled in. And if your prompt carries structured data, [How to Format JSON in JavaScript](/posts/how-to-format-json-in-javascript) shows how to minify it and cut tokens before pasting.",
      },
    ],
  },
  {
    slug: "how-to-compress-images-without-losing-quality",
    title: "How to Compress Images Without Losing Quality",
    excerpt:
      "A phone photo is 3–6 MB. Learn the three levers — format, quality, dimensions — that shrink it by 80% with no visible difference.",
    date: "2026-10-14",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "An uncompressed photo from a modern phone is 3–6 MB. Put three of those on a web page and visitors on a slow connection wait seconds for images alone. Email them and you hit attachment limits. Upload them and your storage bill grows for no reason. Compression fixes all of it, and the surprising part is how much you can shrink an image before anyone notices. The trick is knowing which lever to pull: format, quality, or dimensions — and understanding that 'without losing quality' really means 'without losing visible quality.'",
      },
      { type: "h2", text: "Lossy vs lossless" },
      {
        type: "p",
        text: "Every image format is either lossless or lossy. Lossless compression (PNG, WebP lossless) shrinks the file by encoding the same pixels more efficiently — every pixel survives, bit for bit. Lossy compression (JPG, WebP lossy, AVIF) discards information the human eye barely notices: subtle color variations, fine high-frequency detail. Lossy achieves far bigger savings — a JPG can be a tenth the size of the equivalent PNG — at the cost of quality that only shows under close inspection or repeated re-saving. For photos, lossy almost always wins. For screenshots, logos, and text, lossless is usually the right call, because sharp edges suffer visibly under lossy compression.",
      },
      { type: "h2", text: "The three levers" },
      {
        type: "p",
        text: "Compression has three controls, and they stack. First, format: the same photo saved as PNG, JPG, WebP, and AVIF can differ by 5x in size. Second, quality: a single slider that trades visible detail for bytes. Third, dimensions: a 4000px-wide photo displayed at 800px carries 25 times the pixels it needs. Most people only touch the quality slider and ignore the other two, which is leaving the biggest wins on the table.",
      },
      { type: "h2", text: "Choosing the right format" },
      {
        type: "p",
        text: "Pick the format first; it sets the ceiling on savings:",
      },
      {
        type: "list",
        items: [
          "JPG: the universal default for photos. Everywhere accepts it, good compression, no transparency.",
          "PNG: lossless, supports transparency. Best for screenshots, diagrams, and logos. Bloated for photos.",
          "WebP: modern replacement for both — typically 25–35% smaller than JPG at the same quality, with transparency. Supported everywhere modern.",
          "AVIF: the newest format, even smaller than WebP, but slower to encode and still patchy in older tools.",
        ],
      },
      { type: "h2", text: "Quality settings that actually work" },
      {
        type: "p",
        text: "For JPG and WebP, the sweet spot is quality 70–85. Below 60, blocky artifacts and color banding appear in skies and gradients. Above 90, file size doubles for detail nobody can see. The difference between quality 80 and 95 is often a 2x file with no visible change — that is wasted bandwidth. If you are unsure, export at 80, zoom to 100%, and compare against the original. For photos of people, you can often go to 70 without anyone noticing; for product photos with fine texture, stay closer to 85.",
      },
      { type: "h2", text: "Resize before you compress" },
      {
        type: "p",
        text: "Dimensions dominate file size: halving width and height quarters the pixel count. Never serve a 4000px image in an 800px slot. Resize to the largest size it will actually display at, plus a little headroom for retina screens (2x the display size is plenty). Serving responsive images lets the browser pick the right size itself:",
      },
      {
        type: "code",
        lang: "html",
        code: `<img\n  src="photo-800.jpg"\n  srcset="photo-800.jpg 800w, photo-1600.jpg 1600w"\n  sizes="(max-width: 600px) 100vw, 800px"\n  alt="A compressed photo"\n/>`,
      },
      {
        type: "p",
        text: "This one change — resizing to display size — often saves more than any quality setting.",
      },
      { type: "h2", text: "What not to do" },
      {
        type: "p",
        text: "Two mistakes undo good compression. The first is re-compressing JPGs: every save discards more detail, so editing a JPG, saving it, and re-saving it again visibly degrades it. Keep a lossless master copy and export fresh JPGs from it. The second is compressing the wrong format for the job: a PNG screenshot saved as JPG gets fuzzy text, and a photo saved as PNG is enormous for no benefit. Match format to content, compress once, and keep the original.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Drop any image into the [Image Compressor](https://byte-kit.dev/tools/image-compressor) to pick a format, quality, and max dimension and compare before-and-after sizes — everything runs locally in your browser. For a whole folder at once, the [Batch Image Converter](https://byte-kit.dev/tools/batch-image-converter) converts many images to PNG, JPG, or WebP and downloads them as one ZIP. If your photos start as HEIC, see [How to Convert HEIC Photos to JPG](/posts/how-to-convert-heic-to-jpg) first.",
      },
    ],
  },
  {
    slug: "how-to-encode-text-to-base64",
    title: "How to Encode Text to Base64",
    excerpt:
      "Base64 looks like encryption, but it is not. Learn how the encoding works, how to do it safely in JavaScript, and when to reach for it.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Paste a long string of letters, numbers, plus signs, and slashes into a chat window and a developer will recognize it instantly: Base64. It shows up in data URIs, email attachments, API tokens, and config files. It looks like encryption, but it is not — anyone can decode it in seconds. Base64 is simply a way to represent binary data as plain text, so bytes can travel through systems that only handle text. Once you understand the encoding, you will recognize it everywhere and stop treating it as security.",
      },
      { type: "h2", text: "What Base64 is — and is not" },
      {
        type: "p",
        text: "Base64 takes any bytes — text, an image, a PDF — and encodes them using only 64 safe characters: A–Z, a–z, 0–9, plus + and /. The result is plain ASCII text with no control characters, no null bytes, and nothing that breaks a JSON field, a URL parameter, or an email body. What Base64 does not do is hide anything. There is no key, no secret, no password. Decoding is a one-liner in every language. Never use Base64 to protect a secret: it is wrapping paper, not a lock. If you need secrecy, encrypt; if you need to move bytes through a text-only channel, encode.",
      },
      { type: "h2", text: "How it works: 3 bytes become 4 characters" },
      {
        type: "p",
        text: "The math is simple. Every three bytes (24 bits) are split into four groups of 6 bits, and each 6-bit group maps to one of the 64 characters. Three bytes in, four characters out — which is why Base64 output is about a third larger than the input. When the input is not a multiple of three bytes, padding with = fills the gap: one = means the last group held two bytes, two = means it held one. That is why so many Base64 strings end in = or ==. You can see the structure yourself:",
      },
      {
        type: "code",
        lang: "text",
        code: `"Man"  ->  "TWFu"       (3 bytes -> 4 chars, no padding)\n"Ma"   ->  "TWE="       (2 bytes -> 3 chars + 1 pad)\n"M"    ->  "TQ=="       (1 byte  -> 2 chars + 2 pads)`,
      },
      { type: "h2", text: "Base64 in JavaScript: btoa, atob, and the Unicode trap" },
      {
        type: "p",
        text: "JavaScript has built-in Base64 functions, but they come with a famous gotcha: btoa only handles Latin-1 characters. Feed it an emoji or non-English text and it throws. The fix is to convert the string to UTF-8 bytes first, then encode:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Safe Base64 encode/decode for any Unicode text\nfunction toBase64(str) {\n  return btoa(String.fromCodePoint(...new TextEncoder().encode(str)));\n}\nfunction fromBase64(b64) {\n  return new TextDecoder().decode(\n    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))\n  );\n}\n\ntoBase64("héllo 🌍"); // "aMOpbGxvIPCfjI0="\nfromBase64("aMOpbGxvIPCfjI0="); // "héllo 🌍"`,
      },
      {
        type: "p",
        text: "For quick one-offs you do not need code at all — an encoder tool does the same thing instantly, including the UTF-8 handling.",
      },
      { type: "h2", text: "Base64URL: the variant used by JWTs and URLs" },
      {
        type: "p",
        text: "Base64 has one weakness: + and / are special characters in URLs, and = padding confuses query strings. Base64URL fixes this by swapping + for -, / for _, and dropping the padding. The result is safe to paste into a URL unchanged. This is the variant JWTs use — every token you have seen is three Base64URL segments joined by dots. Converting between the two is a string replace plus adding or removing padding, and most encoder tools offer both variants.",
      },
      { type: "h2", text: "When to use it" },
      {
        type: "p",
        text: "Reach for Base64 when:",
      },
      {
        type: "list",
        items: [
          "Embedding small images or fonts directly in CSS or HTML as data URIs.",
          "Sending binary data through JSON APIs that only accept text.",
          "HTTP Basic Authentication, which sends username:password as Base64.",
          "Email attachments (MIME), the oldest everyday use of Base64.",
          "Storing binary blobs in config files or databases that expect text.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Encode or decode any text with the [URL & Base64 Encoder](https://byte-kit.dev/tools/url-base64) — it handles URL encoding and Base64 side by side, all locally. For images, the [Image to Base64](https://byte-kit.dev/tools/image-to-base64) tool turns any picture into a data URI you can paste straight into CSS or HTML. And since JWTs are built on Base64URL, [What Is a JWT? How to Decode One Safely](/posts/what-is-jwt-decode-safely) shows where this encoding matters most in real systems.",
      },
    ],
  },
  {
    slug: "how-to-convert-text-case",
    title: "How to Convert Text Case: camelCase, snake_case, and kebab-case",
    excerpt:
      "Every codebase mixes naming conventions. Learn the five cases, why each language picks its own, and the edge cases that break naive converters.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "camelCase, snake_case, kebab-case, PascalCase, SCREAMING_SNAKE_CASE. Every codebase mixes them, every language has its favorites, and every developer has wasted time converting between them by hand. The rules look trivial until you hit an acronym, a number, or an abbreviation — and then your converter quietly produces nonsense. Text case conversion is a small skill, but it touches variable names, file names, API fields, CSS classes, and database columns. Getting it right means understanding how each convention splits words.",
      },
      { type: "h2", text: "The five cases you will meet" },
      {
        type: "p",
        text: "Most code uses one of five conventions:",
      },
      {
        type: "list",
        items: [
          "camelCase — first word lowercase, every later word capitalized. JavaScript variables and functions.",
          "PascalCase — every word capitalized, no separators. Class names and React components.",
          "snake_case — all lowercase, words joined by underscores. Python, Ruby, database columns.",
          "kebab-case — all lowercase, words joined by hyphens. CSS classes, URLs, file names.",
          "SCREAMING_SNAKE_CASE — all uppercase with underscores. Constants and environment variables.",
        ],
      },
      { type: "h2", text: "Why each language picks its own" },
      {
        type: "p",
        text: "Conventions exist for readability and for tooling. JavaScript uses camelCase because its standard library does, and because hyphens are minus operators — my-variable would be parsed as subtraction. Python's style guide mandates snake_case for functions and variables, so Python code that uses camelCase looks foreign. CSS uses kebab-case because its property names (background-color, font-size) set the pattern. APIs often return snake_case JSON from a Python or Ruby backend while the JavaScript frontend wants camelCase, which is why conversion shows up constantly at system boundaries. The case is not cosmetic: it is part of the interface between two systems.",
      },
      { type: "h2", text: "Converting by hand: split on boundaries" },
      {
        type: "p",
        text: "Every converter does the same three steps: split the input into words, normalize each word, then join with the target separator. Splitting is the hard part. Words are separated by underscores, hyphens, spaces, and by case transitions — the boundary between a lowercase letter and an uppercase one. In JavaScript, a short regex handles all of it:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function splitWords(str) {\n  return str\n    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase boundary\n    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // acronym boundary\n    .split(/[^a-zA-Z0-9]+/) // separators: _ - space\n    .filter(Boolean);\n}\n\nsplitWords("XMLHttpRequest"); // ["XML", "Http", "Request"]\nsplitWords("API_response-time"); // ["API", "response", "time"]`,
      },
      {
        type: "p",
        text: "Once you have the word list, each case is one join away: camelCase lowercases the first word and capitalizes the rest; snake_case lowercases and joins with underscores; kebab-case lowercases and joins with hyphens.",
      },
      { type: "h2", text: "Edge cases that break naive converters" },
      {
        type: "p",
        text: "The simple version fails on real input. Watch for these:",
      },
      {
        type: "list",
        items: [
          "Acronyms — XMLHttpRequest should split as XML + Http + Request, not X + M + L + Http + Request. The acronym rule above handles it.",
          "Numbers — version2Final splits at letter-digit boundaries differently across converters; decide one behavior and stay consistent.",
          "Leading underscores — _privateVar keeps its underscore in some conventions and drops it in others.",
          "Single-letter words — a1b and similar identifiers are ambiguous by nature.",
          "Non-English text — accented characters and non-Latin scripts need Unicode-aware splitting.",
        ],
      },
      { type: "h2", text: "Converting API responses in practice" },
      {
        type: "p",
        text: "The most common real-world conversion happens at the boundary between a backend and a frontend. A Python API returns snake_case keys like user_account_id, and the React frontend wants userAccountId. The clean fix is to convert once, at the boundary, in a single helper that walks the response object and converts every key — not scattered through every component. Keep the backend's convention in the database and the API, and the frontend's convention in the UI code, with exactly one conversion layer between them. That way, when a new field appears, it converts automatically, and nobody has to remember which side of the boundary they are on.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Convert any text between all five casings instantly with the [Case Converter](https://byte-kit.dev/tools/case-converter) — paste once and get camelCase, kebab-case, snake_case, SCREAMING, and PascalCase together. The splitting above is really pattern matching, so the [Regex Tester](https://byte-kit.dev/tools/regex-tester) is the place to prototype your own boundary rules. For the full regex walkthrough, see [How to Use Regex in JavaScript](/posts/how-to-use-regex-in-javascript).",
      },
    ],
  },
  {
    slug: "how-to-use-regex-in-javascript",
    title: "How to Use Regex in JavaScript",
    excerpt:
      "Regex looks like keyboard noise, but twenty percent of it covers ninety percent of real tasks. Learn literals, methods, flags, and the three traps everyone hits.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Regular expressions have a reputation problem. They look like someone fell asleep on the keyboard, and every developer has a story about a regex that worked until it suddenly did not. But regex is simply a tiny language for describing patterns in text: find all the emails, validate this phone number, pull the IDs out of this log file. You already use it every time you search with a wildcard. Learning the twenty percent of regex you actually use covers ninety percent of real tasks, and this post is that twenty percent.",
      },
      { type: "h2", text: "What a regex actually is" },
      {
        type: "p",
        text: "A regex is a pattern, not a string. Instead of saying 'find the text abc', you say 'find a digit, followed by two letters, followed by an optional hyphen'. The engine walks through the text and reports every match. JavaScript has regex built in: /pattern/flags is a literal, and new RegExp('pattern', 'flags') builds one from a string. The pattern is made of literal characters (a, 5, @) and metacharacters with special meaning: . matches any character, \\d matches a digit, \\w matches a word character, \\s matches whitespace, ^ anchors to the start, $ anchors to the end.",
      },
      { type: "h2", text: "The two ways to write one" },
      {
        type: "p",
        text: "Use a literal when the pattern is fixed, and the constructor when it is built from variables — like a search box input. The constructor needs double-escaped backslashes, which is the most common source of confusion:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `const literal = /\\d{3}-\\d{4}/; // matches 555-1234\nconst fromString = new RegExp("\\\\d{3}-\\\\d{4}"); // same pattern\n\nliteral.test("Call 555-1234"); // true`,
      },
      {
        type: "p",
        text: "Prefer literals unless the pattern is dynamic. They are easier to read and you skip the escaping headache.",
      },
      { type: "h2", text: "The methods you will use every day" },
      {
        type: "p",
        text: "Five methods cover nearly all regex work:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `const text = "Order 42 ships on 2026-01-05.";\n\n/\\d+/.test(text); // true — is there a number?\ntext.match(/\\d+/g); // ["42", "2026", "01", "05"]\ntext.matchAll(/\\d+/g); // iterator with positions\ntext.replace(/\\d+/, "#"); // "Order # ships on 2026-01-05."\ntext.split(/\\s+/); // ["Order", "42", "ships", "on", "2026-01-05."]`,
      },
      {
        type: "p",
        text: "Note the difference between match and matchAll: match with the g flag returns only the matched strings, while matchAll returns match objects with capture groups and positions — what you want when you need to extract structured data.",
      },
      { type: "h2", text: "Flags that change everything" },
      {
        type: "p",
        text: "Flags after the closing slash change how the pattern behaves:",
      },
      {
        type: "list",
        items: [
          "g — global: find all matches, not just the first.",
          "i — case-insensitive: /abc/i matches ABC, Abc, aBc.",
          "m — multiline: ^ and $ match line starts and ends, not just the whole string.",
          "s — dotAll: . also matches newlines, which it does not by default.",
          "u — unicode: correct handling of emoji and astral characters.",
        ],
      },
      { type: "h2", text: "The mistakes everyone makes" },
      {
        type: "p",
        text: "Three traps catch nearly everyone. First, greedy quantifiers: .* matches as much as possible, so /<.*>/ on '<b>hi</b>' matches the whole string, not just '<b>'. Add ? to make it lazy: /<.*?>/ stops at the first closing bracket. Second, forgetting to escape: a dot in a domain pattern must be \\., or 'example.com' matches 'exampleXcom'. Third, catastrophic backtracking: nested quantifiers like (a+)+ on long non-matching input can hang your program. If a regex feels slow, it is usually nested quantifiers, and the fix is to simplify the pattern or cap the input length.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Test any pattern with live matches, flags, and match counts in the [Regex Tester](https://byte-kit.dev/tools/regex-tester) — paste your pattern and your text and see matches instantly. The same site has a [Case Converter](https://byte-kit.dev/tools/case-converter) for renaming the identifiers your patterns extract. And if the text you are matching is JSON, [How to Format JSON in JavaScript](/posts/how-to-format-json-in-javascript) shows how to pretty-print it first so patterns are easier to see.",
      },
    ],
  },
  {
    slug: "how-to-format-json-in-javascript",
    title: "How to Format JSON in JavaScript",
    excerpt:
      "JSON.stringify does more than you think. Learn how to pretty-print, minify, validate, and sort JSON in plain JavaScript.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "JSON is everywhere: API responses, config files, package.json, localStorage. And it usually arrives as one long, unreadable line. Formatting JSON means two things: checking that it is valid, and printing it in a shape humans can read. JavaScript gives you everything you need for both, built in.",
      },
      { type: "h2", text: "The one-liner: JSON.stringify with spacing" },
      {
        type: "p",
        text: "JSON.stringify takes three arguments: the value, a replacer, and a space argument. Pass 2 as the third argument and you get clean, indented output. This is the line you will use most often:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `const data = { name: "Ada", languages: ["JavaScript", "Rust"], active: true };\n\nconsole.log(JSON.stringify(data, null, 2));\n// {\n//   "name": "Ada",\n//   "languages": [\n//     "JavaScript",\n//     "Rust"\n//   ],\n//   "active": true\n// }`,
      },
      {
        type: "p",
        text: "The second argument, null here, is a replacer function or array that filters which keys get included. Passing null keeps everything. The third argument controls indentation: a number means that many spaces, while a string like \"\\t\" indents with tabs instead.",
      },
      { type: "h2", text: "Formatting a JSON string you already have" },
      {
        type: "p",
        text: "Often you do not have an object, you have a string: the raw body of a fetch response, or text pasted from a log. Formatting that takes two steps: parse it, then stringify it again with spacing. Always wrap the parse in try/catch, because JSON.parse throws on invalid input:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function formatJSON(str, indent = 2) {\n  try {\n    return JSON.stringify(JSON.parse(str), null, indent);\n  } catch (err) {\n    throw new Error("Invalid JSON: " + err.message);\n  }\n}\n\nconsole.log(formatJSON('{"b":2,"a":1}'));\n// {\n//   "b": 2,\n//   "a": 1\n// }`,
      },
      {
        type: "p",
        text: "One detail worth knowing: JSON.parse does not preserve key order guarantees for integer-like keys, which JavaScript engines sort numerically. For display purposes this rarely matters, but do not rely on key order for logic.",
      },
      { type: "h2", text: "The four errors that break JSON" },
      {
        type: "p",
        text: "When JSON.parse throws, the cause is almost always one of these. JavaScript object literals allow all of them; JSON allows none of them:",
      },
      {
        type: "list",
        items: [
          "Trailing commas — {\"a\": 1,} is invalid. JSON forbids a comma after the last item.",
          "Single quotes — JSON requires double quotes around every key and string.",
          "Unquoted keys — {name: \"Ada\"} is valid JavaScript but not valid JSON.",
          "Comments — JSON has no comment syntax. A // line inside JSON breaks the parser.",
        ],
      },
      {
        type: "p",
        text: "The error message tells you the character position where parsing failed. If you are staring at a large payload, paste it into a validator that points at the exact line instead of hunting by eye.",
      },
      { type: "h2", text: "Minifying and sorting keys" },
      {
        type: "p",
        text: "Going the other direction, call JSON.stringify with no spacing argument to get the most compact form. That is what you want before storing JSON in a URL, a cookie, or a database field where every byte counts:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `const pretty = '{\n  "a": 1,\n  "b": 2\n}';\nconst minified = JSON.stringify(JSON.parse(pretty));\nconsole.log(minified); // {"a":1,"b":2}`,
      },
      {
        type: "p",
        text: "If you diff JSON files in version control, sorted keys make the diff readable. Pass a replacer array of sorted keys, or sort the object yourself before stringifying. In real projects, most JSON formatting happens in two places: your editor, where a formatter extension keeps config files tidy, and your debugging workflow, where you format API responses to actually read them. Both use exactly the techniques above. For a quick one-off check, you do not need any of this code at all.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste any JSON into the [JSON Formatter](https://byte-kit.dev/tools/json-formatter) to validate, beautify, or minify it instantly in your browser, with nothing uploaded. If you need the same data in another shape, the [JSON / YAML / CSV converter](https://byte-kit.dev/tools/json-yaml-csv) converts it to YAML or CSV in one click. And if the JSON you are formatting came from an API token, read [What Is a JWT? How to Decode One Safely](/posts/what-is-jwt-decode-safely) next — JWT payloads are JSON, and the same formatting skills apply.",
      },
    ],
  },
  {
    slug: "what-is-jwt-decode-safely",
    title: "What Is a JWT? How to Decode One Safely",
    excerpt:
      "A JWT is three Base64 segments separated by dots. Learn what each part does, how to decode the payload, and what never to trust.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "If you have ever logged into a web app and inspected the network requests, you have probably seen a long token that starts with eyJ. That is a JWT, a JSON Web Token: the standard way APIs carry proof that you are logged in. Understanding its structure takes five minutes and saves you from a whole category of security mistakes.",
      },
      { type: "h2", text: "Anatomy: three parts, two dots" },
      {
        type: "p",
        text: "A JWT has exactly three segments separated by dots: header.payload.signature. Each segment is Base64URL-encoded, which is Base64 with URL-safe characters and no padding. Decoding the first two segments is just Base64 decoding — no secret required:",
      },
      {
        type: "code",
        lang: "text",
        code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   <- header\n  .eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSIsImlhdCI6MTUxNjIzOTAyMn0   <- payload\n  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   <- signature`,
      },
      {
        type: "p",
        text: "The header says which algorithm signed the token, usually HS256 or RS256. The payload carries claims, which are statements about the user and the token. The signature is what makes the token trustworthy — it is computed from the header, the payload, and a secret key that only the server knows.",
      },
      { type: "h2", text: "What lives in the payload" },
      {
        type: "p",
        text: "Decoding the payload above gives you plain JSON with claims like these:",
      },
      {
        type: "code",
        lang: "json",
        code: `{\n  "sub": "1234567890",\n  "name": "Ada",\n  "iat": 1516239022,\n  "exp": 1516242622\n}`,
      },
      {
        type: "p",
        text: "The standard claims are sub (subject, usually the user ID), iat (issued at), and exp (expiry), both as Unix timestamps in seconds. Custom claims like name or role are common too. If you need to read a payload like this, the same formatting rules from [How to Format JSON in JavaScript](/posts/how-to-format-json-in-javascript) apply — it is JSON all the way down.",
      },
      { type: "h2", text: "Decoding is not verifying" },
      {
        type: "p",
        text: "This is the critical distinction. Anyone can decode a JWT and read its payload — that is by design. Decoding proves nothing. Verifying means recomputing the signature with the secret key and confirming the token was not tampered with. Only the server can do that. Never trust a decoded payload on the client: a user can edit their own token in seconds and give themselves admin: true. Your server must verify the signature on every request.",
      },
      { type: "h2", text: "How to decode one safely" },
      {
        type: "p",
        text: "JWTs often contain user IDs, emails, or roles. Pasting a production token into a random website hands that data to a stranger, and some sites log everything pasted into them. The safe rule is simple: decode tokens locally, in your own browser, where the token never leaves your device. A local decoder can show you the header and payload instantly without sending anything anywhere.",
      },
      {
        type: "p",
        text: "Two more habits that prevent real incidents: never put secrets, passwords, or API keys in a payload — it is readable by anyone who holds the token. And check exp before trusting a token: if Date.now() / 1000 is past the exp value, the token is expired and should be rejected, even if its signature is valid. On the storage side, prefer httpOnly cookies over localStorage for tokens in browsers: any JavaScript on the page, including a compromised third-party script, can read localStorage, while httpOnly cookies are invisible to JavaScript entirely.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste a token into the [JWT Decoder](https://byte-kit.dev/tools/jwt-decoder) to see its header and payload decoded locally — nothing is uploaded. Since JWTs are Base64 under the hood, the [URL & Base64 Encoder](https://byte-kit.dev/tools/url-base64) is handy when you need to encode or decode the individual segments by hand.",
      },
    ],
  },
  {
    slug: "how-to-convert-heic-to-jpg",
    title: "How to Convert HEIC Photos to JPG",
    excerpt:
      "iPhones save photos as HEIC, and half the web still wants JPG. Here are the fastest ways to convert — including one that never uploads your photos.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "You take a photo on your iPhone, transfer it to your Windows PC, and it will not open. Or you try to upload it to a website and get an unsupported format error. The file ends in .heic. This is normal, it is fixable in seconds, and you do not need to install anything sketchy to do it.",
      },
      { type: "h2", text: "What HEIC is, and why Apple uses it" },
      {
        type: "p",
        text: "HEIC (High Efficiency Image Container) is the format iPhones have used by default since iOS 11. It is based on the HEVC video codec and stores the same quality as JPG at roughly half the file size, plus extras like Live Photos and depth data. The trade-off is compatibility: Apple devices handle it natively, but Windows, many web uploaders, and older software do not. JPG is the format everything accepts.",
      },
      { type: "h2", text: "Option 1: stop shooting in HEIC" },
      {
        type: "p",
        text: "If you would rather never deal with this again, change the setting once. On your iPhone, go to Settings, then Camera, then Formats, and choose Most Compatible. New photos will save as JPG. Your existing photos stay HEIC, so you will still need to convert the ones you already have.",
      },
      { type: "h2", text: "Option 2: convert on your device" },
      {
        type: "p",
        text: "On a Mac, open the photo in Preview, choose File, then Export, and pick JPEG as the format. On Windows 10 or 11, the Photos app can open HEIC files if the HEIF Image Extensions from the Microsoft Store are installed, and then you can save a copy as JPG. Both work fine for one or two photos, but they get tedious for a whole album.",
      },
      { type: "h2", text: "Option 3: convert in the browser, without uploading" },
      {
        type: "p",
        text: "The fastest option for a batch of photos is a converter that runs entirely in your browser. Your photos are decoded locally and never sent to a server, which matters: family photos are not something to hand to a random conversion site. Drop the .heic files in, pick JPG, PNG, or WebP as the target, and download the results.",
      },
      {
        type: "p",
        text: "One practical tip: converting HEIC to JPG and then re-saving that JPG again and again degrades quality, because JPG is lossy. Convert once, keep the original HEIC as your archive copy, and use the JPG for sharing or uploading. For a whole album, convert in one batch rather than file by file, and keep the filenames identical apart from the extension — that way the converted set stays in the same order as the originals and nothing gets lost.",
      },
      { type: "h2", text: "After converting, shrink the file" },
      {
        type: "p",
        text: "A JPG straight out of a modern iPhone is often 3–6 MB — too big for email attachments and slow on web pages. After converting, compressing it to a sensible quality and size usually cuts the file by 60–80% with no visible difference. That is a separate step from converting, and it is worth doing for anything you publish or send.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Drop your photos into the [HEIC Converter](https://byte-kit.dev/tools/heic-converter) to convert them to JPG, PNG, or WebP locally in your browser. Then run the results through the [Image Compressor](https://byte-kit.dev/tools/image-compressor) to shrink them for sharing. One more thing worth doing before you share any photo: read [How to Remove EXIF Data from Photos Before Sharing](/posts/how-to-remove-exif-data-from-photos) — HEIC files carry location data, and converting does not remove it.",
      },
    ],
  },
  {
    slug: "px-to-rem-why-it-matters",
    title: "PX to REM: Why It Matters and How to Convert",
    excerpt:
      "Pixels ignore your users' font-size settings. REM units respect them. Learn the conversion, when REM wins, and when PX is still fine.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Most CSS you write uses px: 16px font, 24px padding, 8px gap. It works, and it looks fine on your screen. But px has a quiet flaw: it is absolute. It ignores the font-size preference of the person reading your site. REM units fix that, and converting between the two is one division.",
      },
      { type: "h2", text: "What REM actually is" },
      {
        type: "p",
        text: "REM stands for root em. One rem equals the font size of the root element, the html tag. Browsers default that to 16px, so 1rem = 16px, 1.5rem = 24px, and 0.5rem = 8px. The formula is simple:",
      },
      {
        type: "code",
        lang: "text",
        code: `rem = px / root font-size\n\n24px / 16 = 1.5rem\n32px / 16 = 2rem\n12px / 16 = 0.75rem`,
      },
      {
        type: "p",
        text: "Unlike em, which compounds relative to the parent element and gets confusing fast, rem always refers to the root. That makes it predictable: 1.5rem means the same thing everywhere in your stylesheet.",
      },
      { type: "h2", text: "Why REM matters: accessibility" },
      {
        type: "p",
        text: "Here is the scenario that makes REM worth adopting. A user with low vision goes into their browser settings and sets their default font size to 20px or 24px. Every rem-based size on your page scales up with that setting: text gets bigger, spacing grows to match, and the layout stays coherent. Pixel-based sizes do not budge. Your 16px text stays 16px no matter what the user asked for.",
      },
      {
        type: "p",
        text: "Browser zoom is not the same thing. Zoom scales everything, including px. But many users do not know about zoom, or use the font-size setting instead, and users on mobile rely on system text-size settings that only affect relative units. Designing in rem respects the settings people actually use.",
      },
      { type: "h2", text: "Converting in practice" },
      {
        type: "p",
        text: "In a stylesheet, the conversion looks like this. The two blocks below produce the same result at the default 16px root size, but only the rem version adapts when the user changes their font size:",
      },
      {
        type: "code",
        lang: "css",
        code: `/* Pixels: fixed, ignores user font-size setting */\n.card {\n  padding: 24px;\n  font-size: 16px;\n  border-radius: 8px;\n}\n\n/* REM: scales with the user's font-size setting */\n.card {\n  padding: 1.5rem;\n  font-size: 1rem;\n  border-radius: 0.5rem;\n}`,
      },
      {
        type: "p",
        text: "If your project changes the root font size, the conversion changes with it. With html set to 18px, 24px becomes 24 / 18 = 1.333rem. If you use 62.5% on the root — a common trick that makes 1rem = 10px — then 24px is simply 2.4rem. Whatever base you choose, keep it consistent across the project. Component libraries and design systems usually pick one convention and document it, because mixing bases across a codebase turns every conversion into a guessing game.",
      },
      { type: "h2", text: "When PX is still the right call" },
      {
        type: "p",
        text: "REM is not a religion. Borders, hairline dividers, and box shadows usually belong in px: a 1px border should stay 1px even when the user scales their text, or it starts looking chunky. Media query breakpoints are also typically written in px or em, since rem in media queries behaves inconsistently across browsers. The practical rule: use rem for anything that scales with text — font sizes, padding, margins, gaps — and px for fixed details.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Convert any value with the [PX to REM Converter](https://byte-kit.dev/tools/px-to-rem) — set your root size and get the rem value instantly. Spacing is one half of consistent design tokens; the other half is color, so the [Color Converter](https://byte-kit.dev/tools/color-converter) covers HEX, RGB, and HSL in one place. More practical guides: [How to Convert HEIC Photos to JPG](/posts/how-to-convert-heic-to-jpg).",
      },
    ],
  },
  {
    slug: "how-to-remove-exif-data-from-photos",
    title: "How to Remove EXIF Data from Photos Before Sharing",
    excerpt:
      "Every photo you share can carry your GPS location, device, and timestamps in hidden EXIF metadata. Learn what it contains and how to strip it.",
    date: "2026-10-14",
    readingTime: "4 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "You post a photo of your new apartment, your kid's school, or your car. The image looks harmless. But embedded inside the file is a block of hidden metadata called EXIF, and it may include the exact GPS coordinates where the photo was taken. Anyone who downloads the image can read it. Stripping EXIF before sharing takes seconds, and it is one of the simplest privacy habits you can build.",
      },
      { type: "h2", text: "What EXIF actually contains" },
      {
        type: "p",
        text: "EXIF, the Exchangeable Image File Format, is metadata your camera or phone writes into every photo automatically. Depending on the device, it can include:",
      },
      {
        type: "list",
        items: [
          "GPS coordinates — latitude and longitude, often accurate to a few meters.",
          "Device model and software version — e.g. iPhone 15, iOS 18.2.",
          "Date and time the photo was taken, down to the second.",
          "Camera settings — aperture, shutter speed, ISO, focal length.",
          "Orientation and thumbnail data.",
        ],
      },
      {
        type: "p",
        text: "Some platforms strip EXIF automatically — social networks like Instagram and Facebook generally do. But messaging apps, email, forums, marketplaces, and direct file sharing often do not. Assume the metadata travels with the file unless you removed it yourself.",
      },
      { type: "h2", text: "Why it matters" },
      {
        type: "p",
        text: "GPS coordinates in a photo are the big one. A single photo of your home, your workplace, or your children's school can reveal the location to anyone who receives it. Timestamps matter too: a photo with a precise time and place is a record of where you were. Device information is lower-stakes but still useful to someone profiling you. None of this is theoretical — EXIF-based location leaks have shown up in news stories, court cases, and privacy research for years.",
      },
      { type: "h2", text: "How to strip EXIF" },
      {
        type: "p",
        text: "The method depends on where you share from. On an iPhone, you can share a photo without its location: in the Photos app, tap Share, then Options, and turn off Location. That removes the GPS data but leaves other metadata. On Windows, right-click a photo, open Properties, go to the Details tab, and choose Remove Properties and Personal Information. On a Mac, Preview can export a copy without EXIF by re-exporting the image.",
      },
      {
        type: "p",
        text: "The cleanest method, and the one that works for any photo from any device, is to re-encode the image. When an image is re-encoded — decoded to raw pixels and saved again — the metadata is not carried over, because it was never part of the pixels. A tool that strips metadata this way in your browser never sees your photo leave your device, which is the whole point: you should not upload a photo full of location data to a site just to remove the location data.",
      },
      { type: "h2", text: "What stripping does not remove" },
      {
        type: "p",
        text: "EXIF stripping is not invisibility. It removes the hidden metadata, not anything visible in the image: street signs, house numbers, license plates, faces, and reflections are all still there. If a photo shows your address on a package, no metadata tool fixes that. Check the visible content too. Also note that screenshots usually contain no EXIF at all, since they are generated by the OS rather than a camera — but they can still show sensitive content on screen.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Drop any photo into the [EXIF Remover](https://byte-kit.dev/tools/exif-remover) to strip its metadata locally — the image is re-encoded in your browser and nothing is uploaded. If the photo is an iPhone HEIC file, convert it first with the [HEIC Converter](https://byte-kit.dev/tools/heic-converter), then strip it. And if your photos are HEIC in the first place, see [How to Convert HEIC Photos to JPG](/posts/how-to-convert-heic-to-jpg) for the full conversion walkthrough.",
      },
    ],
  },
  {
    slug: "how-to-check-if-jwt-is-expired",
    title: "How to Check If a JWT Is Expired (the exp Claim)",
    excerpt:
      "A JWT carries its expiry in the exp claim — seconds since the Unix epoch. Decode the payload, compare exp with the current time, and watch out for the seconds-vs-milliseconds trap.",
    date: "2026-10-15",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "A JWT is expired when its exp claim — the expiry timestamp in seconds since the Unix epoch — is smaller than the current time in seconds. Decode the payload (it is only base64-encoded, not encrypted), read exp, and compare it with the current time: exp < Math.floor(Date.now() / 1000) means the token is expired. The single biggest gotcha is units: exp is in seconds, but JavaScript's Date.now() returns milliseconds. Compare them directly and every token looks expired.",
      },
      { type: "h2", text: "What exp actually is" },
      {
        type: "p",
        text: "exp is one of the registered claims defined by the JWT standard (RFC 7519). Its value is a NumericDate: the number of seconds since 1970-01-01T00:00:00Z, not counting leap seconds. On or after that moment, the token must not be accepted for processing. Note that exp is optional — a token without an exp claim never expires according to this check. Whether you accept such tokens is a policy decision: strict systems reject tokens with no exp outright.",
      },
      { type: "h2", text: "The one-line check" },
      {
        type: "p",
        text: "A JWT has three dot-separated parts: header, payload, signature. The payload is base64url-encoded JSON, so decoding it takes one line. Note the two character replacements — JWT uses base64url, which swaps + and / for - and _.",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function isExpired(token) {\n  const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");\n  const payload = JSON.parse(atob(b64));\n  if (typeof payload.exp !== "number") return false; // no expiry claim\n  return payload.exp < Math.floor(Date.now() / 1000);\n}\n\nisExpired(token); // true → expired, do not accept`,
      },
      { type: "h2", text: "The milliseconds trap" },
      {
        type: "p",
        text: "This is the bug behind most reports of a token saying expired right after login, and it is the same ×1000 mix-up that haunts every Unix timestamp. Date.now() returns milliseconds; exp is in seconds. Compare them raw and exp is always a thousand times smaller than now — so every token reads as long expired.",
      },
      {
        type: "code",
        lang: "javascript",
        code: `// WRONG: seconds vs milliseconds — always true, every token "expired"\n1699999999 < Date.now(); // true\n\n// RIGHT: same units on both sides\npayload.exp < Math.floor(Date.now() / 1000); // seconds vs seconds\npayload.exp * 1000 < Date.now();             // ms vs ms`,
      },
      {
        type: "p",
        text: "Quick way to tell which unit a timestamp is in: count the digits. Around 2026, seconds look like 1790000000 (10 digits) and milliseconds look like 1790000000000 (13 digits). If you see 13 digits where you expected 10, divide by 1000.",
      },
      { type: "h2", text: "exp vs iat vs nbf" },
      {
        type: "p",
        text: "JWT defines three time claims, and all three are NumericDate values in seconds:",
      },
      {
        type: "list",
        items: [
          "exp (Expiration Time) — do not accept the token on or after this time.",
          "iat (Issued At) — when the token was created; useful for computing age.",
          "nbf (Not Before) — do not accept the token before this time.",
        ],
      },
      {
        type: "p",
        text: "Most auth libraries validate exp (and nbf) automatically. Hand-rolled checks usually remember exp and forget nbf — if your tokens carry both, check both.",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Can I check expiry without the secret? Yes. The payload is only encoded, not encrypted, so anyone holding the token can read exp. But reading exp and trusting the token are different things: checking exp tells you whether it is stale, verifying the signature (which needs the secret or public key) tells you whether it is genuine. Do both.",
          "What if exp is missing? The token has no expiry by this check. Decide a policy: many systems reject tokens without exp because a forever-token is a liability if leaked.",
          "Should I allow clock skew? Yes — 30 to 60 seconds of leeway is standard, because the issuing server's clock and yours rarely agree exactly. Auth libraries expose this as leeway or clockTolerance.",
          "Why does a fresh token say expired? Three usual causes: the seconds-vs-milliseconds bug above, the server clock running ahead of yours, or displaying the epoch in the wrong timezone — the claim itself is UTC, so convert before blaming the token.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste the token into the [JWT Decoder](https://byte-kit.dev/tools/jwt-decoder) — the payload is decoded in your browser with nothing uploaded, and exp is shown as a readable date so you can see at a glance whether it is stale. New to how JWTs are put together? Start with [What Is a JWT? How to Decode One Safely](/posts/what-is-jwt-decode-safely).",
      },
    ],
  },
  {
    slug: "convert-yaml-to-json",
    title: "How to Convert YAML to JSON: Python, Node, yq, and Online (Without Uploading Secrets)",
    excerpt:
      "Convert YAML to JSON with Python's yaml.safe_load, Node's js-yaml, or yq -o=json — plus what gets lost in the trip (comments, anchors, yes/no coercion) and how to convert in your browser without uploading secrets.",
    date: "2026-10-15",
    readingTime: "6 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: parse the YAML and dump it as JSON. In Python that is yaml.safe_load followed by json.dumps; in Node it is js-yaml's load plus JSON.stringify; on the command line it is yq -o=json. For a one-off conversion, paste the YAML into an in-browser converter — nothing leaves your device, which matters when the file holds API keys or database passwords. The conversion itself is mechanical; the surprises are in what YAML allows and JSON does not: comments, anchors, multi-document files, and plain values like yes that silently become booleans.",
      },
      { type: "h2", text: "Pick your method" },
      {
        type: "list",
        items: [
          "Python — you already have it and PyYAML installed: yaml.safe_load + json.dumps. Best for scripts and CI pipelines.",
          "Node — js-yaml is the standard: yaml.load + JSON.stringify. Best when the project is already JavaScript.",
          "yq — the jq of YAML: yq -o=json file.yaml. Best for shell pipelines and Kubernetes manifests.",
          "Online converter — paste and convert in the browser. Best for one-offs, especially when the file contains secrets.",
          "PowerShell — has no built-in YAML cmdlet, so do not plan around one: install yq via winget or use Python.",
        ],
      },
      { type: "h2", text: "Python" },
      {
        type: "code",
        lang: "python",
        code: `import yaml, json\n\nwith open("config.yaml") as f:\n    data = yaml.safe_load(f)  # never yaml.load without a Loader — safe_load blocks arbitrary code execution\n\nprint(json.dumps(data, indent=2))`,
      },
      {
        type: "p",
        text: "Use safe_load, not load. Plain yaml.load can construct arbitrary Python objects from a malicious file — safe_load only builds plain dicts, lists, strings, and numbers. If a teammate's config.yaml came from the internet, this one-word difference is a real security boundary.",
      },
      { type: "h2", text: "Node.js" },
      {
        type: "code",
        lang: "javascript",
        code: `import yaml from "js-yaml";\nimport { readFileSync } from "node:fs";\n\nconst data = yaml.load(readFileSync("config.yaml", "utf8"));\nconsole.log(JSON.stringify(data, null, 2));`,
      },
      { type: "h2", text: "yq on the command line" },
      {
        type: "code",
        lang: "bash",
        code: `# one file to stdout\nyq -o=json config.yaml\n\n# one file to disk\nyq -o=json config.yaml > config.json\n\n# every manifest in a directory (the Kubernetes habit)\nfor f in manifests/*.yaml; do\n  yq -o=json "$f" > "\${f%.yaml}.json"\ndone`,
      },
      { type: "h2", text: "What gets lost in conversion" },
      {
        type: "p",
        text: "JSON is a smaller language than YAML, so some things cannot survive the trip. Nothing errors — they just quietly disappear or change shape:",
      },
      {
        type: "list",
        items: [
          "Comments — JSON has no comments, so every # note is dropped silently.",
          "Anchors and aliases (&base / *base) — they are resolved and duplicated into plain repeated values in the JSON output.",
          "Multi-document files (--- separators) — JSON has a single root. Most tools emit one JSON object per document or take the first; check before you trust the output.",
          "Date and bool coercion — YAML 1.1 treats yes, no, on, and off as booleans, and unquoted 2026-10-15 as a date. If a value must stay a string, quote it in the YAML before converting.",
        ],
      },
      { type: "h2", text: "The two errors everyone hits" },
      {
        type: "code",
        lang: "text",
        code: `# PyYAML\nfound character '\\t' that cannot start any token\n\n# js-yaml\nbad indentation of a mapping entry`,
      },
      {
        type: "p",
        text: "YAML forbids tabs for indentation — both of these errors mean a tab slipped in. Replace tabs with spaces (2 is the convention) and the parse succeeds. The other classic is the yes-becomes-true coercion above: a config value of on: yes arrives in your JSON as true, and your string comparison silently fails. Quote it: on: \"yes\".",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Can I convert without installing anything? Yes — paste the YAML into an in-browser converter. The parsing happens in your tab, so nothing is uploaded; that is the whole point when the file contains secrets.",
          "Is it safe to paste a kubeconfig into an online converter? Only if it runs entirely in your browser with no upload. Never paste secrets into a server-side converter — assume anything you send is logged.",
          "What about JSON to YAML? The reverse is safe and lossless for data: yq -o=yaml file.json, or yaml.dump(JSON.parse(text)) in Node with js-yaml.",
          "Why did my on: yes become true? YAML 1.1 boolean coercion: yes, no, on, and off are booleans in PyYAML and js-yaml's default schema. Quote the value to keep it a string.",
          "Do I need yq or will jq work? jq reads JSON, not YAML. Pipe them together — yq -o=json file.yaml | jq '.spec.replicas' — when you want jq's querying on YAML input.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste the YAML into the [JSON / YAML / CSV Converter](https://byte-kit.dev/tools/json-yaml-csv) — it converts entirely in your browser, so configs with secrets never leave your device. If the JSON it produces looks wrong, [How to Format JSON in JavaScript](/posts/how-to-format-json-in-javascript/) shows how to validate and pretty-print it.",
      },
    ],
  },
  {
    slug: "invisible-characters-breaking-your-code",
    title: "Invisible Characters Are Breaking Your Code: How to Find and Remove Them",
    excerpt:
      "Zero-width spaces and hidden Unicode characters sneak in through copy-paste and silently break string comparisons, logins, and builds. Here is how to spot and strip them.",
    date: "2026-10-16",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "The code looks perfect. The string looks right. The test still fails. Before you question your sanity, consider that the bug might be a character you literally cannot see: a zero-width space that rode in on a copy-paste from a doc, a chat message, or a website. Invisible Unicode characters are one of the most annoying classes of bugs in programming, precisely because everything renders normally while nothing matches.",
      },
      { type: "h2", text: "The usual suspects" },
      {
        type: "list",
        items: [
          "Zero-width space (U+200B) — the most common. Copy-paste from web pages, Notion, Google Docs, or chat apps drops these into identifiers, passwords, and config values.",
          "Zero-width joiner and non-joiner (U+200C, U+200D) — these glue emoji sequences together; outside emoji they are invisible noise.",
          "Byte-order mark (U+FEFF) — sits at the very start of files saved as UTF-8 with BOM. Breaks shebangs, JSON parsers, and CSV headers.",
          "Word joiner (U+2060) and soft hyphen (U+00AD) — inserted by word processors and rich-text editors to control line breaks.",
          "Bidirectional control characters (U+202A to U+202E) — the dangerous ones. They can reorder how code displays in an editor, making malicious code look benign. This is the 'Trojan Source' attack (CVE-2021-42574); most linters and compilers now flag it.",
        ],
      },
      { type: "h2", text: "How to find them" },
      {
        type: "p",
        text: "Your eyes will not help — you need to inspect the code points, not the glyphs. In JavaScript, search for the known ranges, or dump the string as code points to see exactly what is in there:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Detect the common invisible characters\nconst invisible = /[\\u200B-\\u200D\\u2060\\uFEFF\\u00AD]/;\ninvisible.test("pass\\u200Bword"); // true — a zero-width space hides after "pass"\n\n// See the code points, not the glyphs\n[..."na\\u200Bme"].map((ch) => "U+" + ch.codePointAt(0).toString(16).toUpperCase());\n// ["U+6E", "U+61", "U+200B", "U+6D", "U+65"] — the culprit is obvious now`,
      },
      { type: "h2", text: "The string-comparison trap" },
      {
        type: "p",
        text: "This is the failure mode that costs people hours: two strings that render identically but are not equal. \"admin\" and \"admin\\u200B\" look the same in a log, in a diff, and in a database row — but === says false. Login forms, API keys pasted from dashboards, and unique constraints in databases all break this way. When a comparison fails and the two values look identical, check the code points before you rewrite the logic.",
      },
      { type: "h2", text: "How to remove them" },
      {
        type: "p",
        text: "Once you know which characters to target, removal is one line. Strip the usual suspects with a regex, and treat the bidirectional controls separately — they have no legitimate use in source code or config, so flagging them is better than silently deleting them:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Strip the usual suspects, keep normal text\nconst clean = (s) => s.replace(/[\\u200B-\\u200D\\u2060\\uFEFF\\u00AD]/g, "");\nclean("pass\\u200Bword"); // "password"\n\n// Bidirectional controls: warn loudly instead of silently stripping\nconst hasBidi = /[\\u202A-\\u202E\\u2066-\\u2069]/.test(s);\nif (hasBidi) throw new Error("Refusing input with bidi control characters");`,
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste suspicious text into the [Invisible Character Cleaner](https://byte-kit.dev/tools/invisible-character-cleaner) — it highlights every hidden character it finds and strips them locally in your browser, nothing uploaded. If the invisible characters are inside a pattern you are debugging, the [Regex Tester](https://byte-kit.dev/tools/regex-tester) shows matches live so you can see exactly where they sit.",
      },
    ],
  },
  {
    slug: "hex-to-rgb-how-conversion-works",
    title: "HEX to RGB: How the Conversion Actually Works",
    excerpt:
      "A hex color is just three base-16 numbers for red, green, and blue. Split it into pairs, convert each pair to decimal, and you have RGB — plus the shorthand and alpha traps.",
    date: "2026-10-17",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: a hex color like #FF5733 is three numbers written in base 16 — FF red, 57 green, 33 blue. Split the hex into pairs, convert each pair from hexadecimal to decimal (0–255), and you get rgb(255, 87, 51). Same color, different notation. Everything else on this page is detail around that one idea.",
      },
      { type: "h2", text: "The 30-second conversion" },
      {
        type: "p",
        text: "Take #FF5733 and split it after the #: FF | 57 | 33. Each pair is a hexadecimal number — two base-16 digits. Convert each pair with (first digit × 16) + second digit, where A=10 through F=15:",
      },
      {
        type: "list",
        items: [
          "FF → 15 × 16 + 15 = 255 (red)",
          "57 → 5 × 16 + 7 = 87 (green)",
          "33 → 3 × 16 + 3 = 51 (blue)",
        ],
      },
      {
        type: "p",
        text: "So #FF5733 is rgb(255, 87, 51). In code, the whole thing is six lines:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function hexToRgb(hex) {\n  hex = hex.replace("#", "");\n  const r = parseInt(hex.slice(0, 2), 16);\n  const g = parseInt(hex.slice(2, 4), 16);\n  const b = parseInt(hex.slice(4, 6), 16);\n  return { r, g, b };\n}\nhexToRgb("#FF5733"); // { r: 255, g: 87, b: 51 }\n\nfunction rgbToHex(r, g, b) {\n  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");\n}\nrgbToHex(255, 87, 51); // "#ff5733"`,
      },
      { type: "h2", text: "Shorthand and alpha: the two variants" },
      {
        type: "p",
        text: "Three-digit hex like #F00 is shorthand — each digit is doubled, so #F00 means #FF0000 (pure red). Eight-digit hex like #FF573380 adds an alpha channel as the last pair: 00 is fully transparent, FF is fully opaque. To get the CSS 0–1 alpha, divide by 255 — 80 hex is 128 decimal, so #FF573380 is rgba(255, 87, 51, 0.5).",
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Expand 3-digit shorthand first\nfunction expand(hex) {\n  hex = hex.replace("#", "");\n  return hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;\n}\nexpand("F00"); // "FF0000"\n\n// 8-digit hex → rgba()\nconst alpha = parseInt("80", 16) / 255; // 0.5019…\n"rgba(255, 87, 51, " + alpha.toFixed(2) + ")"; // "rgba(255, 87, 51, 0.50)"`,
      },
      { type: "h2", text: "The traps" },
      {
        type: "list",
        items: [
          "parseInt without a radix: parseInt(\"FF\") returns NaN, because without the second argument it parses as decimal. Always write parseInt(pair, 16).",
          "Forgetting the #: split \"#FF5733\" into pairs without removing it first and every channel shifts — all three values come out wrong.",
          "Using shorthand raw: #F00 is not red=15, green=0, blue=0 — it is #FF0000. Double each digit before converting.",
          "Reading alpha as 0–100: in 8-digit hex the alpha pair is 00–FF like any other channel. FF means 255/255 = 1, fully opaque. Divide by 255 for the CSS value.",
          "Assuming the color changed: conversion only renames the value. If the swatch looks different after converting, the bug is in your code, not the math.",
        ],
      },
      { type: "h2", text: "When you actually need RGB" },
      {
        type: "p",
        text: "For plain CSS, hex is fine and shorter. RGB earns its keep in three places: canvas and WebGL APIs, which hand you decimal channel arrays (getImageData returns 0–255 values); color math like blending or darkening, which is arithmetic on channels; and transparency — rgba(255, 87, 51, 0.5) works everywhere, while 8-digit hex still trips up older browsers and some design tools.",
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste any hex into the [Color Converter](https://byte-kit.dev/tools/color-converter) — it shows the RGB, HSL, and a live preview instantly, all in your browser with nothing uploaded.",
      },
    ],
  },
{
  slug: "how-to-convert-image-to-base64",
  title: "How to Convert an Image to Base64 (Data URI)",
  excerpt:
    "A data URI embeds an image's bytes directly in HTML or CSS as data:image/png;base64,... — perfect for tiny icons, terrible for photos. Here is when to use it and when to skip it.",
  date: "2026-10-17",
  readingTime: "6 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: a data URI is the image's raw bytes, base64-encoded, pasted straight into your HTML or CSS as data:image/png;base64,iVBORw0KGgo.... You can make one with an online converter or in the browser with FileReader.readAsDataURL. It saves an HTTP request but inflates the image by about 33% — so it is a win for tiny icons and a loss for photos.",
    },
    { type: "h2", text: "What a data URI actually is" },
    {
      type: "p",
      text: "The format is data:[mime type];base64,[encoded bytes]. The mime type tells the browser what the bytes are — image/png, image/jpeg, image/webp, or image/svg+xml — and everything after the comma is the base64 payload. The browser decodes it exactly as if it had downloaded a file, except there is no download: the bytes are already in the document.",
    },
    { type: "h2", text: "Make one in the browser" },
    {
      type: "p",
      text: "No server needed. FileReader.readAsDataURL reads a file and hands you the complete data URI, prefix included:",
    },
    {
      type: "code",
      lang: "javascript",
      code: `function imageToDataUri(file) {\n  return new Promise((resolve, reject) => {\n    const reader = new FileReader();\n    reader.onload = () => resolve(reader.result);\n    reader.onerror = () => reject(reader.error);\n    reader.readAsDataURL(file);\n  });\n}\n\n// Wire it to a file input\nconst input = document.querySelector("#upload");\ninput.addEventListener("change", async (e) => {\n  const uri = await imageToDataUri(e.target.files[0]);\n  document.querySelector("#preview").src = uri; // "data:image/png;base64,..."\n});`,
    },
    { type: "h2", text: "When it helps" },
    {
      type: "list",
      items: [
        "Tiny icons and logos: saving one HTTP request outweighs the 33% size penalty when the file is a few kilobytes.",
        "Email signatures: many email clients block external images until the reader allows them — an embedded data URI renders immediately.",
        "Single-file HTML: demos, reports, and saved pages that must work with no external assets.",
        "Blur-up placeholders: embed a tiny low-res preview that shows instantly while the full image loads.",
      ],
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "The 33% bloat is real: base64 turns every 3 bytes into 4 characters. A 300 KB photo becomes 400 KB of text inside your HTML.",
        "No separate caching: the image is re-downloaded every time the HTML or CSS file changes, even if the image did not.",
        "Large data URIs delay rendering: the browser must parse all that text before it can lay out the page.",
        "Hard to edit: the image is buried in code, invisible to asset pipelines and image optimizers.",
      ],
    },
    { type: "h2", text: "Prefer plain SVG for icons" },
    {
      type: "p",
      text: "If the icon is a vector, skip base64 entirely and inline the SVG as plain text. It is smaller than the base64 version, you can style it with CSS (fill, stroke, currentColor), and there is nothing to decode. Base64 only wins when the source is already a raster image you cannot replace.",
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Drop an image into the [Image to Base64](https://byte-kit.dev/tools/image-to-base64) converter and copy the data URI — everything runs in your browser, nothing is uploaded.",
    },
  ],
},
{
  slug: "uuid-v4-vs-uuid-v7",
  title: "UUID v4 vs v7: Which Should You Use?",
  excerpt:
    "UUID v4 is 122 bits of pure randomness; v7 starts with a millisecond timestamp so IDs sort by creation time. Use v4 by default, v7 for database primary keys.",
  date: "2026-10-17",
  readingTime: "6 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: use v4 for everyday unique IDs and v7 for database primary keys. A v4 UUID is 122 bits of randomness with no order at all; a v7 UUID starts with a 48-bit Unix timestamp in milliseconds, so IDs sort by creation time. Both are standardized in RFC 9562 (2024), and you can tell them apart by the 13th hex digit — a 4 means v4, a 7 means v7.",
    },
    { type: "h2", text: "What is inside each version" },
    {
      type: "p",
      text: "A v4 UUID fills 122 of its 128 bits with random data from a cryptographic generator. There is no timestamp, no machine identifier, nothing to read — that is the point. A v7 UUID spends its first 48 bits on the current Unix time in milliseconds, then fills the remaining 74 bits with randomness. Collisions are a non-issue for both: v4 has about 5.3 × 10³⁶ possible values, and v7 has about 1.9 × 10²² unique values per millisecond on top of the timestamp separating every millisecond.",
    },
    { type: "h2", text: "The database problem v7 solves" },
    {
      type: "p",
      text: "PostgreSQL, MySQL, and most relational databases index primary keys with B-trees, which love sequential inserts: each new row appends to the end of the index. A v4 primary key lands at a random position on every insert, causing page splits and a fragmented index that degrades write throughput and cache locality at scale. A v7 primary key starts with a timestamp, so new IDs are monotonically increasing and inserts append cleanly — the write pattern databases want, with no central coordinator the way auto-increment needs.",
    },
    { type: "h2", text: "Generate one in JavaScript" },
    {
      type: "p",
      text: "v4 is built into every modern browser and Node.js — no library needed. v7 is newer, so it still needs a library:",
    },
    {
      type: "code",
      lang: "javascript",
      code: `// v4 — built in, no install\ncrypto.randomUUID(); // "3b241101-e2bb-4d53-af18-1c9a2d80a910"\n\n// v7 — needs the uuid package (v11+)\nimport { v7 as uuidv7 } from "uuid";\nuuidv7(); // "018f3f5e-1c2d-7a9b-8f10-3c4d5e6f7a8b"`,
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Leaking creation time: a v7 ID embeds a millisecond timestamp, so anyone can read roughly when the resource was created. If that reveals something sensitive, stick with v4.",
        "Expecting exact ordering: IDs generated in the same millisecond share a timestamp, so v7 gives time grouping, not a strict sequence. Need exact order? Keep an explicit timestamp or sequence column.",
        "Using UUIDs as secrets: UUIDs are unique, not unguessable-by-design. For access tokens, use a random byte string from a CSPRNG with an expiry and a way to revoke it.",
        "Migrating existing v4 keys: the v7 win is for new tables. Rewriting the primary keys of a live table is rarely worth the trouble.",
      ],
    },
    { type: "h2", text: "The rule of thumb" },
    {
      type: "p",
      text: "v4 by default — ad-hoc identifiers, idempotency keys, filenames, anything where order does not matter. v7 for database primary keys and records you want roughly time-ordered without a separate timestamp column. And if you need the same input to always produce the same ID, that is v5, not v4 or v7.",
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Generate UUID v4s and secure passwords with the [Password & UUID Generator](https://byte-kit.dev/tools/password-uuid-generator) — everything runs locally in your browser.",
    },
  ],
},
{
  slug: "how-to-reduce-svg-file-size",
  title: "How to Reduce SVG File Size",
  excerpt:
    "Most SVG bloat is decimal precision, editor metadata, and unused definitions. Run SVGO and you will typically cut 30–70% with zero visual change.",
  date: "2026-10-17",
  readingTime: "6 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: run SVGO — npx svgo logo.svg -o logo.min.svg — and you will typically cut 30–70% with zero visual change. Most SVG bloat is not the artwork: it is decimal precision with six places, editor metadata from Illustrator or Figma, and gradient definitions nothing references.",
    },
    { type: "h2", text: "SVGO in one command" },
    {
      type: "p",
      text: "SVGO is the standard optimizer: a pipeline of plugins that each remove one category of bloat. You do not even need to install it — npx runs it once and forgets it:",
    },
    {
      type: "code",
      lang: "bash",
      code: `# Optimize a single file\nnpx svgo logo.svg -o logo.min.svg\n\n# A typical Illustrator export:\n# logo.svg      → 38.4 KB\n# logo.min.svg  → 11.2 KB  (70.8% smaller, looks identical)`,
    },
    { type: "h2", text: "Precision is the #1 lever" },
    {
      type: "p",
      text: "The single biggest source of bloat is numeric precision. A path point written as 12.345678 is visually identical to 12.35 at any normal size, but costs four extra characters — multiplied across hundreds of points. SVGO's floatPrecision option controls this: 2 decimals is a safe starting point, 1 is fine for simple icons, and detailed illustrations may need 3. If curves start looking wobbly, you went too far.",
    },
    { type: "h2", text: "The easy wins SVGO handles" },
    {
      type: "list",
      items: [
        "Editor metadata: Illustrator, Inkscape, and Figma namespaces plus generator comments — useful to the editor, dead weight on the web.",
        "Unused definitions: gradients, filters, and clip paths that nothing in the file references.",
        "Collapsed groups: nested <g> elements with no meaningful attributes get merged away.",
        "Shortened IDs and cleaned path data: absolute coordinates become relative where shorter, and redundant commands are dropped.",
      ],
    },
    { type: "h2", text: "Dedupe repeated shapes with <use>" },
    {
      type: "p",
      text: "When the same shape repeats — icon sets, dot patterns, repeated logos — define it once in <defs> and reference it. The savings compound with every duplicate:",
    },
    {
      type: "code",
      lang: "html",
      code: `<defs>\n  <circle id="dot" r="5" fill="#F00" />\n</defs>\n<use href="#dot" x="10" y="10" />\n<use href="#dot" x="30" y="10" />\n<use href="#dot" x="50" y="10" />`,
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Letting SVGO strip the viewBox: without a viewBox the SVG cannot scale responsively. Keep removeViewBox off unless the SVG is sized only by width and height attributes.",
        "Rounding too aggressively: floatPrecision 1 on a detailed illustration turns smooth curves wobbly. Start at 2 and drop to 1 only for simple icons.",
        "Optimizing your only copy: minified SVGs are miserable to edit. Keep the source file and optimize on export.",
        "Merging paths across different styles: mergePaths only saves when adjacent paths share the same fill — merging across opacities or strokes changes how it renders.",
        "Skipping the visual check: always compare before and after in a browser, at 1x and 2x zoom, before shipping.",
      ],
    },
    { type: "h2", text: "Compress on the server too" },
    {
      type: "p",
      text: "SVG is text, and text compresses extremely well — gzip or brotli on the server shrinks the transfer size far beyond what SVGO alone does.",
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Drop an SVG into the [SVG Optimizer](https://byte-kit.dev/tools/svg-optimizer) to strip the bloat in your browser — no install, no upload.",
    },
  ],
},
{
  slug: "how-to-create-a-favicon",
  title: "How to Create a Favicon for Your Website",
  excerpt:
    "One square source image, four sizes, three link tags: 16 and 32px for tabs, 180px for Apple touch icons, 192 and 512px for PWAs.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: start from one square source image and export it at 16x16 and 32x32 for browser tabs, 180x180 for Apple touch icons, and 192x192 plus 512x512 if you ship a PWA. Link the files in your HTML head and keep a favicon.ico at your site root. That covers nearly every browser and device with three link tags.",
    },
    { type: "h2", text: "The sizes you actually need" },
    {
      type: "list",
      items: [
        "16x16 and 32x32 — browser tabs and bookmarks. The 32px version covers high-density displays.",
        "180x180 — apple-touch-icon.png, used when someone adds your site to their iOS home screen.",
        "192x192 and 512x512 — referenced from your web app manifest for installable PWAs.",
        "favicon.ico at the site root — browsers still request this file automatically, so ship it even when you link everything explicitly.",
      ],
    },
    { type: "h2", text: "ICO vs PNG vs SVG" },
    {
      type: "p",
      text: "ICO is a container format that can hold several sizes in one file, which is why favicon.ico remains the safest default for tabs. PNG is the right choice for the apple-touch-icon and the PWA icons — it is universally supported and easy to generate. SVG scales infinitely and stays tiny for simple marks, but not every browser supports SVG favicons, so always ship a PNG or ICO fallback alongside it.",
    },
    { type: "h2", text: "The minimal HTML" },
    {
      type: "p",
      text: "Place the files at your site root and add this to your <head>:",
    },
    {
      type: "code",
      lang: "html",
      code: `<link rel="icon" href="/favicon.ico" sizes="32x32">\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Aggressive caching: browsers hold onto favicons for weeks. After an update, bump a query string (/favicon.ico?v=2) so visitors actually see the new icon.",
        "Transparency on apple-touch-icon: iOS fills transparent areas with black. Export the 180x180 with a solid background.",
        "Detail that dies at 16px: a full logo becomes a smudge in a tab. Design for the smallest size first — one bold shape, high contrast, no text.",
        "Missing root favicon.ico: browsers request /favicon.ico on their own. If it is not there, you get 404 noise in your server logs.",
        "SVG-only setups: fine where supported, but without a PNG or ICO fallback some visitors get no icon at all.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Upload your logo to the [Favicon Generator](https://byte-kit.dev/tools/favicon-generator) — it exports every size plus the HTML snippet, all in your browser with nothing uploaded.",
    },
  ],
},
{
  slug: "how-to-convert-json-to-csv",
  title: "How to Convert JSON to CSV (Python, jq, and Online)",
  excerpt:
    "JSON converts cleanly to CSV when it is an array of flat objects — here is the Python, pandas, and jq for it, plus what to do with nested data.",
  date: "2026-10-17",
  readingTime: "6 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: JSON converts cleanly to CSV when it is an array of flat objects — each object becomes a row, each key becomes a column. In Python it is ten lines with the csv module, and on the command line it is a single jq invocation. The only real work is nested data, which CSV cannot represent directly.",
    },
    { type: "h2", text: "The shape that converts cleanly" },
    {
      type: "p",
      text: "CSV is two-dimensional: rows and columns, nothing else. The JSON shape that maps onto it without decisions is an array of objects with the same flat keys:",
    },
    {
      type: "code",
      lang: "javascript",
      code: `[\n  { "id": 1, "name": "Alice", "role": "admin" },\n  { "id": 2, "name": "Bob", "role": "editor" }\n]\n// becomes:\n// id,name,role\n// 1,Alice,admin\n// 2,Bob,editor`,
    },
    { type: "h2", text: "Python: csv.DictWriter" },
    {
      type: "p",
      text: "For flat records, the standard library is all you need. This assumes the data is a list of dicts with uniform keys:",
    },
    {
      type: "code",
      lang: "python",
      code: `import json, csv\n\nwith open("data.json") as f:\n    data = json.load(f)\n\nwith open("out.csv", "w", newline="") as f:\n    writer = csv.DictWriter(f, fieldnames=data[0].keys())\n    writer.writeheader()\n    writer.writerows(data)`,
    },
    { type: "h2", text: "Nested data: pandas json_normalize" },
    {
      type: "p",
      text: "When objects contain objects, flatten them first. json_normalize turns nested keys into dot-notation columns:",
    },
    {
      type: "code",
      lang: "python",
      code: `import pandas as pd\n\ndata = [\n    {"id": 1, "user": {"name": "Alice", "city": "NYC"}},\n    {"id": 2, "user": {"name": "Bob", "city": "SF"}},\n]\n\ndf = pd.json_normalize(data, sep=".")\ndf.to_csv("out.csv", index=False)\n# id,user.name,user.city\n# 1,Alice,NYC\n# 2,Bob,SF`,
    },
    { type: "h2", text: "The jq one-liner" },
    {
      type: "p",
      text: "On the command line, jq handles the whole job — headers included:",
    },
    {
      type: "code",
      lang: "bash",
      code: `jq -r '(.[0] | keys_unsorted) as $k | $k, map([.[ $k[] ]])[] | @csv' data.json > out.csv`,
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Nested objects don't fit: CSV has no nesting. Flatten with json_normalize first, or the converter joins the object into a single unreadable cell.",
        "Non-uniform keys: if some records have fields others lack, collect every key across all records before writing — otherwise columns silently disappear.",
        "Commas inside values: a value like \"Boston, MA\" must be quoted. DictWriter, pandas, and @csv all do this automatically; a hand-rolled string join does not.",
        "Forgetting newline=\"\" in Python: on Windows, the csv module without it writes a blank line after every row.",
        "Excel showing one column: in some locales Excel expects semicolons, not commas. If everything lands in a single column, the delimiter is the problem — not your data.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Paste your JSON into the [JSON / YAML / CSV](https://byte-kit.dev/tools/json-yaml-csv) — it converts in your browser with nothing uploaded, and shows you exactly how nested fields get flattened.",
    },
  ],
},
{
  slug: "glassmorphism-css-effect",
  title: "How to Create the Glassmorphism Effect with CSS",
  excerpt:
    "Five CSS properties make the frosted-glass look: a translucent background, backdrop-filter blur and saturate, a thin light border, rounded corners, and a soft shadow.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: glassmorphism is five CSS properties on a panel — a translucent rgba() background, backdrop-filter with blur() and saturate(), a thin light border, rounded corners, and a soft shadow — placed over a colorful background. The blur does the frosted-glass work; everything else sells the illusion.",
    },
    { type: "h2", text: "The recipe" },
    {
      type: "code",
      lang: "css",
      code: `.glass {\n  background: rgba(255, 255, 255, 0.15);\n  -webkit-backdrop-filter: blur(12px) saturate(160%);\n  backdrop-filter: blur(12px) saturate(160%);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 16px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);\n}`,
    },
    {
      type: "p",
      text: "Each property has a job: the translucent background lets the page show through; blur() frosts whatever sits behind the panel (not the panel's own content); saturate() keeps the blurred colors vivid instead of washing out to grey; the 1px light border catches the edge like the rim of real glass; and the radius plus shadow lift the panel off the page. The -webkit- prefix is still needed for older Safari versions.",
    },
    { type: "h2", text: "It only works over a real background" },
    {
      type: "p",
      text: "On a flat solid color the blur has nothing to frost, so the effect vanishes and you are left with a grey translucent box. Glassmorphism needs a gradient, a photo, or a pattern behind it. Test your panel over the busiest background your page has — if the glass reads there, it reads anywhere.",
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Skipping saturate(): blur() alone washes colors out to grey. saturate(150–180%) is what keeps frosted glass vivid.",
        "Forgetting -webkit-backdrop-filter: older Safari versions need the prefix — without it the panel is just a translucent box there.",
        "Text that fails contrast: a translucent panel over a changing background can drop below readable contrast. Test over the brightest and darkest parts of the backdrop, or add a subtle text shadow.",
        "Too many blurred panels: backdrop-filter is one of the more expensive CSS properties. A few panels are fine; dozens will make scrolling stutter, especially on low-end phones.",
        "Glass over a flat background: with nothing colorful behind it there is no frosted effect — just a grey box.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Dial in the blur, tint, and border on the [Glassmorphism Generator](https://byte-kit.dev/tools/glassmorphism-generator) and copy the finished CSS — it runs entirely in your browser.",
    },
  ],
},
{
  slug: "how-to-convert-avif-to-jpg",
  title: "How to Convert AVIF to JPG",
  excerpt:
    "AVIF files are 30–50% smaller than JPG but won't open everywhere — here's how to convert them (including batch) and what happens to transparency.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: open the .avif in a browser-based converter and download the JPG — no install, nothing uploaded. On a Mac you can also open it in Preview and use File → Export → JPEG. The only real decisions are the JPG quality (80–90 is the sweet spot) and the background color, because JPG has no transparency.",
    },
    { type: "h2", text: "What AVIF is, and why you have one" },
    {
      type: "p",
      text: "AVIF is an image format built on the AV1 video codec — the compression technology behind modern video streaming, applied to still images. It stores photos 30–50% smaller than JPG at the same visual quality, which is why CDNs serve it and some cameras and apps save in it. Chrome, Firefox, and Safari all open AVIF now, so the files usually arrive quietly — a download or a saved image that picked the format the site served.",
    },
    { type: "h2", text: "Why convert to JPG at all" },
    {
      type: "p",
      text: "Because the rest of the world hasn't caught up. Older desktop editors, upload forms that whitelist file extensions, office software, and print pipelines often don't recognize .avif — the file won't open, or the form rejects it outright. JPG is the universal fallback: everything reads it, everywhere.",
    },
    { type: "h2", text: "The three ways to convert" },
    {
      type: "list",
      items: [
        "Browser converter: drop the file in, pick a JPG quality, download. The conversion runs locally in your browser — nothing is uploaded, which matters for personal photos.",
        "Mac Preview: open the .avif, then File → Export and choose JPEG. Built in on recent macOS, no extra software needed.",
        "Windows: the Photos app needs the AV1 Video Extension from the Microsoft Store to open AVIF at all. If you'd rather not install it, the browser route skips the problem entirely.",
      ],
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Transparency silently becomes a color: JPG has no alpha channel, so transparent pixels get filled — usually white. If your AVIF has transparency that matters (a logo, an icon), pick the background fill deliberately — or convert to PNG instead.",
        "Quality 100: enormous files with no visible gain over 90. 80–90 is the sweet spot.",
        "Converting one file at a time: queue every AVIF and download a single ZIP instead of repeating the same steps per file.",
        "Converting for a website: you may not need to — serve AVIF with a JPG fallback (see below) and let the browser choose.",
      ],
    },
    { type: "h2", text: "Batch it — and a fallback for the web" },
    {
      type: "p",
      text: "Converting one file at a time gets old fast. Queue every AVIF at once and download the results as a single ZIP. And if you're putting images on a website rather than converting for compatibility, you may not need to convert at all — serve AVIF with a JPG fallback and let the browser choose:",
    },
    {
      type: "code",
      lang: "html",
      code: `<picture>\n  <source srcset="photo.avif" type="image/avif">\n  <img src="photo.jpg" alt="A photo that works everywhere">\n</picture>`,
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Drop your .avif files into the [AVIF Converter](https://byte-kit.dev/tools/avif-converter) — batch conversion, quality control, and a background fill for transparency, all in your browser with nothing uploaded.",
    },
  ],
},
{
  slug: "css-box-shadow-explained",
  title: "How to Use CSS box-shadow (Every Value Explained)",
  excerpt:
    "box-shadow takes offset-x, offset-y, blur, spread, color, and an optional inset — here's what each value does, plus copy-paste recipes and the traps.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); — horizontal offset, vertical offset, blur radius, color. That's 90% of what you'll ever write. The full syntax adds an optional spread radius and an inset keyword, and you can stack several shadows with commas.",
    },
    { type: "h2", text: "Each value, in plain English" },
    {
      type: "list",
      items: [
        "offset-x (required): how far the shadow sits left or right of the element. Positive pushes it right.",
        "offset-y (required): how far it sits up or down. Positive pushes it down.",
        "blur-radius (optional): how soft the shadow's edge is. 0 gives a hard, crisp edge.",
        "spread-radius (optional): how much the shadow grows or shrinks beyond the element's box. Positive makes it bigger all around.",
        "color (optional): any CSS color. Leave it out and the shadow uses your text color — which surprises everyone the first time.",
        "inset (optional): flips the shadow inside the element instead of outside it.",
      ],
    },
    {
      type: "code",
      lang: "css",
      code: `.card {\n  /* offset-x | offset-y | blur | spread | color */\n  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);\n}`,
    },
    { type: "h2", text: "Stacking multiple shadows" },
    {
      type: "p",
      text: "Separate shadows with commas — the first one in the list renders on top. Layering a small tight shadow under a large soft one is how you get depth that looks real instead of a single grey smudge:",
    },
    {
      type: "code",
      lang: "css",
      code: `.card {\n  box-shadow:\n    0 1px 2px rgba(0, 0, 0, 0.08),\n    0 8px 24px rgba(0, 0, 0, 0.12);\n}`,
    },
    { type: "h2", text: "Inset: shadows on the inside" },
    {
      type: "p",
      text: "Put inset first and the shadow draws inside the element's frame — pressed buttons, sunken form fields, inner depth on cards:",
    },
    {
      type: "code",
      lang: "css",
      code: `.button:active {\n  /* shadow moves inside: the button looks pressed */\n  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.25);\n}`,
    },
    { type: "h2", text: "Two recipes to copy" },
    {
      type: "code",
      lang: "css",
      code: `/* Subtle card lift */\n.card {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n  transition: box-shadow 0.2s ease, transform 0.2s ease;\n}\n.card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);\n}\n\n/* Soft glow */\n.glow {\n  box-shadow: 0 0 24px rgba(59, 130, 246, 0.45);\n}`,
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Color left out: with no color, the shadow takes your text color. Black text gives a black shadow — usually not what you wanted. Set the color explicitly.",
        "Blur of 0 looks broken: box-shadow: 4px 4px 0 black is a hard offset block, not a soft shadow. A valid style, but rarely the one people meant.",
        "Clipped by overflow: a parent with overflow: hidden cuts the shadow off at its edges. If your shadow vanishes, check the ancestors.",
        "No layout space: shadows paint outside the element without moving anything — neighbors won't make room, so large blurs can overlap surrounding content.",
        "Heavy blurs everywhere: big blur radii on dozens of elements cost paint performance. Keep decorative shadows modest.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Dial in the exact shadow visually with the [Box Shadow Generator](https://byte-kit.dev/tools/box-shadow-generator) — offsets, blur, spread, and color with a live preview, then copy the CSS straight into your stylesheet.",
    },
  ],
},
{
  slug: "batch-convert-png-to-jpg",
  title: "How to Convert Multiple PNGs to JPG at Once",
  excerpt:
    "Drop a folder of PNGs into a batch converter at quality 80–90 and watch gigabytes become megabytes — with the transparency and quality traps to avoid.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: drop the whole folder into a batch converter, set JPG quality to 80–90, and download the results as a ZIP. A screenshot folder measured in gigabytes comes back as megabytes — for photos and screenshots, JPG runs 60–90% smaller than PNG with no visible difference.",
    },
    { type: "h2", text: "Why the files shrink so much" },
    {
      type: "p",
      text: "PNG is lossless: it stores every pixel exactly, which is perfect for sharp graphics but wasteful for photos. JPG is lossy: it throws away visual detail your eyes barely register. On screenshots and photographs the two look identical at quality 85 — but the JPG is a fraction of the size.",
    },
    { type: "h2", text: "The transparency trade" },
    {
      type: "p",
      text: "JPG has no alpha channel, so anything transparent gets filled with a solid color — usually white. That's fine for screenshots and photos, which have no transparency anyway. But logos and icons with transparent backgrounds come back with a white box around them. If transparency matters, keep the PNG.",
    },
    { type: "h2", text: "The quality sweet spot" },
    {
      type: "list",
      items: [
        "90 and up: screenshots with small text. Keeps letter edges crisp.",
        "80–85: photos. Visually identical to the original, much smaller files.",
        "Below 70: only when a file has to squeeze under an upload limit. Expect visible artifacts.",
        "100: pointless. Enormous files, no visible gain over 90.",
      ],
    },
    { type: "h2", text: "Keep it local" },
    {
      type: "p",
      text: "Screenshots often contain personal information — chats, account numbers, open tabs. A converter that runs entirely in your browser never uploads them anywhere. You can prove it: load the page, switch to airplane mode, and convert. If it still works, your files never left your device.",
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "White boxes on logos: converting a transparent PNG fills the alpha with white. Check the results before you ship them.",
        "Re-compressing JPGs: every JPG save throws away more detail. Always convert from the original PNG — never JPG to JPG to JPG.",
        "Tiny PNGs barely shrink: flat-color graphics and icons are already small. Batch conversion pays off on photos and screenshots, not 2 KB icons.",
        "Forgetting the originals: conversion is one-way for the discarded detail. Keep the PNGs until you're sure the JPGs are good.",
      ],
    },
    {
      type: "code",
      lang: "bash",
      code: `# ImageMagick: convert every PNG in the folder at quality 85\nmogrify -format jpg -quality 85 *.png\n# Originals are kept — new .jpg files appear alongside them`,
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Drop a whole folder into the [Batch Image Converter](https://byte-kit.dev/tools/batch-image-converter) — set the quality, convert everything at once, and download the results as a ZIP, all in your browser with nothing uploaded.",
    },
  ],
},
{
  slug: "how-to-write-better-ai-prompts",
  title: "How to Write Better AI Prompts (a Reusable Template)",
  excerpt:
    "Most bad AI output comes from vague input — the Role + Goal + Context + Output formula fixes it with four lines of structure.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: bad AI output is almost always vague input. Use the Role + Goal + Context + Output formula — tell the model who it is, what you want, what it needs to know, and what the answer should look like. Four short lines of structure are the difference between a generic paragraph and exactly the thing you asked for.",
    },
    { type: "h2", text: "The formula" },
    {
      type: "p",
      text: "Each part fixes one failure mode. Role sets the perspective and vocabulary — a senior copywriter writes differently than a generic assistant. Goal states the one concrete thing you want; keep it to one goal per prompt, because three requests get three half-answers. Context is the material the model cannot guess: your audience, your constraints, your examples. Output pins down the shape of the answer — length, format, tone — so you don't get an essay when you needed bullets.",
    },
    { type: "h2", text: "The template" },
    {
      type: "p",
      text: "Copy this, fill in the brackets, and you have a solid prompt for almost any task:",
    },
    {
      type: "list",
      items: [
        "Role: You are a [job title or expert type, e.g. senior technical writer].",
        "Goal: [One concrete task, e.g. rewrite this paragraph for clarity.]",
        "Context: [Audience, background, and any material — paste it here.]",
        "Output: [Format and length, e.g. 150 words, three bullets, friendly tone.]",
      ],
    },
    { type: "h2", text: "Weak vs strong: the same task" },
    {
      type: "p",
      text: "Watch what the formula does to one task — writing a product description for wireless headphones:",
    },
    {
      type: "list",
      items: [
        "Weak: \"Write a product description for our headphones.\" You get a generic paragraph that could describe any headphones ever made.",
        "Strong: \"Role: you are a copywriter for an audio brand. Goal: write a product description for wireless headphones. Context: the audience is commuters; key features are 40-hour battery and noise cancelling; tone is casual. Output: 80 words, one headline, three bullets.\" You get a description shaped to the brief.",
      ],
    },
    { type: "h2", text: "Constraints sharpen output" },
    {
      type: "p",
      text: "The Output line does most of the work. Models fill whatever space you leave open, so close it: give a word count, a format, and a tone. \"Under 200 words\", \"as a two-column table\", \"no jargon\" — each constraint removes a whole class of bad output. And when the first answer is close but not right, don't rewrite the prompt from scratch. Iterate with a follow-up instead: \"Shorter. Drop the second bullet. Make the opening more direct.\" Follow-ups build on context the model already has, which is faster and usually better than starting over.",
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Skipping context: the model cannot know your audience, your product, or your constraints. If you didn't say it, it guessed — and guesses are generic.",
        "Three goals in one prompt: ask for a summary, a critique, and a rewrite at once and you get three shallow answers. One prompt, one goal.",
        "No output format: without a length and a shape, you get whatever length the model feels like. \"Brief\" is not a length — use a number.",
        "Rewriting instead of iterating: if the answer is 80% right, a follow-up (\"make it shorter and friendlier\") beats a brand-new prompt.",
        "Prompting in a vacuum: paste the actual material — the paragraph, the data, the example you like. The model works with what you give it.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Build your next prompt with the [Prompt Template Generator](https://byte-kit.dev/tools/prompt-template-generator) — fill in the Role, Goal, Context, and Output slots and copy the finished prompt, all in your browser.",
    },
  ],
},
{
  slug: "webp-vs-jpeg",
  title: "WebP vs JPEG: Which Image Format Should You Use?",
  excerpt:
    "WebP is 25–35% smaller than JPEG at the same quality and works in 97%+ of browsers — but JPEG still wins for email, print, and legacy software.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: for images on the web, use WebP — it is 25–35% smaller than JPEG at the same visual quality, supports transparency and animation, and works in 97%+ of browsers. Keep JPEG for email attachments, print, and old software that only speaks JPEG.",
    },
    { type: "h2", text: "Why WebP wins on the web" },
    {
      type: "p",
      text: "WebP was built for the web; JPEG was built in 1992 for maximum compatibility. At the same visual quality, a WebP photo runs 25–35% smaller than the JPEG, which means faster page loads and less bandwidth. WebP also does two things JPEG simply cannot: transparency (an alpha channel, like PNG) and animation (as a lighter GIF replacement). Browser support is no longer the catch it once was — every current browser has supported WebP for years, covering over 97% of users.",
    },
    { type: "h2", text: "When JPEG still wins" },
    {
      type: "p",
      text: "Compatibility is JPEG's superpower. Email clients, printers, and plenty of desktop software either don't render WebP or handle it badly. If the image has to open correctly anywhere — an email attachment, a print shop, a client's decade-old CMS — JPEG is the safe choice. JPEG is also the better archival format: keep your originals as JPEG or PNG, and treat WebP as the delivery format you generate from them.",
    },
    { type: "h2", text: "Side by side" },
    {
      type: "list",
      items: [
        "File size: WebP is 25–35% smaller than JPEG at the same visual quality.",
        "Transparency: WebP yes (alpha channel); JPEG no.",
        "Animation: WebP yes; JPEG no.",
        "Browser support: WebP covers 97%+ of users; JPEG effectively 100%.",
        "Email and print: JPEG — WebP support in email clients is unreliable.",
        "Legacy software: JPEG — old editors and viewers may not open WebP at all.",
      ],
    },
    { type: "h2", text: "The rule of thumb" },
    {
      type: "p",
      text: "Serve WebP on your website, keep JPEG as the fallback. The <picture> element makes this automatic — browsers that understand WebP get it, and everything else silently gets the JPEG:",
    },
    {
      type: "code",
      lang: "html",
      code: `<picture>\n  <source srcset="photo.webp" type="image/webp">\n  <img src="photo.jpg" alt="A photo" width="1200" height="800">\n</picture>`,
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Converting JPEG to WebP and deleting the original: WebP is a delivery format. Keep the JPEG or PNG original — you can't get quality back out of a converted file.",
        "Using WebP in email: most email clients won't display it. Attach the JPEG.",
        "Assuming smaller means worse: at the same quality setting, WebP's smaller file is the same picture. Compare at matched quality, not matched file size.",
        "Forgetting transparency needs: if your image needs an alpha channel, JPEG was never an option — that's WebP or PNG territory.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Convert your images with the [Image & SVG Converter](https://byte-kit.dev/tools/image-svg-converter) — drop in a JPEG, get a WebP out, entirely in your browser with nothing uploaded.",
    },
  ],
},
{
  slug: "password-vs-passphrase",
  title: "Password vs Passphrase: What's Actually Stronger?",
  excerpt:
    "Length beats complexity: a passphrase of four random words is stronger in practice than P@ssw0rd! — and you can actually remember it.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: the passphrase wins. Password strength comes from entropy — roughly, length times unpredictability — and a passphrase of four or more random words has far more of it in practice than a short password full of symbols. Length beats complexity, every time.",
    },
    { type: "h2", text: "The math: length beats complexity" },
    {
      type: "p",
      text: "Every extra character multiplies the number of possible passwords. Widening the character set (adding symbols) helps a little; adding one more character multiplies the possibilities by the entire set size. Run the numbers and the gap is clear:",
    },
    {
      type: "code",
      lang: "javascript",
      code: `// Theoretical entropy: length × log2(pool size)\nconst entropy = (length, pool) => length * Math.log2(pool);\n\nentropy(10, 94);   // random 10-char password: ≈ 66 bits (strong — but nobody memorizes these)\nentropy(4, 7776);  // 4 random diceware words: ≈ 52 bits (strong AND memorable)\n\n// The catch: "P@ssw0rd!" is not random. Attackers try dictionary words\n// with predictable substitutions first, so its real entropy is a\n// fraction of the theoretical 66 bits. Random words stay random.`,
    },
    { type: "h2", text: "Why P@ssw0rd fails" },
    {
      type: "p",
      text: "Leet-speak substitutions (a→@, e→3, o→0) feel clever, but password crackers have known every one of them for decades — they are baked into the dictionaries attackers try first. \"P@ssw0rd!\" is a dictionary word wearing a costume. A password's strength is not how strange it looks to you; it is how unpredictable it is to someone guessing systematically. Four genuinely random words have no pattern to exploit, which is exactly why they hold up.",
    },
    { type: "h2", text: "The traps" },
    {
      type: "list",
      items: [
        "Complexity theater: \"P@ssw0rd!\" looks strong and is weak. Unpredictability is what matters, not the symbol count.",
        "Reusing one good password: a strong password used on ten sites is ten sites' worth of risk. One breach exposes all of them.",
        "Predictable \"random\" words: a passphrase only works if the words are actually random — song lyrics and famous quotes are in the dictionaries too.",
        "Skipping 2FA: even the strongest password can leak. Two-factor authentication means a stolen password alone is not enough.",
        "Storing passwords in plaintext notes: if you have to write them down, use a password manager — that is what it is for.",
      ],
    },
    { type: "h2", text: "What to actually do" },
    {
      type: "p",
      text: "Generate a passphrase of four or more random words for the accounts you type by hand, use a password manager to generate and store a unique random password for everything else, and turn on two-factor authentication wherever it matters — email and banking first. You only need to memorize one strong master password; the manager remembers the rest.",
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Generate a strong passphrase or a random password with the [Password & UUID Generator](https://byte-kit.dev/tools/password-uuid-generator) — everything is created locally in your browser, nothing is sent or stored anywhere.",
    },
  ],
},
{
  slug: "how-to-encode-html-entities",
  title: "How to Encode HTML Entities (and Decode Them Back)",
  excerpt:
    "Encoding HTML means swapping & < > \" ' for &amp; &lt; &gt; &quot; &#x27; — the browser then shows them as text instead of parsing them as markup. Here is the one-liner, the decode trick, and the five traps.",
  date: "2026-10-17",
  readingTime: "5 min read",
  author: "Shayan",
  content: [
    {
      type: "p",
      text: "Short answer: HTML-encoding text means replacing the five characters the browser treats as markup — & < > \" ' — with their entities: &amp; &lt; &gt; &quot; &#x27;. Once encoded, the browser displays them as text instead of parsing them. That is how you safely drop user input, code samples, or math like a < b into a page without breaking it — or opening a cross-site scripting (XSS) hole.",
    },
    { type: "h2", text: "The five characters that matter" },
    {
      type: "list",
      items: [
        "& → &amp; — the ampersand itself; always encode this one first",
        "< → &lt; and > → &gt; — otherwise the browser reads them as tags",
        "\" → &quot; — needed when text lands inside an attribute value",
        "' → &#x27; (or &apos; in HTML5 — it is not valid in HTML4)",
      ],
    },
    { type: "h2", text: "Named vs numeric entities" },
    {
      type: "p",
      text: "Entities come in two spellings. Named entities like &copy;, &nbsp;, and &hearts; are readable but cover only about 250 common characters. Numeric entities spell the Unicode code point directly — &#169; in decimal, &#xA9; in hexadecimal — and are exhaustive: every character has one. Same rendered result, different trade-off: readability versus completeness.",
    },
    { type: "h2", text: "Encoding in JavaScript: the one-liner" },
    {
      type: "code",
      lang: "javascript",
      code: `const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  }[c]));

escapeHtml('<a href="x">Tom & Jerry</a>');
// "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;"`,
    },
    {
      type: "p",
      text: "The regex-plus-map version does the swap in a single pass, so replaced text is never rescanned — there is no ordering trap. If you write it as chained replaces instead (.replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\")…), the & replace MUST come first, or the & inside your own &lt; gets encoded again and you end up with &amp;lt; — the classic double-encoding bug.",
    },
    { type: "h2", text: "Decoding: the textarea trick" },
    {
      type: "code",
      lang: "javascript",
      code: `const decodeHtml = (s) => {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
};

decodeHtml("&lt;strong&gt;hi&lt;/strong&gt;"); // "<strong>hi</strong>"`,
    },
    {
      type: "p",
      text: "A textarea parses entities but never executes scripts, which makes it the safe way to decode in the browser. (DOMParser works too — new DOMParser().parseFromString(s, \"text/html\").documentElement.textContent — but never feed decoded output straight back into innerHTML, or you have just undone all of your encoding.)",
    },
    { type: "h2", text: "The five traps" },
    {
      type: "list",
      items: [
        "Double-encoding: encoding twice turns & into &amp;amp;, which displays as the literal text \"&amp;\" instead of \"&\". Encode once, at the boundary where text enters HTML.",
        "&nbsp; is not a space: it is U+00A0, a non-breaking space. It will not match a regular space in ===, and in HTML it refuses to collapse like normal whitespace — that is its whole job.",
        "encodeURIComponent is for URLs, not HTML: it turns < into %3C, which the browser shows literally. Different context, different escaping.",
        "innerHTML with raw user input is an XSS hole: a string like <img src=x onerror=...> survives unless you encode & < > \" '. Either encode first, or skip the problem with textContent, which encodes for you automatically.",
        "Forgetting attribute quotes: a \" inside an attribute value breaks out of it — that is exactly why &quot; exists. Encode \" and ' whenever text lands inside an attribute.",
      ],
    },
    { type: "h2", text: "Try it" },
    {
      type: "p",
      text: "Encode or decode a whole block at once with [HTML Entity Encode Online](https://byte-kit.dev/tools/html-entity-encoder) — named and numeric entities in both directions, everything in your browser, nothing uploaded.",
    },
  ],
},
  {
    slug: "how-to-open-heic-files-on-windows",
    title: "How to Open HEIC Files on Windows",
    excerpt:
      "Windows cannot open iPhone HEIC photos out of the box. Convert them to JPG — the fastest option — or install Microsoft's HEIF codec; here is what each route costs you.",
    date: "2026-10-19",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: convert the HEIC file to JPG. Windows 10 and 11 do not ship with HEIC support, so the Photos app just refuses the file. Converting takes seconds, works on any machine with a browser, and a JPG opens everywhere forever. The alternative is installing Microsoft's HEIF codec from the Microsoft Store — it teaches the Photos app to open HEIC directly, but it is a paid extension and it only fixes your own machine, not the files you send to other people.",
      },
      { type: "h2", text: "Why Windows cannot open HEIC" },
      {
        type: "p",
        text: "HEIC (High Efficiency Image Container) is the default photo format on iPhones since iOS 11. It stores roughly twice the quality per megabyte of JPEG by using the HEVC video codec's compression. Apple ships the decoder on every iPhone and Mac; Microsoft does not license it for Windows. The result: double-click an .heic file on Windows and Photos shows an error or asks you to install something. The file is not broken — your OS just lacks the decoder.",
      },
      { type: "h2", text: "Option 1: convert to JPG (recommended)" },
      {
        type: "p",
        text: "Converting sidesteps the codec problem entirely. The JPG you get opens in every app on every platform, emails cleanly, and uploads to every website. Do the conversion in the browser rather than installing a desktop tool: the file never leaves your device, nothing is installed, and it works the same on a work laptop where you cannot install anything anyway.",
      },
      {
        type: "p",
        text: "One thing to know: converting HEIC to JPG is a one-way format change. You keep the visible quality — the converter decodes the full image and re-encodes it — but you lose HEIC's smaller file size and any live-photo motion data. For sharing, archiving, and editing, that is a trade worth making.",
      },
      { type: "h2", text: "Option 2: install the HEIF codec" },
      {
        type: "p",
        text: "If you would rather open HEIC files directly, install HEIF Image Extensions from the Microsoft Store. Once installed, the Photos app opens .heic files like any other image, thumbnails appear in File Explorer, and you can edit them. Two catches: it is a paid extension (around $1, listed as HEIF Image Extensions — it has flipped between free and paid over the years, so check the current price), and if you also receive .heic video or live photos you need the separate HEVC Video Extensions too. This fixes your PC but does nothing for the people you send the files to.",
      },
      { type: "h2", text: "Option 3: sync through the cloud" },
      {
        type: "p",
        text: "If you use iCloud for Windows, your iPhone photos sync to the PC and iCloud handles the conversion silently — you see JPGs. Google Photos and OneDrive do the same: upload from the iPhone, download on Windows, and you get a format Windows understands. This is convenient but slow if you just need one file opened right now, and it routes your photos through a cloud account.",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Do I lose quality converting HEIC to JPG? No visible loss. The conversion decodes the full-resolution image and re-encodes it at high quality. You lose file-size efficiency, not pixels.",
          "Can I convert a whole folder at once? A batch converter handles folders: drop in every .heic and get JPGs back. The single-file tool above works when you have one or two; look for batch mode for dozens.",
          "Why does my iPhone save HEIC in the first place? Because it halves your storage use. You can switch the camera to JPG in Settings → Camera → Formats → Most Compatible — but you will use roughly twice the space.",
          "What about HEIC files from a DSLR or Android? Same story: any .heic needs the codec or a conversion, regardless of which device created it.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Drop the file into the [HEIC Converter](https://byte-kit.dev/tools/heic-converter) — it decodes the HEIC in your browser and hands you back a JPG or PNG, nothing uploaded. Already converting regularly? [How to Convert HEIC Photos to JPG](/posts/how-to-convert-heic-to-jpg) covers the conversion side in more depth, including batch jobs.",
      },
    ],
  },
  {
    slug: "how-to-decode-base64",
    title: "How to Decode Base64 (Text, Images, Files, and the Common Errors)",
    excerpt:
      "Decoding Base64 is one line with atob() — until the text is not ASCII, the padding is missing, or the string is base64url. Here is the robust version for each case.",
    date: "2026-10-19",
    readingTime: "6 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: in the browser, atob() decodes Base64 to a string — atob(\"SGVsbG8=\") gives you \"Hello\". In Node.js, use Buffer.from(b64, \"base64\").toString(\"utf8\"). The one-liner breaks in three common situations: non-ASCII text comes back as mojibake, missing = padding throws, and base64url strings (the kind inside JWTs and URLs) use different characters. Handle those three and decoding works everywhere.",
      },
      { type: "h2", text: "The one-liner" },
      {
        type: "code",
        lang: "javascript",
        code: `// Browser\natob("SGVsbG8sIHdvcmxkIQ=="); // "Hello, world!"\n\n// Node.js\nBuffer.from("SGVsbG8sIHdvcmxkIQ==", "base64").toString("utf8"); // "Hello, world!"\n\n// Python\nimport base64\nbase64.b64decode("SGVsbG8sIHdvcmxkIQ==").decode("utf-8")  # "Hello, world!"`,
      },
      { type: "h2", text: "The Unicode trap" },
      {
        type: "p",
        text: "atob() returns a string where each character is one byte — Latin-1, not UTF-8. Decode Base64 that holds non-ASCII text and you get mojibake: the checkmark ✓ encodes to \"4pyT\", and atob(\"4pyT\") returns the three garbage characters \"âœ“\" instead of \"✓\". The fix is to treat the result as raw bytes and decode them as UTF-8:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function b64decodeUnicode(b64) {\n  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));\n  return new TextDecoder().decode(bytes);\n}\n\nb64decodeUnicode("4pyT"); // "✓" — correct`,
      },
      {
        type: "p",
        text: "This is the same trap in reverse when encoding: btoa() throws InvalidCharacterError on any character above U+00FF. Node's Buffer and Python's base64 handle Unicode correctly out of the box — only the browser one-liner needs the TextDecoder wrapper.",
      },
      { type: "h2", text: "Padding and base64url" },
      {
        type: "p",
        text: "Standard Base64 output is always a multiple of 4 characters, padded with = at the end. Two variants break the naive decoder. First, many producers strip the padding (JWTs do this) — atob() then throws because the length is not a multiple of 4. Re-add it: b64 += \"=\".repeat((4 - (b64.length % 4)) % 4). Second, base64url swaps + and / for - and _ so the string survives inside URLs and filenames. Convert back before decoding:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function b64urlDecode(b64url) {\n  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");\n  b64 += "=".repeat((4 - (b64.length % 4)) % 4); // restore padding\n  return new TextDecoder().decode(\n    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))\n  );\n}`,
      },
      { type: "h2", text: "Decoding images and files" },
      {
        type: "p",
        text: "Base64 images usually arrive as data URIs — data:image/png;base64,iVBORw0KGgo... The part after the comma is the payload; the part before it names the MIME type. Strip the prefix, decode to bytes, and wrap them in a Blob to get a real file back:",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function dataUriToBlob(dataUri) {\n  const [header, b64] = dataUri.split(",");\n  const mime = header.match(/data:(.*?);/)[1];\n  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));\n  return new Blob([bytes], { type: mime });\n}\n\n// Show it: img.src = URL.createObjectURL(dataUriToBlob(uri));\n// Save it: a.href = URL.createObjectURL(blob); a.download = "image.png";`,
      },
      { type: "h2", text: "The errors you will actually see" },
      {
        type: "list",
        items: [
          "InvalidCharacterError (browser): the string contains a character outside the Base64 alphabet — often whitespace, line breaks, or a stray quote copied from JSON. Strip everything that is not A–Z a–z 0–9 + / = (or - _ for base64url) before decoding.",
          "Incorrect padding (Python): the = padding is missing or the length is not a multiple of 4. Add padding with b64 += \"=\" * (-len(b64) % 4).",
          "Mojibake instead of an error: you decoded UTF-8 bytes as Latin-1. Use the TextDecoder version above.",
          "Decoded output that is still unreadable: the payload may be gzipped or it may be double-encoded. Try decoding twice — if the second pass produces clean text, the producer encoded an already-encoded string.",
        ],
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Is Base64 encryption? No. It is an encoding — anyone can decode it. Never treat Base64 as a way to hide secrets; it only makes binary data survive text channels.",
          "How do I decode a huge Base64 string? atob() handles megabytes fine in practice, but for very large payloads decode in chunks or stream it — building one giant intermediate string is what runs out of memory, not the decoding itself.",
          "Why does my Base64 have no = at the end? The producer used unpadded base64url (common in JWTs and URL tokens). Re-add the padding as shown above.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste any Base64 string into the [URL & Base64 Encoder](https://byte-kit.dev/tools/url-base64) — it decodes text in your browser and flags the padding and character errors above before they bite. Going the other direction? [How to Encode Text to Base64](/posts/how-to-encode-text-to-base64) covers encoding, including the same Unicode trap from the other side.",
      },
    ],
  },
  {
    slug: "how-jwt-works-header-payload-signature",
    title: "How JWT Works: Header, Payload, Signature",
    excerpt:
      "A JWT is three Base64 strings separated by dots: a header, a payload of claims, and a signature. The signature proves who issued it — the encoding proves nothing.",
    date: "2026-10-19",
    readingTime: "6 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: a JWT (JSON Web Token) is three base64url-encoded parts joined by dots — header.payload.signature. The header names the signing algorithm, the payload carries claims (who you are, when the token expires), and the signature is a cryptographic checksum over the first two parts made with the issuer's secret or private key. Anyone can read the payload — it is only encoded, not encrypted. Only someone with the key can produce a valid signature, and that asymmetry is the entire security model.",
      },
      { type: "h2", text: "The three parts" },
      {
        type: "p",
        text: "A token looks like this: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c. Split on the dots and base64url-decode the first two parts and you get plain JSON. The third part is opaque bytes — the signature.",
      },
      { type: "h2", text: "Part 1: the header" },
      {
        type: "code",
        lang: "json",
        code: `{\n  "alg": "HS256",\n  "typ": "JWT"\n}`,
      },
      {
        type: "p",
        text: "The header is small on purpose: it says which algorithm signed the token (alg — HS256, RS256, ES256 are the common ones) and that this is a JWT (typ). Some tokens also carry kid, a key ID telling the verifier which of several keys to check against — useful when keys rotate. The header is not trusted on its own: a verifier must check that alg is one it expects, because accepting an attacker-chosen algorithm is exactly how the old alg:none attacks worked (more on that below).",
      },
      { type: "h2", text: "Part 2: the payload and its claims" },
      {
        type: "code",
        lang: "json",
        code: `{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022,\n  "exp": 1516242622,\n  "iss": "https://auth.example.com",\n  "aud": "my-api"\n}`,
      },
      {
        type: "p",
        text: "The payload is a set of claims — name/value assertions about the subject. The JWT standard (RFC 7519) defines seven registered claims: iss (issuer), sub (subject — usually the user ID), aud (audience — who the token is for), exp (expiry, seconds since epoch), nbf (not-before), iat (issued-at), and jti (a unique token ID, handy for revocation lists). Everything else is a public or private claim — name, email, roles, permissions — namespaced by convention to avoid collisions. Keep payloads small: the whole token rides in an HTTP header on every request.",
      },
      { type: "h2", text: "Part 3: the signature" },
      {
        type: "p",
        text: "The signature is computed over the exact text of the first two parts: signature = SIGN(base64url(header) + \".\" + base64url(payload), key). With HS256 the key is a shared secret and both sides use HMAC-SHA256; with RS256 the issuer signs with its RSA private key and anyone verifies with the public key. Verification is just recomputation: the verifier re-signs the header and payload it received and compares the result with the signature on the token. Any change to even one character — a flipped claim, a swapped algorithm — produces a different signature and the token is rejected.",
      },
      { type: "h2", text: "Signed is not encrypted" },
      {
        type: "p",
        text: "This is the misunderstanding that causes real incidents. Base64url is an encoding, not encryption: the payload is readable by anyone who holds the token — paste it into any decoder and the claims are right there. The signature guarantees integrity and authenticity, not confidentiality. Never put passwords, SSNs, or anything sensitive in a payload. If the claims must be secret, that is a different token type (JWE, JSON Web Encryption) — a standard JWT is a signed postcard, not a sealed envelope.",
      },
      { type: "h2", text: "The alg:none trap" },
      {
        type: "p",
        text: "The classic JWT attack exploits verifiers that trust the header's alg field. An attacker takes a valid token, changes alg to \"none\", strips the signature, and edits the payload — say, promoting themselves to admin. A verifier that honors the header's algorithm choice accepts the unsigned token as genuine. The fix is on the verifier side and it is absolute: hardcode the expected algorithm, reject anything else, and reject unsigned tokens outright. Modern libraries do this by default; hand-rolled verification often does not.",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Can I decode a JWT without the secret? Yes — decoding needs no key, because the payload is only encoded. But decoding is not verifying: reading the claims tells you what the token says, only signature verification tells you whether to believe it.",
          "How long should a token live? Access tokens: minutes to an hour. Long-lived tokens are a liability if leaked — pair a short access token with a refresh token instead of stretching exp.",
          "HS256 or RS256? HS256 with a shared secret is fine when one service both issues and verifies. RS256 fits microservices: the auth server holds the private key, every service verifies with the public key, and no service can mint tokens.",
          "Where do I store it? Not in localStorage if XSS is a threat model — any script on the page can read it. HttpOnly cookies are the safer default for browser apps.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste a token into the [JWT Decoder](https://byte-kit.dev/tools/jwt-decoder) to see the header, payload, and claims decoded in your browser — nothing uploaded, which matters when the token belongs to a real user. Then read [How to Check If a JWT Is Expired (the exp Claim)](/posts/how-to-check-if-jwt-is-expired) for the expiry check and the seconds-vs-milliseconds trap.",
      },
    ],
  },
  {
    slug: "how-to-validate-json-online",
    title: "How to Validate JSON Online",
    excerpt:
      "Validating JSON means checking it against the strict JSON grammar — no trailing commas, no comments, double quotes only. Here are the 7 errors that break everything and how to read the error message.",
    date: "2026-10-19",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: paste the text into a JSON validator — or run JSON.parse() on it. Valid JSON is stricter than the JavaScript object literals you write every day: keys and strings need double quotes, trailing commas are forbidden, comments are not allowed, and the whole document must be a single value. Nearly every validation failure is one of seven mistakes, and modern parsers point at the exact position.",
      },
      { type: "h2", text: "What valid JSON actually allows" },
      {
        type: "p",
        text: "The grammar is tiny: objects with double-quoted keys, arrays, strings in double quotes, numbers, true, false, and null. That is the whole language. Everything developers habitually write in config files and then wonder why the parser rejects — single-quoted strings, trailing commas, comments, unquoted keys, NaN, Infinity, undefined — is not JSON. If your data comes from a human-edited file, assume one of those is present.",
      },
      { type: "h2", text: "The 7 errors that break everything" },
      {
        type: "list",
        items: [
          "Trailing commas: {\"a\": 1,} — legal in JavaScript, fatal in JSON. The most common error in hand-written config.",
          "Single quotes: {'a': 1} — JSON strings take double quotes only. A quick find-and-replace fixes it only if no string contains an apostrophe; safer to re-quote properly.",
          "Unquoted keys: {a: 1} — every key must be a double-quoted string.",
          "Comments: // and /* */ are not part of JSON. (JSONC — JSON with Comments — is a VS Code / TypeScript-config dialect, not JSON; parsers will reject it.)",
          "Multiple top-level values: {\"a\":1} {\"b\":2} — one document, one value. Newline-separated records are JSON Lines, a different format.",
          "Control characters in strings: raw newlines or tabs inside a \"string\" must be escaped as \\n and \\t.",
          "NaN, Infinity, undefined: not JSON values. Use null, or encode them as strings if you must round-trip them.",
        ],
      },
      { type: "h2", text: "Reading the error message" },
      {
        type: "code",
        lang: "javascript",
        code: `JSON.parse('{"a": 1,}');\n// SyntaxError: Unexpected token '}', "{"a": 1,}" is not valid JSON\n\nJSON.parse('{"a": 1');\n// SyntaxError: Unterminated string in JSON at position 8`,
      },
      {
        type: "p",
        text: "Modern JavaScript engines quote the offending input and give you a position — count characters from the start (position 0) to land on the exact spot. The reported position is where the parser gave up, which is usually one token after the real mistake: a missing closing quote at position 8 gets reported a few characters later. When the position points at the very end of the input, suspect a missing closing brace or bracket.",
      },
      {
        type: "code",
        lang: "javascript",
        code: `function validateJson(text) {\n  try {\n    JSON.parse(text);\n    return { valid: true };\n  } catch (e) {\n    return { valid: false, error: e.message };\n  }\n}\n\nvalidateJson('{"a": 1,}');\n// { valid: false, error: 'Unexpected token ...' }`,
      },
      { type: "h2", text: "Valid syntax is not enough: validate the shape" },
      {
        type: "p",
        text: "Parsing tells you the JSON is well-formed; it says nothing about whether it has the fields your code needs. For that, validate against a schema: JSON Schema (with a validator like Ajv in JavaScript) lets you declare required fields, types, and formats, and get structured errors — \"age must be a number\" instead of a crash three functions later. Syntax validation catches typos; schema validation catches wrong data.",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "Can I validate a huge file? Yes, but do not paste multi-megabyte files into a browser tab casually — parsing blocks the page while it runs. For large files, validate from the command line: python -m json.tool file.json or jq empty file.json both parse and report errors without loading a UI.",
          "Is there a way to allow comments? Use JSONC only where the consumer supports it (VS Code settings, tsconfig). If the consumer is JSON.parse, strip comments first — or better, keep the source as JSONC and generate strict JSON from it.",
          "Why does my API return HTML instead of JSON? That is the classic fetch bug: the server returned an error page (or you hit the wrong URL) and your code tried to parse HTML as JSON. Covered in detail in the linked post below.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Paste the document into the [JSON Formatter & Validator](https://byte-kit.dev/tools/json-formatter) — it validates as you type, highlights the exact error position, and pretty-prints the fixed result, all in your browser. If the error mentions HTML where JSON should be, [Fix \"Unexpected token < is not valid JSON\"](/posts/fix-unexpected-token-not-valid-json) walks through that specific bug.",
      },
    ],
  },
  {
    slug: "png-vs-jpg-which-format-to-use",
    title: "PNG vs JPG: Which Image Format Should You Use?",
    excerpt:
      "Photos go JPG, graphics go PNG. One format is lossy and tiny, the other is lossless with transparency — pick by what is in the picture, not by habit.",
    date: "2026-10-19",
    readingTime: "5 min read",
    author: "Shayan",
    content: [
      {
        type: "p",
        text: "Short answer: use JPG for photographs and PNG for graphics. JPG uses lossy compression tuned for the smooth gradients of photos — it shrinks a photo to a tenth of its size with no visible change. PNG is lossless and supports transparency, which makes it right for logos, screenshots, text, and UI elements — anything with sharp edges, where JPG's compression artifacts show up as ugly halos. Pick by what is in the picture.",
      },
      { type: "h2", text: "Lossy vs lossless, concretely" },
      {
        type: "p",
        text: "JPG compression (based on the discrete cosine transform) throws away high-frequency detail your eye barely registers in a photo — subtle texture, fine grain. At quality 80–85 a 5 MB photo becomes 400–600 KB and looks identical. PNG compression (DEFLATE, the same family as zip) throws away nothing: every pixel round-trips exactly. The price is size — a photographic PNG can be five to ten times larger than the same image as a JPG. Lossless is wasted on photos; lossy is destructive on graphics.",
      },
      { type: "h2", text: "Transparency decides for you" },
      {
        type: "p",
        text: "JPG has no alpha channel — every pixel is fully opaque, so transparent regions become white or black on conversion. If the image needs any transparency (a logo on a colored background, an icon, a watermark), PNG is the only choice of the two. This single constraint settles most real decisions: screenshots of UI with rounded corners, diagrams overlaid on pages, any asset that must composite — PNG.",
      },
      { type: "h2", text: "The decision list" },
      {
        type: "list",
        items: [
          "Photograph for a blog or portfolio → JPG at quality 80–85. Below 75, banding and blockiness creep into skies and skin; above 90, the file doubles for no visible gain.",
          "Screenshot with text or UI → PNG. JPG blurs text edges and adds ringing around every sharp line — the exact artifacts screenshots are full of.",
          "Logo, icon, or illustration → PNG (or SVG if it is vector — infinitely sharper and smaller).",
          "Image needing transparency → PNG, no contest.",
          "Photo where every byte matters → JPG progressive. Progressive JPGs render top-to-bottom in passes, so the page shows a blurry preview fast and sharpens — better perceived loading than baseline JPG.",
          "Simple graphic with few colors → PNG-8 (256 colors) instead of PNG-24 — often a third of the size with zero visible difference on flat illustrations.",
        ],
      },
      { type: "h2", text: "The 80–85 quality rule" },
      {
        type: "p",
        text: "JPG quality is a dial, not a preset. The useful range is narrow: 80–85 is the sweet spot for the web, where artifacts stay invisible and files stay small. Exporting at 100 does not mean lossless — JPG is always lossy — it just means enormous. And never re-save a JPG as a JPG repeatedly at low quality: each generation piles new artifacts on the old ones. Keep one high-quality master, export delivery copies from it.",
      },
      { type: "h2", text: "Quick answers" },
      {
        type: "list",
        items: [
          "What about WebP and AVIF? Both beat JPG and PNG on size — WebP by 25–35%, AVIF by up to 50% — and both handle transparency. Use them for production sites with a JPG/PNG fallback; for files you email or hand to other people, JPG/PNG remain the universal choice.",
          "Why is my PNG screenshot 4 MB? PNG is lossless, so noisy content (photo backgrounds, gradients, anti-aliased text over texture) compresses badly. Either accept it, or convert photographic screenshots to JPG at quality 85.",
          "Does format affect SEO? Indirectly: page speed is a ranking factor, and images are usually the heaviest resource. Right format plus right quality is the cheapest performance win on most pages.",
        ],
      },
      { type: "h2", text: "Try it" },
      {
        type: "p",
        text: "Converting a folder of PNG screenshots to JPGs? The [Batch Image Converter](https://byte-kit.dev/tools/batch-image-converter) does the whole folder in your browser at your chosen quality — nothing uploaded. For the step-by-step, see [How to Convert Multiple PNGs to JPG at Once](/posts/batch-convert-png-to-jpg); for the modern formats, [WebP vs JPEG](/posts/webp-vs-jpeg) covers when to skip both.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((post) => post.slug === slug);
