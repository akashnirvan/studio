'use server';

import { extractEmailAndMessage, ExtractEmailAndMessageOutput } from '@/ai/flows/extract-email-and-message';

const WEBHOOK_URL = 'https://ak99055.app.n8n.cloud/webhook-test/firebase';

export type ActionResult = {
  status: 'success' | 'error';
  message: string;
  data?: ExtractEmailAndMessageOutput;
};

export async function sendEmailAction(prompt: string): Promise<ActionResult> {
  try {
    const extractedData = await extractEmailAndMessage(prompt);

    if (!extractedData.email || !extractedData.message) {
      throw new Error('Could not extract a valid email and message from the prompt. Please try again with a clearer instruction.');
    }

    const payload = {
      message: {
        email: extractedData.email,
        message: extractedData.message,
      },
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
      throw new Error(`The email service failed. Status: ${response.status}.`);
    }
    
    await response.json();

    return {
      status: 'success',
      message: `Email successfully queued to be sent to ${extractedData.email}.`,
      data: extractedData,
    };
  } catch (error) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('sendEmailAction error:', error);
    return {
      status: 'error',
      message: errorMessage,
    };
  }
}
