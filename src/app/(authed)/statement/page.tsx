
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Download } from "lucide-react";
import { Label } from "@/components/ui/label";

const statements = [
    { id: '1', month: 'June 2024', file: 'june_2024_statement.pdf' },
    { id: '2', month: 'May 2024', file: 'may_2024_statement.pdf' },
    { id: '3', month: 'April 2024', file: 'april_2024_statement.pdf' },
    { id: '4', month: 'March 2024', file: 'march_2024_statement.pdf' },
    { id: '5', month: 'February 2024', file: 'feb_2024_statement.pdf' },
    { id: '6', month: 'January 2024', file: 'jan_2024_statement.pdf' },
]

export default function StatementPage() {
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleDownload = () => {
        toast({
            title: t('statement.download.toastSuccessTitle'),
            description: t('statement.download.toastSuccessDescription'),
        })
    }

    return (
       <div className="grid place-items-center h-full">
         <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{t('statement.title')}</CardTitle>
                <CardDescription>{t('statement.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="statement-select">{t('statement.select.label')}</Label>
                    <Select defaultValue="1">
                        <SelectTrigger id="statement-select">
                            <SelectValue placeholder={t('statement.select.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {statements.map((statement) => (
                                <SelectItem key={statement.id} value={statement.id}>
                                    {statement.month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <Button className="w-full" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('statement.download.button')}
                </Button>
            </CardContent>
        </Card>
       </div>
    )
}
