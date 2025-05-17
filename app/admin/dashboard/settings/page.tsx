'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSettings, updateSettings, type Settings } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contactPhone, setContactPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        if (data?.contact_phone) {
          setContactPhone(data.contact_phone);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedSettings = await updateSettings({
        contact_phone: contactPhone,
      });

      if (updatedSettings) {
        setSettings(updatedSettings);
        toast({
          title: 'הגדרות נשמרו בהצלחה',
          variant: 'default',
          position: 'top-left',
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'שגיאה בשמירת ההגדרות',
        variant: 'destructive',
        position: 'top-left',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">הגדרות</h1>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>פרטי יצירת קשר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">מספר טלפון ליצירת קשר</Label>
              <div className="flex">
                <Phone className="h-5 w-5 opacity-50 ml-2 self-center" />
                <Input
                  id="contact_phone"
                  className="placeholder:text-right"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="הזן מספר טלפון"
                  dir="ltr"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                מספר זה יוצג בכפתור יצירת הקשר בדף המוצר
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                'שמור הגדרות'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 