import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Phone, Mail, Building, Hash, DollarSign,
  Clock, FileText, TrendingUp, Loader2, Pencil,
  PhoneOff, Voicemail, PhoneForwarded, CheckCircle2,
} from "lucide-react";
import { getLead, getLeadCalls, triggerCall } from "@/lib/api";
import { formatDate, formatDuration, formatCurrency, getStatusColor, getScoreColor, cn } from "@/lib/utils";
import { EditLeadDialog } from "@/components/dashboard/EditLeadDialog";
import type { Lead, CallRecord } from "../../../shared/types";

const resultIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-400" />,
  answered: <Phone className="h-4 w-4 text-emerald-400" />,
  voicemail: <Voicemail className="h-4 w-4 text-blue-400" />,
  no_answer: <PhoneOff className="h-4 w-4 text-red-400" />,
  busy: <PhoneOff className="h-4 w-4 text-orange-400" />,
  callback_scheduled: <PhoneForwarded className="h-4 w-4 text-purple-400" />,
  converted: <CheckCircle2 className="h-4 w-4 text-green-400" />,
};

export default function LeadDetailPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchLead = async () => {
    try {
      const [leadRes, callsRes] = await Promise.all([
        getLead(params.id),
        getLeadCalls(params.id).catch(() => ({ data: [] as CallRecord[] })),
      ]);
      setLead(leadRes.data);
      setCalls(callsRes.data || []);
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [params.id]);

  const handleCall = async () => {
    if (!lead) return;
    setCalling(true);
    try {
      await triggerCall(lead.id);
      setTimeout(fetchLead, 1000);
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) return null;

  const infoItems = [
    { icon: Mail, label: "Email", value: lead.email || "—" },
    { icon: Phone, label: "Phone", value: lead.phone },
    { icon: Building, label: "Company", value: lead.company || "—" },
    { icon: DollarSign, label: "Potential Revenue", value: formatCurrency(lead.revenue) },
    { icon: Hash, label: "Source", value: lead.source || "manual" },
    { icon: Clock, label: "Created", value: formatDate(lead.createdAt) },
    { icon: Clock, label: "Last Called", value: formatDate(lead.lastCalled) },
    { icon: TrendingUp, label: "Call Result", value: lead.callResult?.replace("_", " ") || "—" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("border text-xs uppercase tracking-wider", getStatusColor(lead.status))}>
                  {lead.status.replace("_", " ")}
                </Badge>
                <span className={cn("text-sm font-semibold", getScoreColor(lead.score))}>
                  Score: {lead.score}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button onClick={handleCall} disabled={calling || lead.status === "calling"} className="gradient-primary border-0 text-white hover:opacity-90">
              {calling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
              Call Now
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-base">Lead Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {infoItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                        <div className="rounded-md bg-primary/10 p-2">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium capitalize">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {lead.notes && (
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Call History */}
          <div>
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />Call History</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {calls.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No calls yet</p>
                  ) : (
                    <div className="space-y-3">
                      {calls.map((call) => (
                        <div key={call.id} className="rounded-lg border border-border/50 bg-secondary/30 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {resultIcons[call.result] || resultIcons.pending}
                              <span className="text-sm font-medium capitalize">{call.result.replace("_", " ")}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDuration(call.duration)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{call.notes}</p>
                          <Separator className="my-2" />
                          <p className="text-[10px] text-muted-foreground">{formatDate(call.timestamp)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EditLeadDialog lead={lead} open={editOpen} onOpenChange={setEditOpen} onSaved={fetchLead} />
    </div>
  );
}
