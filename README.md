# TRANScesspool Trivia (Vercel-Ready)

**Pages Router** Next.js app with a working `/` route.

## Deploy (GitHub web)
1. Upload the **contents** of this folder to a new GitHub repo.
2. On Vercel: **Add New Project → Import** the repo → Deploy.

## Avatars
Place images at `public/avatars/` with names:  
`dan.jpg, adam.jpg, ariel.jpg, ricci.jpg, shaun.jpg, brad.jpg, matty.jpg`  
Missing images fall back to `fallback.jpg`.

## Questions
Use the **Import Questions JSON** button; JSON shape:
```json
{ "questions": [ { "quote": "…", "options": ["Dan", "Adam Mandelbaum", "…"], "answer": "…" } ] }
```
