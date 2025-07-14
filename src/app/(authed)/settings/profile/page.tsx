
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "@/hooks/use-account";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  holderName: z.string().min(2, "Name must be at least 2 characters."),
});

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { account, updateAccountDetails, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: { // Use values to pre-populate from account
      holderName: account?.holderName || "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsSaving(true);
    try {
      await updateAccountDetails({ holderName: values.holderName });
      toast({
        title: t('success'),
        description: t('settings.profile.toastSuccess'),
      });
      router.back();
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
        <CardTitle>{t('settings.profile.title')}</CardTitle>
        <CardDescription>{t('settings.profile.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('settings.profile.form.namePlaceholder')} {...field} disabled={isAccountLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving || isAccountLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('settings.saveChanges')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
