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
        code: `const name = "John & Jane";\\n\\n// WRONG: encodeURI leaves & alone, so the value splits in two\\n"https://example.com/search?name=" + encodeURI(name);\\n// → https://example.com/search?name=John & Jane  (broken: name=John, plus a stray param)\\n\\n// RIGHT: encodeURIComponent encodes the & as %26\\n"https://example.com/search?name=" + encodeURIComponent(name);\\n// → https://example.com/search?name=John%20%26%20Jane  (one value, correct)`,
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
        code: `// WRONG: encoded twice — % becomes %25\\nencodeURIComponent(encodeURIComponent("a b")); // "a%2520b"\\n\\n// RIGHT: encode once\\nencodeURIComponent("a b"); // "a%20b"\\n\\n// Let URLSearchParams do it — it encodes values for you\\nconst params = new URLSearchParams({ name: "John & Jane" });\\nparams.toString(); // "name=John+%26+Jane"`,
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
        code: `const res = await fetch("/api/users");\\nconst text = await res.text();\\nconsole.log(res.status, res.headers.get("content-type"));\\nconsole.log(text.slice(0, 200));\\nconst data = JSON.parse(text); // only after you know it is JSON`,
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
        code: `async function fetchJson(url) {\\n  const res = await fetch(url);\\n  const text = await res.text();\\n  if (!res.ok) {\\n    throw new Error("Request failed: " + res.status + " " + res.statusText + " — " + text.slice(0, 200));\\n  }\\n  if (!res.headers.get("content-type")?.includes("application/json")) {\\n    throw new Error("Expected JSON, got: " + text.slice(0, 200));\\n  }\\n  return JSON.parse(text);\\n}`,
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
        code: `const pretty = '{\\n  "a": 1,\\n  "b": 2\\n}';\nconst minified = JSON.stringify(JSON.parse(pretty));\nconsole.log(minified); // {"a":1,"b":2}`,
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
        code: `import yaml, json\\n\\nwith open("config.yaml") as f:\\n    data = yaml.safe_load(f)  # never yaml.load without a Loader — safe_load blocks arbitrary code execution\\n\\nprint(json.dumps(data, indent=2))`,
      },
      {
        type: "p",
        text: "Use safe_load, not load. Plain yaml.load can construct arbitrary Python objects from a malicious file — safe_load only builds plain dicts, lists, strings, and numbers. If a teammate's config.yaml came from the internet, this one-word difference is a real security boundary.",
      },
      { type: "h2", text: "Node.js" },
      {
        type: "code",
        lang: "javascript",
        code: `import yaml from "js-yaml";\\nimport { readFileSync } from "node:fs";\\n\\nconst data = yaml.load(readFileSync("config.yaml", "utf8"));\\nconsole.log(JSON.stringify(data, null, 2));`,
      },
      { type: "h2", text: "yq on the command line" },
      {
        type: "code",
        lang: "bash",
        code: `# one file to stdout\\nyq -o=json config.yaml\\n\\n# one file to disk\\nyq -o=json config.yaml > config.json\\n\\n# every manifest in a directory (the Kubernetes habit)\\nfor f in manifests/*.yaml; do\\n  yq -o=json "$f" > "\${f%.yaml}.json"\\ndone`,
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
        code: `# PyYAML\\nfound character '\\t' that cannot start any token\\n\\n# js-yaml\\nbad indentation of a mapping entry`,
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
];

export const getPost = (slug: string) => posts.find((post) => post.slug === slug);
