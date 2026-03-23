import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Key, Bot, Mic, FileText, Globe, Loader2, CheckCircle2, Save } from "lucide-react";
import { getSettings, updateSettings, type UserSettings } from "@/lib/api";

const voices = [
  { value: "alloy", label: "Alloy — Neutral & balanced" },
  { value: "echo", label: "Echo — Warm & confident" },
  { value: "nova", label: "Nova — Friendly & upbeat" },
  { value: "shimmer", label: "Shimmer — Clear & professional" },
  { value: "onyx", label: "Onyx — Deep & authoritative" },
  { value: "fable", label: "Fable — Expressive & engaging" },
];

export default function SettingsView() {
  const [settings, setSettings] = useState<UserSettings>({
    vapiApiKey: "",
    vapiAssistantId: "",
    defaultVoice: "alloy",
    callScript: "",
    webhookUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await updateSettings(settings);
      setSettings(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Vapi Configuration */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            Vapi Configuration
          </CardTitle>
          <CardDescription>
            Connect your Vapi account to enable real AI calling.{" "}
            <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Get your API key →
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">API Key</label>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="vapi-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={settings.vapiApiKey || ""}
                onChange={(e) => setSettings({ ...settings, vapiApiKey: e.target.value })}
                className="bg-secondary/50 font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)} className="shrink-0">
                {showApiKey ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
              <Bot className="h-3.5 w-3.5" /> Assistant ID
            </label>
            <Input
              placeholder="asst-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={settings.vapiAssistantId || ""}
              onChange={(e) => setSettings({ ...settings, vapiAssistantId: e.target.value })}
              className="bg-secondary/50 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Create an assistant at vapi.ai and paste its ID here</p>
          </div>
        </CardContent>
      </Card>

      {/* Voice & Script */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" />
            Voice & Script
          </CardTitle>
          <CardDescription>Configure how your AI agent sounds and what it says</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Default Voice</label>
            <Select value={settings.defaultVoice} onValueChange={(v) => setSettings({ ...settings, defaultVoice: v })}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Call Script
            </label>
            <Textarea
              placeholder="Hi, this is Sarah from {company}. I'm following up on your recent inquiry about our services. Do you have a moment to chat?"
              value={settings.callScript || ""}
              onChange={(e) => setSettings({ ...settings, callScript: e.target.value })}
              rows={5}
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The opening script your AI agent uses. Use {"{name}"}, {"{company}"} as placeholders.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Webhooks
          </CardTitle>
          <CardDescription>Receive notifications when calls complete</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Webhook URL</label>
            <Input
              placeholder="https://your-app.com/webhooks/spero"
              value={settings.webhookUrl || ""}
              onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
              className="bg-secondary/50 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">We'll POST call results to this URL</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Settings saved
          </span>
        )}
        <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0 text-white hover:opacity-90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
