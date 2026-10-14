# ByteTips

A clean, minimal developer blog at https://bytetips.tech. Short, practical how-to guides
for developers — each post links to a free Byte-Kit tool (https://byte-kit.dev) that does
the job in the browser.

## Develop

```bash
npm install
npm run dev
```

## Build (static export)

```bash
NEXT_PUBLIC_SITE_URL=https://bytetips.tech NEXT_PUBLIC_BASE_PATH="" npm run build
```

Output goes to `out/`. Deploy the `out/` directory to any static host.
