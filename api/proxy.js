// This is a Vercel Serverless Function that acts as a proxy.

// We need to enable the 'body-parser' to correctly read the incoming request body.
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

export default function handler(req, res) {
  // Use a middleware to parse the JSON body of the request.
  jsonParser(req, res, async () => {
    // --- IMPORTANT: Paste your n8n Production URL here ---
    const n8nWebhookUrl = 'https://rag.app.n8n.cloud/webhook/university-chat';
    
    // Check if the request method is POST. We only want to proxy POST requests.
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      // Forward the request from our chat front-end to the n8n webhook.
      // This is a server-to-server request, so it is NOT blocked by CORS.
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body of our request contains the user's question and role.
        body: JSON.stringify(req.body),
      });

      // Get the final text answer from the n8n workflow.
      const textResponse = await n8nResponse.text();

      // --- Success! ---
      // Send the clean text response back to our chat front-end.
      // We also add our own CORS header here to give the browser permission.
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(textResponse);

    } catch (error) {
      console.error('Error in proxy server:', error);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(500).send('An error occurred on the proxy server.');
    }
  });
}
