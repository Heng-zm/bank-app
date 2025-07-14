
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function LanguageSettingsPage() {
  const { t, setLanguage, language } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.language.title')}</CardTitle>
        <CardDescription>{t('settings.language.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 max-w-sm">
            <Label htmlFor="language-select">{t('settings.language.selectLabel')}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'km')} >
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
  );
}
