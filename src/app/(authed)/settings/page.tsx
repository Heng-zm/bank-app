
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatePassword } from "firebase/auth";

import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "@/hooks/use-account";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import type { NotificationPreferences } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const profileFormSchema = z.object({
  holderName: z.string().min(2, "Name must be at least 2 characters."),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationsFormSchema = z.object({
  deposits: z.boolean(),
  alerts: z.boolean(),
  info: z.boolean(),
});

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { account, updateAccountDetails } = useAccount(user?.uid);
  const { t, setLanguage, language } = useTranslation();

  const [isProfileProcessing, setIsProfileProcessing] = useState(false);
  const [isPasswordProcessing, setIsPasswordProcessing] = useState(false);
  const [isNotificationsProcessing, setIsNotificationsProcessing] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
      holderName: account.holderName,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    values: {
      deposits: account.notificationPreferences?.deposits ?? true,
      alerts: account.notificationPreferences?.alerts ?? true,
      info: account.notificationPreferences?.info ?? true,
    },
  });
  
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsProfileProcessing(true);
    try {
      await updateAccountDetails({ holderName: values.holderName });
      toast({ title: t('success'), description: t('settings.profile.toastSuccess') });
    } catch (error: any) {
      toast({ variant: "destructive", title: t('error'), description: error.message });
    } finally {
      setIsProfileProcessing(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!user) {
        toast({ variant: "destructive", title: t('error'), description: t('settings.password.notLoggedInError') });
        return;
    }
    setIsPasswordProcessing(true);
    try {
      await updatePassword(user, values.newPassword);
      toast({ title: t('success'), description: t('settings.password.toastSuccess') });
      passwordForm.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: t('settings.password.toastErrorTitle'), description: error.message });
    } finally {
      setIsPasswordProcessing(false);
    }
  };
  
  const onNotificationsSubmit = async (values: z.infer<typeof notificationsFormSchema>) => {
    setIsNotificationsProcessing(true);
    try {
      await updateAccountDetails({ notificationPreferences: values });
      toast({ title: t('success'), description: t('settings.notifications.toastSuccess') });
    } catch (error: any) {
      toast({ variant: "destructive", title: t('error'), description: error.message });
    } finally {
      setIsNotificationsProcessing(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.title')}</CardTitle>
          <CardDescription>{t('settings.profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="holderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.form.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.profile.form.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProfileProcessing}>
                {isProfileProcessing && <Loader2 className="animate-spin" />}
                {t('settings.saveChanges')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language.title')}</CardTitle>
          <CardDescription>{t('settings.language.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label htmlFor="language-select">{t('settings.language.selectLabel')}</Label>
                <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'km')}>
                    <SelectTrigger id="language-select">
                        <SelectValue placeholder={t('settings.language.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="km">ភាសាខ្មែរ (Khmer)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.password.title')}</CardTitle>
          <CardDescription>{t('settings.password.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
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
                control={passwordForm.control}
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
              <Button type="submit" disabled={isPasswordProcessing}>
                {isPasswordProcessing && <Loader2 className="animate-spin" />}
                {t('settings.password.updateButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>{t('settings.notifications.title')}</CardTitle>
          <CardDescription>{t('settings.notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
              <FormField
                control={notificationsForm.control}
                name="deposits"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('settings.notifications.depositsLabel')}</FormLabel>
                      <p className="text-sm text-muted-foreground">{t('settings.notifications.depositsDescription')}</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="alerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('settings.notifications.alertsLabel')}</FormLabel>
                      <p className="text-sm text-muted-foreground">{t('settings.notifications.alertsDescription')}</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={notificationsForm.control}
                name="info"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('settings.notifications.infoLabel')}</FormLabel>
                      <p className="text-sm text-muted-foreground">{t('settings.notifications.infoDescription')}</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isNotificationsProcessing}>
                {isNotificationsProcessing && <Loader2 className="animate-spin" />}
                {t('settings.savePreferences')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
