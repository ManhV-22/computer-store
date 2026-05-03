const http = require('http');

function testReview() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc3NDcyMzEyLCJleHAiOjE3Nzc1NTg3MTJ9.lE6vxOSONJs8zlGPFUrAoaPTsvJ7RuECIHG5zu_DVTo';
  const postData = JSON.stringify({
    rating: 5,
    comment: 'Test review from backend'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/products/35/review',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
  });

  req.write(postData);
  req.end();
}

testReview();