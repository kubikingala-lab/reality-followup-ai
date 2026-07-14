import DashboardLayout from "@/components/DashboardLayout";
import { StatusBadge, statusMeta, type LeadStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowDownAZ, ArrowUpDown, ArrowUpZA, CalendarCheck2, Download, Filter, Plus, Search, Sparkles, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type SortMode = "newest" | "oldest" | "name";

const emptyForm = { name: "", email: "", phone: "", location: "", propertyType: "", budget: "", lookingFor: "", notes: "" };

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.crm.dashboard.useQuery();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
    if (data?.profile?.primaryColor) document.documentElement.style.setProperty("--primary", data.profile.primaryColor);
  }, [data?.profile?.primaryColor]);

  const createLead = trpc.crm.createLead.useMutation({
    onSuccess: ({ id }) => {
      utils.crm.dashboard.invalidate();
      setOpen(false);
      setForm(emptyForm);
      toast.success("Lead byl přidán", { description: "Majitel aplikace dostal upozornění." });
      setLocation(`/leady/${id}`);
    },
    onError: error => toast.error("Lead se nepodařilo uložit", { description: error.message }),
  });

  const leads = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return [...(data?.leads ?? [])]
      .filter(lead => status === "all" || lead.status === status)
      .filter(lead => !normalized || [lead.name, lead.email, lead.phone, lead.location, lead.propertyType].some(value => value.toLowerCase().includes(normalized)))
      .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "cs") : sort === "oldest" ? +new Date(a.createdAt) - +new Date(b.createdAt) : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [data?.leads, query, sort, status]);

  const counts = useMemo(() => Object.keys(statusMeta).reduce((acc, key) => ({ ...acc, [key]: data?.leads.filter(lead => lead.status === key).length ?? 0 }), {} as Record<LeadStatus, number>), [data?.leads]);

  const exportCsv = () => {
    const header = ["Jméno", "E-mail", "Telefon", "Lokalita", "Typ nemovitosti", "Rozpočet", "Co hledá", "Poznámka", "Stav", "Vytvořeno"];
    const rows = (data?.leads ?? []).map(lead => [lead.name, lead.email, lead.phone, lead.location, lead.propertyType, lead.budget, lead.lookingFor, lead.notes ?? "", statusMeta[lead.status].label, new Date(lead.createdAt).toLocaleString("cs-CZ")]);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `leady-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
    toast.success("CSV export byl připraven");
  };

  const submit = (event: FormEvent) => { event.preventDefault(); createLead.mutate(form); };
  const setField = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));

  return <DashboardLayout>
    <div className="mx-auto max-w-[1500px] space-y-7" style={{ "--primary": data?.profile?.primaryColor ?? "#C66A3D" } as React.CSSProperties}>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> AI lead follow-up</div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#1b241f] sm:text-4xl">Dobré leady si zaslouží rychlou odpověď.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Přehled všech nových poptávek, odpovědí a naplánovaných schůzek.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-white" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Přidat lead</Button></DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader><DialogTitle>Nový lead</DialogTitle><DialogDescription>Zadejte kontaktní údaje a stručně popište realitní požadavek.</DialogDescription></DialogHeader>
              <form onSubmit={submit} className="grid gap-4 pt-2 sm:grid-cols-2">
                {([['name','Jméno','Petr Novák'],['email','E-mail','petr@email.cz'],['phone','Telefon','777 123 456'],['location','Město / lokalita','Praha'],['propertyType','Typ nemovitosti','Byt 2+kk'],['budget','Rozpočet','Do 7 000 000 Kč']] as const).map(([field,label,placeholder]) => <div key={field} className="space-y-2"><Label htmlFor={field}>{label}</Label><Input id={field} type={field === 'email' ? 'email' : 'text'} placeholder={placeholder} value={form[field]} onChange={event => setField(field, event.target.value)} required /></div>)}
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="lookingFor">Co hledá</Label><Textarea id="lookingFor" placeholder="Popište hlavní požadavek klienta" value={form.lookingFor} onChange={event => setField('lookingFor', event.target.value)} required /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="notes">Poznámka</Label><Textarea id="notes" placeholder="Časový horizont, preference nebo další kontext" value={form.notes} onChange={event => setField('notes', event.target.value)} /></div>
                <div className="flex justify-end gap-2 pt-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Zrušit</Button><Button type="submit" disabled={createLead.isPending}>{createLead.isPending ? "Ukládám…" : "Uložit lead"}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />) : (Object.keys(statusMeta) as LeadStatus[]).map(key => <button key={key} onClick={() => setStatus(status === key ? "all" : key)} className={`group rounded-2xl bg-white p-5 text-left shadow-[0_8px_30px_rgba(40,36,30,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_38px_rgba(40,36,30,0.1)] ${status === key ? "ring-2 ring-primary" : ""}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-muted-foreground">{statusMeta[key].label}</span>{key === 'meeting_scheduled' ? <CalendarCheck2 className="h-4 w-4 text-primary" /> : <UsersRound className="h-4 w-4 text-muted-foreground/50" />}</div><div className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b241f]">{counts[key]}</div></button>)}
      </section>

      <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_36px_rgba(40,36,30,0.07)]">
        <div className="flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-bold text-[#1b241f]">Všechny leady</h2><p className="text-xs text-muted-foreground">{leads.length} záznamů v aktuálním výběru</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Hledat lead…" className="w-full bg-[#f7f5f1] pl-9 sm:w-60" /></div>
            <Select value={status} onValueChange={value => setStatus(value as typeof status)}><SelectTrigger className="bg-[#f7f5f1] sm:w-48"><Filter className="h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Všechny stavy</SelectItem>{(Object.keys(statusMeta) as LeadStatus[]).map(key => <SelectItem key={key} value={key}>{statusMeta[key].label}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" className="bg-white" onClick={() => setSort(sort === 'newest' ? 'oldest' : sort === 'oldest' ? 'name' : 'newest')}>{sort === 'newest' ? <ArrowUpDown className="h-4 w-4" /> : sort === 'oldest' ? <ArrowUpZA className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />} {sort === 'newest' ? 'Nejnovější' : sort === 'oldest' ? 'Nejstarší' : 'Podle jména'}</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#faf9f7] text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3 font-bold">Klient</th><th className="px-5 py-3 font-bold">Poptávka</th><th className="px-5 py-3 font-bold">Lokalita</th><th className="px-5 py-3 font-bold">Rozpočet</th><th className="px-5 py-3 font-bold">Stav</th><th className="px-5 py-3 font-bold">Přijato</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>{isLoading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={7} className="px-5 py-3"><Skeleton className="h-12 w-full" /></td></tr>) : leads.map(lead => <tr key={lead.id} onClick={() => setLocation(`/leady/${lead.id}`)} className="cursor-pointer border-t transition-colors hover:bg-[#faf8f4]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e9e1d7] font-bold text-[#705747]">{lead.name.split(' ').map(part => part[0]).slice(0,2).join('')}</div><div><div className="font-bold text-[#1b241f]">{lead.name}{lead.isDemo && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">Demo</span>}</div><div className="text-xs text-muted-foreground">{lead.email}</div></div></div></td><td className="px-5 py-4 font-medium">{lead.propertyType}</td><td className="px-5 py-4">{lead.location}</td><td className="px-5 py-4">{lead.budget}</td><td className="px-5 py-4"><StatusBadge status={lead.status} /></td><td className="px-5 py-4 text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString('cs-CZ')}</td><td className="px-5 py-4 text-right font-bold text-primary">Otevřít →</td></tr>)}</tbody>
          </table>
          {!isLoading && leads.length === 0 && <div className="grid min-h-48 place-items-center p-8 text-center"><div><UsersRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" /><p className="font-bold">Žádné leady neodpovídají filtru</p><p className="text-sm text-muted-foreground">Zkuste upravit vyhledávání nebo zvolit jiný stav.</p></div></div>}
        </div>
      </section>
    </div>
  </DashboardLayout>;
}
