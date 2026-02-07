const axios = require('axios');

async function testEndpoints() {
    try {
        console.log('Testing GET /api/quizzes/4...');
        // We need a token for authentication, but let's see if we get 401 (Auth required) or 404 (Not Found). 
        // If 404, route is missing. If 401, route exists but needs auth.
        try {
            await axios.get('http://localhost:3000/api/quizzes/4');
        } catch (e) {
            console.log('GET Response:', e.response ? e.response.status : e.message);
        }

        console.log('Testing PUT /api/quizzes/4...');
        try {
            await axios.put('http://localhost:3000/api/quizzes/4', { title: 'Test' });
        } catch (e) {
            console.log('PUT Response:', e.response ? e.response.status : e.message);
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

testEndpoints();
