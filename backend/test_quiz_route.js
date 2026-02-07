const axios = require('axios');

async function testQuizRoute() {
    try {
        // Attempt to access a hypothetical quiz ID 4
        console.log('Testing GET /api/quizzes/4...');
        const response = await axios.get('http://localhost:5000/api/quizzes/4');
        console.log('Response:', response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error:', error.response.status, error.response.statusText);
            console.log('Data:', error.response.data);
        } else {
            console.error('Network Error:', error.message);
        }
    }
}

testQuizRoute();
