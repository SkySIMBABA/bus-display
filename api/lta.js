// api/lta.js
// Vercel serverless function that proxies requests to LTA DataMall BusArrival API

// NOTE: This file should be deployed to Vercel where LTA_API_KEY is configured in Environment Variables.

// Simple in-memory cache to reduce requests to LTA and mitigate rate limits.
// Note: Serverless functions may be cold-started; this cache is best-effort and lives only for the function container lifetime.
const cache = new Map(); // key -> { ts, data }
const CACHE_TTL_MS = 10 * 1000; // 10 seconds

export default async function handler(req, res) {
    // Safer CORS handling: allow specific frontend origin if provided via env, otherwise allow all for convenience
    const frontendOrigin = process.env.FRONTEND_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { busStopCode } = req.query || {};
    const apiKey = process.env.LTA_API_KEY;

    if (!apiKey) {
        console.error('LTA_API_KEY environment variable not set.');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    if (!busStopCode) {
        return res.status(400).json({ error: 'BusStopCode query parameter is required.' });
    }

    const cacheKey = String(busStopCode);
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.ts) < CACHE_TTL_MS) {
        // Return cached data
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', `public, max-age=${Math.floor(CACHE_TTL_MS/1000)}`);
        return res.status(200).json(cached.data);
    }

    const apiUrl = `https://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${encodeURIComponent(busStopCode)}`;

    try {
        const axios = await import('axios');
        const response = await axios.default.get(apiUrl, {
            headers: {
                'AccountKey': apiKey,
                'accept': 'application/json'
            },
            timeout: 8000
        });

        // Cache the fresh data
        cache.set(cacheKey, { ts: Date.now(), data: response.data });

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `public, max-age=${Math.floor(CACHE_TTL_MS/1000)}`);
        return res.status(200).json(response.data);

    } catch (err) {
        console.error('Error fetching LTA API:', err.message || err);
        const status = err.response ? err.response.status : 500;
        const message = err.response && err.response.data ? err.response.data : err.message;
        return res.status(status).json({ error: 'Failed to fetch from LTA API', details: message });
    }
}
