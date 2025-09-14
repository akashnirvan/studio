'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Send, Loader2, CheckCircle, AlertTriangle, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sendEmailAction, type ActionResult } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Please provide a more detailed prompt (at least 10 characters).',
  }),
});

export default function MailPilotClient() {
  const [formState, setFormState] = useState<ActionResult>({ status: 'idle', message: '' });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormState({ status: 'idle', message: '' });
    const result = await sendEmailAction(values.prompt);
    setFormState(result);
    if(result.status === 'success'){
      form.reset();
    }
  }
  
  return (
    <Card className="w-full max-w-2xl shadow-2xl border-none">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold font-headline">Mail Pilot</CardTitle>
        <CardDescription className="text-muted-foreground pt-1">
          Your AI assistant for sending emails. Just tell me what to do.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Paperclip className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder='e.g., "Email hello@example.com that I will be late today"'
                      className="pl-11 h-14 text-base"
                      {...field}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? 'Processing...' : 'Send Email'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 min-h-[140px]">
          {formState.status === 'success' && (
            <Alert variant="default" className="bg-accent/10 border-accent/20">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent font-bold">Success!</AlertTitle>
              <AlertDescription className="text-accent/90">
                {formState.message}
                <div className="mt-2 p-3 bg-accent/10 rounded-md text-sm">
                  <p className="font-semibold">To: <span className="font-normal">{formState.data?.email}</span></p>
                  <p className="font-semibold mt-1">Message: <span className="font-normal">"{formState.data?.message}"</span></p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          {formState.status === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {formState.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
