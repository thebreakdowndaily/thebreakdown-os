# THE BREAKDOWN
## Publish Command v1.0 — Deployment Pipeline

### Mission
Take the verified, edited, HTML-rendered story through final checks and deploy to production.

### Pre-Publish Checklist
- [ ] Editorial review score ≥ 8/10
- [ ] All fact-check items resolved
- [ ] SEO metadata validated (title ≤60, description ≤165)
- [ ] JSON-LD present and valid
- [ ] All links resolve (no 404s)
- [ ] Charts render in both light and dark mode
- [ ] Reading time estimate accurate
- [ ] Tags match existing taxonomy (no new tags without review)
- [ ] Breadcrumbs correct for category

### Deploy Steps
1. **Stage** — Copy `index.html` to `stories/{slug}/`
2. **Build** — Run `npm run build` (triggers `build-content.mjs` + `next build`)
3. **Verify build** — Confirm 361+ pages, 0 errors
4. **Commit** — `git add -A && git commit -m "[slug]: [brief description]"`
5. **Push** — `git push origin master`
6. **Confirm deploy** — Cloudflare Pages auto-builds from push
7. **Verify live** — Fetch `https://thebreakdown.in/story/{slug}` → 200

### Post-Publish
- [ ] Update ticker.json if story is top-5 important
- [ ] Create Instagram carousel post
- [ ] Schedule newsletter feature
- [ ] Share on X/LinkedIn
- [ ] Add to relevant category page filter (if needed)

### Rollback
If build fails or live page has errors:
1. `git revert HEAD` to undo last commit
2. Push reverted commit
3. Confirm previous version is live
4. Fix issue in branch, re-submit
