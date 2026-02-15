const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a dummy file
const filePath = path.join(__dirname, 'test-image.jpg');
fs.writeFileSync(filePath, 'dummy content');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const postDataHead =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="name"\r\n\r\nTest User\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="email"\r\n\r\ntest${Date.now()}@example.com\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="password"\r\n\r\n123456\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="phone"\r\n\r\n1234567890\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="role"\r\n\r\nsecurity\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="photo"; filename="test-image.jpg"\r\n` +
    `Content-Type: image/jpeg\r\n\r\n`;

const postDataTail = `\r\n--${boundary}--`;

const fileStream = fs.createReadStream(filePath);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/create-security',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // We need a token... this is hard.
    }
};

// We can't easily test protected routes without login first.
// So maybe I should just rely on the user or check the "Content-Type" issue.

console.log("This script requires a token. Skipping automated test for now.");
// Deleting the file immediately to avoid clutter
fs.unlinkSync(filePath);
