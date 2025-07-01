// This is the final, simplified Vercel Serverless Function.
// It relies on Vercel's built-in features and has no external dependencies.

export default async function handler(req, res) {
  // --- IMPORTANT: Ensure your n8n Production URL is correct here ---
  const n8nWebhookUrl = 'https://rag.app.n8n.cloud/webhook/university-chat';

  // We only want to process POST requests.
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Vercel automatically parses the JSON body, so we can access it directly.
    const requestBody = req.body;

    // This is a server-to-server request, so it is NOT blocked by CORS.
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody), // Forward the body we received.
    });

    // Get the final text answer from the n8n workflow.
    const textResponse = await n8nResponse.text();

    // Check if the response from n8n was successful.
    if (!n8nResponse.ok) {
        // If n8n had an error, send that error message back to the chat.
        console.error("Error from n8n:", textResponse);
        res.status(502).send(`Error from n8n workflow: ${textResponse}`);
        return;
    }

    // --- Success! ---
    // Send the clean text response back to our chat front-end.
    res.status(200).send(textResponse);

  } catch (error) {
    console.error('Error in proxy server:', error);
    res.status(500).send('An error occurred on the proxy server.');
  }
}
