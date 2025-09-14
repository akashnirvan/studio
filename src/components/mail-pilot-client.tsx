'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Send, Loader2, User, AlertTriangle, CornerDownLeft } from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const WEBHOOK_URL = 'https://ak99055.app.n8n.cloud/webhook/firebase';

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please provide a prompt.',
  }),
});

type ConversationStatus = 'idle' | 'pending' | 'success' | 'error';

type ConversationEntry = {
    id: string;
    status: ConversationStatus;
    message: string;
    prompt?: string;
    webhookResponse?: string;
};

export default function MailPilotClient() {
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    form.reset();

    const userMessage: ConversationEntry = {
      id: `user-${Date.now()}`,
      status: 'idle',
      message: '',
      prompt: values.prompt,
    };
    
    const botThinkingMessage: ConversationEntry = {
      id: `bot-${Date.now()}`,
      status: 'pending',
      message: 'Thinking...',
    };

    setConversation(prev => [...prev, userMessage, botThinkingMessage]);
    
    try {
      const payload = {
        prompt: values.prompt,
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
      
      const responseData = await response.json();
      const webhookOutput = responseData.output;

      if (typeof webhookOutput !== 'string') {
          throw new Error('Invalid response format from webhook.');
      }

      const successResult = {
        status: 'success' as ConversationStatus,
        message: 'Prompt successfully sent.',
        webhookResponse: webhookOutput
      };

      setConversation(prev => 
        prev.map(entry => 
          entry.id === botThinkingMessage.id ? { ...botThinkingMessage, ...successResult } : entry
        )
      );

    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('onSubmit error:', error);
      
      const errorResult = {
        status: 'error' as ConversationStatus,
        message: errorMessage,
      };

      setConversation(prev => 
        prev.map(entry => 
          entry.id === botThinkingMessage.id ? { ...botThinkingMessage, ...errorResult } : entry
        )
      );
    }

    setIsSubmitting(false);
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [conversation]);
  
  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if(!isSubmitting) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <header className="flex items-center p-4 border-b">
        <Bot className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold ml-3">Prompt Sender</h1>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {conversation.map((entry) => (
            <div key={entry.id} className={cn(
              "flex items-start gap-4",
              entry.status === 'idle' ? "justify-end" : "justify-start"
            )}>
              {entry.status !== 'idle' && (
                 <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="text-primary"/></AvatarFallback>
                </Avatar>
              )}
               <div className={cn(
                "max-w-[75%] rounded-lg p-3 text-sm",
                entry.status === 'idle' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {entry.status === 'idle' && entry.prompt}
                {entry.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{entry.message}</span>
                  </div>
                )}
                {entry.status === 'success' && <pre className="whitespace-pre-wrap">{entry.webhookResponse}</pre>}
                {entry.status === 'error' && (
                   <Alert variant="destructive" className="p-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {entry.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              {entry.status === 'idle' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder='e.g., "Hello world!"'
                      className="pr-20 min-h-[50px] resize-none"
                      onKeyDown={handleTextareaKeyDown}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground absolute bottom-3 left-3 flex items-center">
                    <CornerDownLeft className="w-3 h-3 mr-1" />
                    <span className="font-semibold">Enter</span> to send, <span className="font-semibold">Shift + Enter</span> for new line
                  </p>
                </FormItem>
              )}
            />
            <Button 
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
