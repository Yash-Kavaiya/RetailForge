# RetailForge — Hackathon Submission Kit

Everything needed for the Devpost submission, in one place. **Macy's-inspired theme**
(red star, editorial serif, black/white) consistent with the live storefront.

**Live demo:** https://retailforge-frontend-awghszkm2a-uc.a.run.app

## What's here

```
submission/
├── deck/
│   ├── retailforge.tex      # LaTeX Beamer source (Macy's theme)
│   └── retailforge.pdf      # 16-slide presentation, 16:9  ← present this
├── diagrams/
│   ├── theme.json           # shared mermaid red/black/white theme
│   ├── architecture.{mmd,png}   # 4 Cloud Run services + Atlas
│   ├── agents.{mmd,png}         # root concierge + 4 specialists
│   ├── dataflow.{mmd,png}       # semantic search & action flow
│   └── cicd.{mmd,png}           # GitHub Actions → Cloud Build → Terraform → Cloud Run
├── screenshots/             # captured live from the deployed storefront
│   ├── home-hero.png        ├── product-detail.png   ├── concierge-chat.png
│   ├── home-desktop.png     ├── orders.png           ├── concierge-search.png
│   └── home-mobile.png
└── devpost/
    └── devpost-writeup.md   # Inspiration / What it does / How / Challenges / etc. + gallery captions
```

## Devpost checklist

1. **Project story** — paste the sections from [devpost/devpost-writeup.md](devpost/devpost-writeup.md).
2. **Built With** — tag list is at the bottom of the writeup.
3. **Gallery** — upload everything in `screenshots/` and `diagrams/*.png`; captions are in
   the writeup's "Gallery" section.
4. **Presentation** — attach `deck/retailforge.pdf` (or screen-share it in the demo video).
5. **Try it link** — the live storefront URL above.

## Rebuilding the artifacts

Requires MiKTeX/TeX Live (`latexmk`), Node, and the mermaid CLI (`mmdc`).

```bash
# Diagrams (run from submission/diagrams/)
for f in architecture agents dataflow cicd; do
  mmdc -i "$f.mmd" -o "$f.png" -c theme.json -b white -s 2
done

# Presentation (run from submission/deck/) — two passes for TikZ overlay positions
latexmk -pdf retailforge.tex
```

> Screenshots were captured from the live Cloud Run storefront. To refresh them, re-run a
> browser against the live URL (home, a `/products/<sku>` page, `/orders`, and the concierge
> widget) at 1440px desktop and 390px mobile.

## Notes

- The `concierge-chat.png` / `concierge-search.png` captures show the **live multi-agent
  hand-off** (`transfer_to_agent` → specialist "Building your kit… / Searching the catalog…").
  On a cold backend the final generative card can take a while to stream; the captures
  intentionally show the orchestration in flight, which is the part judges care about.
- The deck uses TikZ overlays — always compile it **twice** (or via `latexmk`) so the
  full-bleed title/closing slides position correctly.
