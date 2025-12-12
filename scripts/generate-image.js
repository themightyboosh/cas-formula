#!/usr/bin/env node

/**
 * Generate archetype image using image generation API
 * Usage: node scripts/generate-image.js <archetype-id>
 */

const fs = require('fs');
const path = require('path');

// Archetype data - Core Attachment Style (CAS) archetypes
const archetypes = [
  {
    id: 1,
    name: "grounded-navigator",
    displayName: "Grounded Navigator",
    imagePrompt: "A centered figure standing on solid ground, roots extending downward, arms open and balanced, surrounded by calm waters and gentle light"
  },
  {
    id: 2,
    name: "emotional-enthusiast",
    displayName: "Emotional Enthusiast",
    imagePrompt: "A figure reaching out with open arms, heart radiating outward in waves, expressive face tilted upward, surrounded by flowing patterns of connection"
  },
  {
    id: 3,
    name: "lone-wolf",
    displayName: "Lone Wolf",
    imagePrompt: "A solitary figure standing apart on a mountain peak, looking into the distance, self-contained and alert, protective space around them"
  },
  {
    id: 4,
    name: "mystery-mosaic",
    displayName: "Mystery Mosaic",
    imagePrompt: "A figure with dual expressions, one half reaching forward and one half pulling back, fragmented but whole, standing at a threshold between light and shadow"
  },
  {
    id: 5,
    name: "heartfelt-defender",
    displayName: "Heartfelt Defender",
    imagePrompt: "A figure with polished armor and a shield, but cracks showing vulnerability beneath, standing guard while protecting their inner self"
  },
  {
    id: 6,
    name: "chill-conductor",
    displayName: "Chill Conductor",
    imagePrompt: "A composed figure with head filled with stars and constellations, observing from above, hands conducting invisible patterns, detached but aware"
  },
  {
    id: 7,
    name: "passionate-pilgrim",
    displayName: "Passionate Pilgrim",
    imagePrompt: "A figure in motion, walking toward another with arms outstretched, boundaries dissolving, merging energy between two forms"
  },
  {
    id: 8,
    name: "independent-icon",
    displayName: "Independent Icon",
    imagePrompt: "A strong solitary figure standing tall and self-sufficient, barriers around them like walls, looking straight ahead with fierce determination"
  }
];

// Master style to append
const MASTER_STYLE = "Woodcut and scratchboard style, bold black and white contrast, uniform parallel line hatching, no gray tones, high contrast, intricate crosshatching for shadows, clean carved lines, traditional printmaking aesthetic";

function getFullPrompt(archetype) {
  return `${archetype.imagePrompt}, ${MASTER_STYLE}`;
}

async function generateImageVertexAI(archetypeId, projectId, location = 'us-central1') {
  const archetype = archetypes.find(a => a.id === archetypeId);
  const fullPrompt = getFullPrompt(archetype);

  // Vertex AI Imagen API endpoint
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`;

  // Get access token using gcloud or service account
  // For now, we'll use the API key method if available
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS required for Vertex AI');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAccessToken(apiKey)}`
      },
      body: JSON.stringify({
        instances: [{
          prompt: fullPrompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_all'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI Error: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
      const imageBuffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
      
      const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'images');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const filename = `archetype-${archetypeId}-${archetype.name}.png`;
      const filepath = path.join(assetsDir, filename);
      
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`✅ Image generated successfully using Vertex AI Imagen!`);
      console.log(`💾 Image saved to: ${filepath}\n`);
      
      return filepath;
    } else {
      throw new Error('Unexpected response format from Vertex AI');
    }
  } catch (error) {
    throw error;
  }
}

async function getAccessToken(apiKey) {
  // For Vertex AI, we need an OAuth token
  // If using service account, use google-auth-library
  // For now, try using the API key directly (may not work)
  return apiKey;
}

async function generateImageGoogleGemini(archetypeId, apiKey) {
  const archetype = archetypes.find(a => a.id === archetypeId);
  const fullPrompt = getFullPrompt(archetype);

  // Google Imagen 3 API (via Gemini API)
  // Try Imagen 3 endpoint first
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        number_of_images: 1,
        aspect_ratio: "1:1",
        safety_filter_level: "block_some",
        person_generation: "allow_all"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If Imagen endpoint fails, try alternative approach
      if (response.status === 404 || errorText.includes('not found')) {
        throw new Error(`Imagen API not available. Trying alternative method...`);
      }
      throw new Error(`Google API Error: ${errorText}`);
    }

    const data = await response.json();
    
    // Imagen 3 returns images in generatedImages array
    if (data.generatedImages && data.generatedImages[0]) {
      const imageData = data.generatedImages[0];
      
      // Check for base64 encoded image
      if (imageData.base64String) {
        const imageBuffer = Buffer.from(imageData.base64String, 'base64');
        
        const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'images');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }

        const filename = `archetype-${archetypeId}-${archetype.name}.png`;
        const filepath = path.join(assetsDir, filename);
        
        fs.writeFileSync(filepath, imageBuffer);
        console.log(`✅ Image generated successfully using Google Imagen 3!`);
        console.log(`💾 Image saved to: ${filepath}\n`);
        
        return filepath;
      } else if (imageData.imageUrl) {
        // If URL is provided, download it
        const imageResponse = await fetch(imageData.imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        
        const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'images');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }

        const filename = `archetype-${archetypeId}-${archetype.name}.png`;
        const filepath = path.join(assetsDir, filename);
        
        fs.writeFileSync(filepath, Buffer.from(imageBuffer));
        console.log(`✅ Image generated successfully using Google Imagen 3!`);
        console.log(`💾 Image saved to: ${filepath}\n`);
        
        return filepath;
      } else {
        throw new Error('Unexpected response format from Imagen API');
      }
    } else {
      throw new Error('Unexpected response format from Imagen API');
    }
  } catch (error) {
    // If Imagen fails, provide helpful error message
    if (error.message.includes('alternative method') || error.message.includes('not found')) {
      console.log('\n⚠️  Imagen 3 API endpoint not available with this API key.');
      console.log('\n📋 Options:');
      console.log('   1. Generate manually at: https://aistudio.google.com/');
      console.log('   2. Use OpenAI DALL-E (set OPENAI_API_KEY)');
      console.log('   3. Enable Vertex AI Imagen API in Google Cloud Console\n');
      console.log('📝 Full prompt to use:\n');
      console.log(fullPrompt);
      console.log('\n');
      return null; // Return null instead of throwing to allow fallback
    }
    throw error;
  }
}

async function generateImageOpenAI(archetypeId, apiKey) {
  const archetype = archetypes.find(a => a.id === archetypeId);
  const fullPrompt = getFullPrompt(archetype);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;

  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  
  const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'images');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const filename = `archetype-${archetypeId}-${archetype.name.toLowerCase().replace(/\s+/g, '-')}.png`;
  const filepath = path.join(assetsDir, filename);
  
  fs.writeFileSync(filepath, Buffer.from(imageBuffer));
  console.log(`✅ Image generated successfully using OpenAI DALL-E!`);
  console.log(`💾 Image saved to: ${filepath}\n`);
  
  return filepath;
}

async function generateImage(archetypeId = 1) {
  const archetype = archetypes.find(a => a.id === archetypeId);
  
  if (!archetype) {
    console.error(`Archetype with id ${archetypeId} not found`);
    process.exit(1);
  }

  const fullPrompt = getFullPrompt(archetype);
  
  console.log(`\n🎨 Generating image for: ${archetype.name}`);
  console.log(`📝 Full prompt:\n${fullPrompt}\n`);

  // Check for Vertex AI setup (preferred method)
  const googleProjectId = process.env.GOOGLE_PROJECT_ID;
  const googleLocation = process.env.GOOGLE_LOCATION || 'us-central1';
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const googleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  // Check for OpenAI API key
  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.DALLE_API_KEY;

  // Try Vertex AI first (if project ID is set)
  if (googleProjectId && (googleApiKey || googleCredentials)) {
    console.log('🔵 Using Vertex AI Imagen API...\n');
    try {
      return await generateImageVertexAI(archetypeId, googleProjectId, googleLocation);
    } catch (error) {
      console.error('❌ Vertex AI Error:', error.message);
      console.log('🔄 Trying alternative method...\n');
    }
  }

  // Try Google Gemini API (if API key available)
  if (googleApiKey) {
    console.log('🔵 Using Google Gemini API...\n');
    try {
      return await generateImageGoogleGemini(archetypeId, googleApiKey);
    } catch (error) {
      console.error('❌ Google Gemini API Error:', error.message);
      if (openaiApiKey) {
        console.log('🔄 Falling back to OpenAI...\n');
      } else {
        console.log('\n📋 Copy this prompt to your image generator:\n');
        console.log(fullPrompt);
        console.log('\n');
        return;
      }
    }
  }

  if (openaiApiKey) {
    console.log('🟢 Using OpenAI DALL-E API...\n');
    try {
      return await generateImageOpenAI(archetypeId, openaiApiKey);
    } catch (error) {
      console.error('❌ OpenAI API Error:', error.message);
      console.log('\n📋 Copy this prompt to your image generator:\n');
      console.log(fullPrompt);
      console.log('\n');
      return;
    }
  }

  // No API keys found
  console.log('⚠️  No API credentials found.');
  console.log('\n📋 To use Vertex AI Imagen API (recommended), set:');
  console.log('   GOOGLE_PROJECT_ID=your-project-id');
  console.log('   GOOGLE_API_KEY=your-key (or GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json)');
  console.log('   GOOGLE_LOCATION=us-central1 (optional)');
  console.log('\n📋 To use Google Gemini API, set:');
  console.log('   GOOGLE_API_KEY=your-key');
  console.log('\n📋 To use OpenAI DALL-E, set:');
  console.log('   OPENAI_API_KEY=your-key');
  console.log('\n📋 See GOOGLE_CLOUD_SETUP.md for detailed setup instructions.');
  console.log('\n📋 Or copy this prompt to your image generator:\n');
  console.log(fullPrompt);
  console.log('\n');
}

// Run if called directly
if (require.main === module) {
  const archetypeId = parseInt(process.argv[2]) || 1;
  generateImage(archetypeId).catch(console.error);
}

module.exports = { generateImage, getFullPrompt };

