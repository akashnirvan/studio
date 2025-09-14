'use server';

const WEBHOOK_URL = 'https://ak99055.app.n8n.cloud/webhook/firebase';

export type ActionResult = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: {
    prompt: string;
  };
};

export async function sendPromptAction(prompt: string): Promise<ActionResult> {
  try {
    const payload = {
      prompt: prompt,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Webhook error:', errorBody);
      throw new Error(`The service failed. Status: ${response.status}.`);
    }
    
    await response.json();

    return {
      status: 'success',
      message: `Prompt successfully sent.`,
      data: { prompt },
    };
  } catch (error) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('sendPromptAction error:', error);
    return {
      status: 'error',
      message: errorMessage,
    };
  }
}
