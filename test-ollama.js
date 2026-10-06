const OLLAMA_HOST = 'http://127.0.0.1:11434';

console.log(`Testing raw fetch to ${OLLAMA_HOST}...`);

(async () => {
    try {
        const res = await fetch(`${OLLAMA_HOST}/api/tags`);
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text.slice(0, 100));
        console.log('✅ Success!');
    } catch (e) {
        console.error('❌ Fetch failed.');
        console.error('Error:', e.message);
        if (e.cause) console.error('Cause:', e.cause);
    }
})();
