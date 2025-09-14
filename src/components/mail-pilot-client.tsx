'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Send, Loader2, User, AlertTriangle, CornerDownLeft } from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { sendPromptAction, type ActionResult } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please provide a prompt.',
  }),
});

export default function MailPilotClient() {
  const [conversation, setConversation] = useState<ActionResult[]>([]);
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
    const userMessage: ActionResult = {
      status: 'idle',
      message: '',
      data: { prompt: values.prompt }
    };
    setConversation(prev => [...prev, userMessage]);
    
    const result = await sendPromptAction(values.prompt);
    setConversation(prev => [...prev, result]);

    if (result.status === 'success') {
      form.reset();
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation]);
  
  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
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
          {conversation.map((entry, index) => (
            <div key={index} className={cn(
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
                {entry.status === 'idle' && entry.data?.prompt}
                {entry.status === 'success' && <p>I have successfully sent the prompt: "{entry.data?.prompt}"</p>}
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
                  <Textarea
                    placeholder='e.g., "Hello world!"'
                    className="pr-20 min-h-[50px] resize-none"
                    onKeyDown={handleTextareaKeyDown}
                    {...field}
                  />
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
