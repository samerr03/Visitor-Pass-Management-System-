const https = require('https');

https.get('https://d3rhxd4jwoeunz.cloudfront.net/', res => {
    let html = '';
    res.on('data', d => html += d);
    res.on('end', () => {
        const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (match) {
            const jsUrl = 'https://d3rhxd4jwoeunz.cloudfront.net' + match[1];
            console.log('Fetching JS:', jsUrl);
            https.get(jsUrl, jsRes => {
                let js = '';
                jsRes.on('data', d => js += d);
                jsRes.on('end', () => {
                    console.log('Length:', js.length);
                    console.log('Contains localhost?', js.includes('localhost'));
                    console.log('Contains EC2 IP?', js.includes('54.210.114.254'));
                    console.log('Contains /api/auth/login?', js.includes('/api/auth/login') || js.includes('auth/login'));
                    console.log('Contains VITE_API_BASE_URL fallbacks?', js.includes('http://localhost:5000/api'));
                });
            });
        } else {
            console.log('No JS matched:', html.substring(0, 200));
        }
    });
});
