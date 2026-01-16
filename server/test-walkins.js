const axios = require('axios');

async function testEndpoints() {
    try {
        console.log('Testing /api/walkins...');
        const res = await axios.get('http://localhost:5000/api/walkins');
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testEndpoints();
