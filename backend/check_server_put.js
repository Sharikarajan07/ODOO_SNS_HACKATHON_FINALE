const { exec } = require('child_process');
const http = require('http');

function checkServer() {
    const req = http.request('http://localhost:5000/api/quizzes/4', { method: 'PUT' }, (res) => {
        console.log('PUT /api/quizzes/4 Status:', res.statusCode);
    });
    req.on('error', (e) => console.log('Server not reachable:', e.message));
    req.end();
}

console.log('Checking if server accepts PUT /api/quizzes/4...');
checkServer();
