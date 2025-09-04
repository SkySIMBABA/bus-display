// api/bus.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { busStopCode, apiKey } = req.query;
    
    if (!busStopCode || !apiKey) {
        return res.status(400).json({ 
            error: 'Missing busStopCode or apiKey parameter' 
        });
    }

    try {
        const response = await fetch(
            `https://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${busStopCode}`,
            {
                headers: {
                    'AccountKey': apiKey,
                    'accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`LTA API Error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Failed to fetch bus data from LTA API'
        });
    }
}
