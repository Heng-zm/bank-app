
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatePassword } from "firebase/auth";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function PasswordSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: t('settings.password.notLoggedInError') });
      return;
    }
    setIsSaving(true);
    try {
      await updatePassword(user, values.newPassword);
      toast({
        title: t('success'),
        description: t('settings.password.toastSuccess'),
      });
      form.reset();
      router.back();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('settings.password.toastErrorTitle'),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.password.title')}</CardTitle>
        <CardDescription>{t('settings.password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.password.form.newPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.password.form.confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('settings.password.updateButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
