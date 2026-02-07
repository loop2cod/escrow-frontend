"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, Eye, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/theme-provider";
import { useAccessibility } from "@/components/accessibility-provider";

export function PreferencesTab() {
  const { settings, fetchSettings, updatePreferences } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const { settings: accessibilitySettings, updateSettings: updateAccessibility } = useAccessibility();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Also update in settings store for persistence
    updatePreferences({ theme: newTheme });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    updateAccessibility({ fontSize });
    // Also update in settings store
    updatePreferences({
      accessibility: {
        ...settings?.preferences.accessibility!,
        fontSize,
      },
    });
  };

  const handleAccessibilityToggle = (key: 'highContrast' | 'reduceMotion', value: boolean) => {
    updateAccessibility({ [key]: value });
    // Also update in settings store
    if (!settings) return;
    updatePreferences({
      accessibility: {
        ...settings.preferences.accessibility,
        [key]: value,
      },
    });
  };

  if (!settings) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <RadioGroup value={theme} onValueChange={handleThemeChange}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="cursor-pointer">
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="cursor-pointer">
                    Dark
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Select your preferred color scheme
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Customize the interface for better accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <RadioGroup
              value={accessibilitySettings.fontSize}
              onValueChange={handleFontSizeChange}
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="cursor-pointer text-sm">
                    Small
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="cursor-pointer text-lg">
                    Large
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={accessibilitySettings.highContrast}
              onCheckedChange={(value) => handleAccessibilityToggle('highContrast', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={accessibilitySettings.reduceMotion}
              onCheckedChange={(value) => handleAccessibilityToggle('reduceMotion', value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
