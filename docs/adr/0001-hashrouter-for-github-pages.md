# Use HashRouter instead of BrowserRouter

The app deploys as static files to GitHub Pages (`.github/workflows/deploy.yml`), which has no server-side rewrite rule to redirect a deep-link 404 (e.g. `/accounts/123`) back to `index.html`. `App.tsx` uses React Router's `HashRouter` so all routes resolve client-side via the URL fragment (`#/accounts/123`), which never reaches the server and therefore always resolves. The trade-off is the visible `#` in every URL.
