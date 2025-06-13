const axios = require('axios');

const SERVICE_MS_BASE_URL = "http://127.0.0.1:3000";

export const getServiceById = async (serviceId) => {
    try {
        const res = await axios.get(`${SERVICE_MS_BASE_URL}/api/services?q=${serviceId}`, {
            headers: {
                'x-internal-service': 'true',
            },
        });
        return res.data;
    } catch (err) {
        console.error("Error fetching service:", err.message);
        return null;
    }
};
