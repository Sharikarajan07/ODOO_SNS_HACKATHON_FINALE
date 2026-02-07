const http = require('http');

function checkProxy() {
    console.log('Checking Front-end Proxy (Port 3000)...');
    const req = http.request('http://localhost:3000/api/quizzes/4', { method: 'PUT' }, (res) => {
        console.log('PUT /api/quizzes/4 via Proxy Status:', res.statusCode);
    });
    req.on('error', (e) => console.log('Proxy check failed:', e.message));
    req.end();
}

checkProxy();
