Totoro Bus Stop - Vercel Deployment

This repo contains a static frontend (`singapore_bus_display.html`) and a Vercel serverless function (`api/lta.js`) that proxies requests to the LTA DataMall BusArrival API.

Quick setup:
1. Create a new GitHub repository and push this folder's contents.
2. In Vercel, import the GitHub repository as a new project.
3. In Project Settings -> Environment Variables, add `LTA_API_KEY` with your DataMall API key.
4. Deploy. The frontend will be available at your Vercel app URL, and it will call `/api/lta?busStopCode=XXXX` internally.

Local testing:
- Install Vercel CLI and run `vercel dev` from the project root to emulate serverless functions locally.
- Or open `singapore_bus_display.html` in a browser for mock-data mode (no backend/API key).

Environment variables
- `LTA_API_KEY` (required): Your LTA DataMall AccountKey. Add this in Vercel Project Settings -> Environment Variables.
- `FRONTEND_ORIGIN` (optional): When set to your frontend URL (e.g. `https://your-app.vercel.app`), the API will set `Access-Control-Allow-Origin` to that value. If omitted, the API will set `*` for convenience (useful for dev).

Local run (detailed)
1. Install dependencies and Vercel CLI:
	```powershell
	npm install
	npm i -g vercel
	```
2. Start the local dev server which emulates Vercel functions:
	```powershell
	vercel dev
	```
3. Open the printed URL (usually http://localhost:3000). The frontend will be served and `/api/lta` will be available locally.

Notes on caching and rate limits
- The server adds a small in-memory cache (10s TTL) to reduce duplicate calls when multiple clients poll the same bus stop frequently. This is a best-effort cache and will reset on cold starts.

If you want me to make the frontend static files sit in a `public/` folder and cleanly separate JS/CSS into files, I can do that next.

Security:
- Do not commit your API key to the repository. Use Vercel environment variables.

If you want, I can split inline JS/CSS into separate `public/` files and add a small build step.
