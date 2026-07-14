import DashboardLayout from "@/components/DashboardLayout";
import { StatusBadge, statusMeta, type LeadStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bot, CalendarDays, Clock3, Mail, MapPin, MessageSquareText, Phone, Send, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

export default function LeadDetail() {
  const params = useParams<{ id: string }>();
  const leadId = Number(params.id);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.crm.leadDetail.useQuery({ id: leadId }, { enabled: Number.isFinite(leadId) });
  const [clientReply, setClientReply] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const statusMutation = trpc.crm.updateStatus.useMutation({ onSuccess: () => { utils.crm.leadDetail.invalidate({ id: leadId }); utils.crm.dashboard.invalidate(); toast.success("Stav leadu byl změněn"); } });
  const replyMutation = trpc.crm.recordClientReply.useMutation({ onSuccess: () => { setClientReply(""); utils.crm.leadDetail.invalidate({ id: leadId }); utils.crm.dashboard.invalidate(); toast.success("Odpověď klienta byla zaznamenána"); } });
  const generateMutation = trpc.crm.generateReply.useMutation({
    onSuccess: result => { setEmailSubject(result.subject); setEmailBody(result.body); toast.success("AI odpověď je připravená"); },
    onError: error => toast.error("Odpověď se nepodařilo vygenerovat", { description: error.message }),
  });
  const sendMutation = trpc.crm.sendReply.useMutation({
    onSuccess: () => { setEmailSubject(""); setEmailBody(""); utils.crm.leadDetail.invalidate({ id: leadId }); utils.crm.dashboard.invalidate(); toast.success("E-mail byl odeslán klientovi", { description: "Automatické follow-upy se nyní počítají od této zprávy." }); },
    onError: error => toast.error("E-mail se nepodařilo odeslat", { description: error.message }),
  });

  if (isLoading || !data) return <DashboardLayout><div className="mx-auto max-w-6xl space-y-4"><Skeleton className="h-10 w-72" /><Skeleton className="h-[560px] w-full rounded-3xl" /></div></DashboardLayout>;
  const { lead, history } = data;

  return <DashboardLayout>
    <div className="mx-auto max-w-7xl space-y-6">
      <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Zpět na přehled</button>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e6dbce] text-xl font-extrabold text-[#6f5140]">{lead.name.split(' ').map(part => part[0]).slice(0,2).join('')}</div><div><div className="mb-1 flex items-center gap-2"><StatusBadge status={lead.status} />{lead.isDemo && <span className="text-xs font-bold uppercase tracking-wider text-primary">Ukázkový lead</span>}</div><h1 className="text-3xl font-extrabold tracking-tight text-[#1b241f]">{lead.name}</h1><p className="text-sm text-muted-foreground">Poptávka přijata {new Date(lead.createdAt).toLocaleString('cs-CZ')}</p></div></div>
        <div className="w-full sm:w-72"><Label className="mb-2 block">Aktuální stav</Label><Select value={lead.status} onValueChange={value => statusMutation.mutate({ id: leadId, status: value as LeadStatus })}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(statusMeta) as LeadStatus[]).map(key => <SelectItem key={key} value={key}>{statusMeta[key].label}</SelectItem>)}</SelectContent></Select></div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]"><h2 className="mb-5 text-lg font-extrabold">Informace o leadu</h2><div className="grid gap-4 sm:grid-cols-2">{([{ Icon: Mail, value: lead.email, label: 'E-mail' }, { Icon: Phone, value: lead.phone, label: 'Telefon' }, { Icon: MapPin, value: lead.location, label: 'Lokalita' }, { Icon: CalendarDays, value: lead.budget, label: 'Rozpočet' }]).map(({ Icon, value, label }) => <div key={label} className="rounded-2xl bg-[#f7f5f1] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div><div className="font-bold text-[#1b241f]">{value}</div></div>)}</div><div className="mt-4 space-y-4"><div><div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typ nemovitosti</div><p className="mt-1 font-semibold">{lead.propertyType}</p></div><div><div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Co klient hledá</div><p className="mt-1 leading-relaxed">{lead.lookingFor}</p></div>{lead.notes && <div><div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poznámka</div><p className="mt-1 leading-relaxed">{lead.notes}</p></div>}</div></section>
          <section className="rounded-[24px] bg-[#1b2822] p-6 text-white shadow-xl"><div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary"><Bot className="h-5 w-5" /></div><div><h2 className="font-extrabold">AI odpověď</h2><p className="text-xs text-white/55">Profesionální český e-mail připravený k okamžitému odeslání.</p></div></div>{emailBody ? <div className="space-y-3"><div><Label htmlFor="emailSubject" className="text-white/70">Předmět</Label><Input id="emailSubject" className="mt-1 border-white/10 bg-white text-[#1b241f]" value={emailSubject} onChange={event => setEmailSubject(event.target.value)} /></div><div><Label htmlFor="emailBody" className="text-white/70">Text e-mailu</Label><Textarea id="emailBody" className="mt-1 min-h-72 border-white/10 bg-white text-[#1b241f]" value={emailBody} onChange={event => setEmailBody(event.target.value)} /></div><div className="grid gap-2 sm:grid-cols-2"><Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => generateMutation.mutate({ id: leadId })} disabled={generateMutation.isPending}><MessageSquareText className="h-4 w-4" /> Vygenerovat znovu</Button><Button type="button" className="bg-white text-[#172019] hover:bg-white/90" onClick={() => sendMutation.mutate({ id: leadId, subject: emailSubject, body: emailBody })} disabled={sendMutation.isPending || !emailSubject.trim() || !emailBody.trim()}><Send className="h-4 w-4" /> {sendMutation.isPending ? "Odesílám…" : "Odeslat klientovi"}</Button></div></div> : <Button className="w-full bg-white text-[#172019] hover:bg-white/90" onClick={() => generateMutation.mutate({ id: leadId })} disabled={generateMutation.isPending}><MessageSquareText className="h-4 w-4" /> {generateMutation.isPending ? "AI připravuje odpověď…" : "Vygenerovat AI odpověď"}</Button>}</section>
          <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]"><h2 className="font-extrabold">Zaznamenat odpověď klienta</h2><p className="mt-1 text-sm text-muted-foreground">Ruční záznam zastaví další automatické follow-upy.</p><Textarea value={clientReply} onChange={event => setClientReply(event.target.value)} className="mt-4" placeholder="Vložte text odpovědi klienta…" /><Button variant="outline" className="mt-3 w-full" disabled={!clientReply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate({ id: leadId, body: clientReply })}><UserRoundCheck className="h-4 w-4" /> Uložit odpověď klienta</Button></section>
        </div>
        <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Historie komunikace</h2><p className="text-sm text-muted-foreground">Kompletní přehled zpráv a follow-upů.</p></div><span className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-bold">{history.length} zpráv</span></div>{history.length === 0 ? <div className="grid min-h-[460px] place-items-center text-center"><div><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#f3f0ea]"><Send className="h-5 w-5 text-muted-foreground" /></div><h3 className="font-extrabold">Zatím bez komunikace</h3><p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">Vygenerujte první AI odpověď a zahajte konverzaci s klientem.</p></div></div> : <div className="space-y-5">{history.map(item => <div key={item.id} className={`flex ${item.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[86%] rounded-2xl p-4 ${item.direction === 'outbound' ? 'bg-[#1b2822] text-white' : 'bg-[#f3f0ea] text-[#1b241f]'}`}><div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider opacity-60"><span>{item.direction === 'outbound' ? 'Odesláno kanceláří' : 'Klient'}</span><span>•</span><span>{item.kind === 'follow_up' ? `Follow-up ${item.followUpDay}. den` : item.kind === 'initial_reply' ? 'První odpověď' : 'Ruční záznam'}</span></div>{item.subject && <div className="mb-2 font-bold">{item.subject}</div>}<p className="whitespace-pre-wrap text-sm leading-6">{item.body}</p><div className="mt-3 flex items-center gap-1.5 text-[11px] opacity-50"><Clock3 className="h-3 w-3" />{new Date(item.sentAt ?? item.createdAt).toLocaleString('cs-CZ')}</div></div></div>)}</div>}</section>
      </div>
    </div>
  </DashboardLayout>;
}
