# Collector receipts

`private/` is ignored and holds raw CLI envelopes only long enough to sanitize them. Public receipts are strict allowlists containing the collector identifier, name, status, completed steps, optional view URL and creation time, plus a SHA-256 digest of the private source envelope.

```bash
brightdata scraper create \
  https://github.com/FreeCAD/FreeCAD/issues/18969 \
  "Extract the issue title, open or closed status, labels, assignees, and links to related pull requests. Return empty arrays when absent." \
  --name bounty-sentinel-freecad-18969 \
  --json --pretty \
  --output receipts/private/freecad-18969-create.json

npm run sanitize-receipt -- \
  receipts/private/freecad-18969-create.json \
  receipts/freecad-18969-create.public.json
```

No API keys, authorization headers, cookies, customer identifiers, email addresses, private URLs, or raw page bodies may be committed.
