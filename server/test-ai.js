require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Using API Key:', key ? 'Key exists' : 'Key missing');
    
    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log('Fetching model list...');
        // The listModels method is on the genAI object in some versions
        // In @google/generative-ai, you can use genAI.getGenerativeModel({model: "..."}) 
        // but to list them you might need to use a different approach or just guess.
        
        // Let's try to use the fetch API to list models directly if possible
        // or just try a few more common names.
        const models = [
             "gemini-3.5-flash",
             "gemini-3.1-flash",
             "gemini-3.1-pro",
             "gemini-2.0-flash",
             "gemini-1.5-flash"
         ];
        
        for (const modelName of models) {
            console.log(`Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say 'ready'");
                const response = await result.response;
                console.log(`✅ Model ${modelName} is working! Response: ${response.text()}`);
                return; // Stop if we find one
            } catch (e) {
                console.log(`❌ Model ${modelName} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAI();
