
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "@/hooks/use-account";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const notificationsFormSchema = z.object({
  deposits: z.boolean().default(true),
  alerts: z.boolean().default(true),
  info: z.boolean().default(true),
});

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { account, updateAccountDetails, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    values: {
      deposits: account.notificationPreferences?.deposits ?? true,
      alerts: account.notificationPreferences?.alerts ?? true,
      info: account.notificationPreferences?.info ?? true,
    },
  });

  useEffect(() => {
    if (account.notificationPreferences) {
      form.reset(account.notificationPreferences);
    }
  }, [account.notificationPreferences, form]);

  const onSubmit = async (values: z.infer<typeof notificationsFormSchema>) => {
    setIsSaving(true);
    try {
      await updateAccountDetails({ notificationPreferences: values });
      toast({
        title: t('success'),
        description: t('settings.notifications.toastSuccess'),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.notifications.title')}</CardTitle>
        <CardDescription>{t('settings.notifications.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="deposits"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('settings.notifications.depositsLabel')}</FormLabel>
                    <FormDescription>{t('settings.notifications.depositsDescription')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('settings.notifications.alertsLabel')}</FormLabel>
                    <FormDescription>{t('settings.notifications.alertsDescription')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="info"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('settings.notifications.infoLabel')}</FormLabel>
                    <FormDescription>{t('settings.notifications.infoDescription')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving || isAccountLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('settings.savePreferences')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
