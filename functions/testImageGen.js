const fetch = require('node-fetch');

async function testImageGeneration() {
    console.log('Testing image generation...\n');

    const testPrompt = 'Surrealism style: A radiant burst of warm, golden light merging with a complex fractal structure.';

    try {
        console.log('Sending request to generateImage function...');
        console.log('Prompt:', testPrompt);

        const response = await fetch('https://us-central1-realness-score.cloudfunctions.net/generateImage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagePrompt: testPrompt })
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('\n✅ SUCCESS! Image generated');
            console.log('Image size:', result.result.imageUrl.length, 'characters (base64)');
            console.log('MIME type:', result.result.mimeType);
            console.log('\nImage generation is working correctly!');
        } else {
            const error = await response.json();
            console.log('\n❌ ERROR:', error.error);

            if (error.error.includes('Vertex AI API has not been used')) {
                console.log('\n⚠️  Vertex AI API is not enabled yet.');
                console.log('Please enable it at:');
                console.log('https://console.developers.google.com/apis/api/aiplatform.googleapis.com/overview?project=realness-score');
            }
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testImageGeneration();
