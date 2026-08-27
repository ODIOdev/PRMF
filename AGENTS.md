# PRMF — official platform targets

Use only these. Do not create alternate remotes, Vercel projects, or Supabase projects.

| Role | Target |
| --- | --- |
| Git / pushes | https://github.com/ODIOdev/PRMF.git (`origin`, branch `main`) |
| Deploy | Vercel team `over-drive0s-projects`, project [`prmf`](https://vercel.com/over-drive0s-projects/prmf) (`prj_1cTXJz2wT7AUsUktjHih5GtM7lDY`) |
| SQL / backend | https://rdzmpabrvkslfvkdbivj.supabase.co (ref `rdzmpabrvkslfvkdbivj`) |

`NEXT_PUBLIC_SUPABASE_URL` must always be `https://rdzmpabrvkslfvkdbivj.supabase.co`.

Never use `https://xrwvaelhmibhslmfvxrs.supabase.co`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
