const https = require('http');

const testLogin = () => {
    const postData = JSON.stringify({
        email: 'info@veerive.com',
        password: 'admin123'
    });

    const options = {
        hostname: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 3050,
        path: '/api/users/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Origin': process.env.ORIGIN || 'http://localhost:3002'
        }
    };

    const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', data);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
};

testLogin();
