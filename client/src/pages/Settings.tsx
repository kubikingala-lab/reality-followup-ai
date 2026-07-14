import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Building2, Check, Clock3, ImagePlus, Mail, Palette, Zap, Calendar, Send, CheckCircle2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.crm.dashboard.useQuery();
  const [form, setForm] = useState({ companyName: "", primaryColor: "#C66A3D", senderName: "", senderEmail: "" });
  const [resendApiKey, setResendApiKey] = useState("");
  const [showResendInput, setShowResendInput] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setForm({
        companyName: data.profile.companyName,
        primaryColor: data.profile.primaryColor,
        senderName: data.profile.senderName,
        senderEmail: data.profile.senderEmail ?? "",
      });
      document.documentElement.style.setProperty("--primary", data.profile.primaryColor);
    }
  }, [data?.profile]);

  const update = trpc.crm.updateBranding.useMutation({
    onSuccess: () => {
      utils.crm.dashboard.invalidate();
      toast.success("Branding byl uložen");
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadLogo = trpc.crm.uploadLogo.useMutation({
    onSuccess: () => {
      utils.crm.dashboard.invalidate();
      toast.success("Logo bylo nahráno");
    },
    onError: (error) => toast.error("Logo se nepodařilo nahrát", { description: error.message }),
  });

  const activateFollowUps = trpc.crm.activateFollowUps.useMutation({
    onSuccess: (result) => {
      utils.crm.dashboard.invalidate();
      toast.success(result.alreadyActive ? "Automatizace už je aktivní" : "Hodinová kontrola byla aktivována");
    },
    onError: (error) => toast.error("Automatizaci se nepodařilo aktivovat", { description: error.message }),
  });

  const saveResendKey = trpc.crm.saveResendApiKey.useMutation({
    onSuccess: () => {
      utils.crm.dashboard.invalidate();
      toast.success("Resend API klíč byl uložen");
      setResendApiKey("");
      setShowResendInput(false);
    },
    onError: (error) => toast.error("Chyba při ukládání Resend klíče", { description: error.message }),
  });

  const connectGoogleCalendar = trpc.crm.connectGoogleCalendar.useMutation({
    onSuccess: (result) => {
      window.location.href = result.authUrl;
    },
    onError: (error) => toast.error("Chyba při připojení Google Calendar", { description: error.message }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate(form);
  };

  const selectLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) return toast.error("Logo může mít maximálně 2 MB");
    const reader = new FileReader();
    reader.onload = () =>
      uploadLogo.mutate({
        fileName: file.name,
        mimeType: file.type as "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml",
        base64: String(reader.result).split(",")[1] ?? "",
      });
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-7">
        <header>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Nastavení kanceláře</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1b241f]">Váš systém, vaše značka.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upravte název, odesílatele a hlavní barvu, která se promítne do celého rozhraní.
          </p>
        </header>

        {isLoading ? (
          <Skeleton className="h-[520px] rounded-3xl" />
        ) : (
          <>
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <section className="space-y-5 rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3f0ea]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold">Firemní údaje</h2>
                    <p className="text-xs text-muted-foreground">Viditelné v aplikaci a odeslaných e-mailech.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Název firmy</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderName">Jméno odesílatele</Label>
                  <Input
                    id="senderName"
                    value={form.senderName}
                    onChange={(event) => setForm({ ...form, senderName: event.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderEmail">E-mail odesílatele</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="senderEmail"
                      type="email"
                      className="pl-9"
                      placeholder="info@vase-realitka.cz"
                      value={form.senderEmail}
                      onChange={(event) => setForm({ ...form, senderEmail: event.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Adresa musí být ověřená u zvolené e-mailové služby.</p>
                </div>

                <Button type="submit" disabled={update.isPending}>
                  <Check className="h-4 w-4" />
                  {update.isPending ? "Ukládám…" : "Uložit nastavení"}
                </Button>
              </section>

              <section className="rounded-[24px] bg-[#1b2822] p-6 text-white shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: form.primaryColor }}>
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold">Vizuální styl</h2>
                    <p className="text-xs text-white/55">Hlavní barva značky</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/7 p-5">
                  <Label htmlFor="primaryColor" className="text-white">
                    Primární barva
                  </Label>
                  <div className="mt-3 flex gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      className="h-11 w-14 cursor-pointer border-white/10 bg-transparent p-1"
                      value={form.primaryColor}
                      onChange={(event) => setForm({ ...form, primaryColor: event.target.value })}
                    />
                    <Input
                      value={form.primaryColor}
                      onChange={(event) => setForm({ ...form, primaryColor: event.target.value })}
                      className="border-white/10 bg-white/8 text-white"
                      pattern="#[0-9A-Fa-f]{6}"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-5 text-[#1b241f]">
                  <div className="flex items-center gap-3">
                    {data?.profile?.logoUrl ? (
                      <img src={data.profile.logoUrl} alt="Firemní logo" className="h-10 w-10 rounded-xl object-contain" />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ backgroundColor: form.primaryColor }}>
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold">{form.companyName || "Vaše realitní kancelář"}</div>
                      <div className="text-xs text-muted-foreground">Ukázka brandingu</div>
                    </div>
                  </div>
                  <Button type="button" className="mt-5 w-full" style={{ backgroundColor: form.primaryColor }}>
                    Primární tlačítko
                  </Button>
                </div>

                <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-white/15 p-5 text-center transition hover:bg-white/5">
                  <ImagePlus className="mx-auto mb-2 h-5 w-5" />
                  <p className="text-sm font-bold">{uploadLogo.isPending ? "Nahrávám logo…" : "Nahrát firemní logo"}</p>
                  <p className="mt-1 text-xs text-white/50">PNG, JPG, WebP nebo SVG, maximálně 2 MB.</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="sr-only"
                    disabled={uploadLogo.isPending}
                    onChange={(event) => selectLogo(event.target.files?.[0])}
                  />
                </label>
              </section>
            </form>

            {/* Follow-ups Automation */}
            <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      data?.profile?.scheduleCronTaskUid ? "bg-emerald-100 text-emerald-700" : "bg-[#f3f0ea] text-[#1b241f]"
                    }`}
                  >
                    {data?.profile?.scheduleCronTaskUid ? <Zap className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold">Centrální follow-up automatizace</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          data?.profile?.scheduleCronTaskUid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {data?.profile?.scheduleCronTaskUid ? "Aktivní" : "Neaktivní"}
                      </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      Každou hodinu zkontroluje leady bez odpovědi a bezpečně odešle právě splatný e-mail po 1, 3 nebo 7 dnech. Odpověď
                      klienta, schůzka nebo ztracený stav další zprávy zastaví.
                    </p>
                  </div>
                </div>
                {!data?.profile?.scheduleCronTaskUid && (
                  <Button type="button" onClick={() => activateFollowUps.mutate()} disabled={activateFollowUps.isPending}>
                    <Zap className="h-4 w-4" />
                    {activateFollowUps.isPending ? "Aktivuji…" : "Aktivovat po publikování"}
                  </Button>
                )}
              </div>
            </section>

            {/* Resend Webhook Integration */}
            <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${data?.profile?.resendApiKey ? "bg-emerald-100 text-emerald-700" : "bg-[#f3f0ea] text-[#1b241f]"}`}>
                    {data?.profile?.resendApiKey ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold">Příchozí e-maily (Resend Webhook)</h2>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${data?.profile?.resendApiKey ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                        {data?.profile?.resendApiKey ? "Připojeno" : "Nepřipojeno"}
                      </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      Automaticky přijímejte e-maily od zákazníků a vytvářejte nové leady. Webhook se spustí, když zákazník pošle e-mail.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowResendInput(!showResendInput)}
                  variant={data?.profile?.resendApiKey ? "outline" : "default"}
                >
                  <Send className="h-4 w-4" />
                  {data?.profile?.resendApiKey ? "Změnit klíč" : "Nastavit Resend"}
                </Button>
              </div>

              {showResendInput && (
                <div className="mt-6 space-y-4 border-t pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="resendKey">Resend API Klíč</Label>
                    <Input
                      id="resendKey"
                      type="password"
                      placeholder="re_xxxxxxxxxx"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Klíč získáte na <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline">resend.com</a>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => saveResendKey.mutate({ apiKey: resendApiKey })}
                      disabled={!resendApiKey || saveResendKey.isPending}
                    >
                      {saveResendKey.isPending ? "Ukládám…" : "Uložit"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowResendInput(false)}>
                      Zrušit
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* Google Calendar Integration */}
            <section className="rounded-[24px] bg-white p-6 shadow-[0_10px_36px_rgba(40,36,30,0.07)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${data?.profile?.googleCalendarConnected ? "bg-emerald-100 text-emerald-700" : "bg-[#f3f0ea] text-[#1b241f]"}`}>
                    {data?.profile?.googleCalendarConnected ? <CheckCircle2 className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold">Google Calendar</h2>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${data?.profile?.googleCalendarConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                        {data?.profile?.googleCalendarConnected ? "Připojeno" : "Nepřipojeno"}
                      </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      Automaticky vytvářejte schůzky v Google Calendar pro nové leady. Zákazníci dostanou pozvánku na schůzku.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => connectGoogleCalendar.mutate()}
                  disabled={connectGoogleCalendar.isPending}
                  variant={data?.profile?.googleCalendarConnected ? "outline" : "default"}
                >
                  <Calendar className="h-4 w-4" />
                  {connectGoogleCalendar.isPending ? "Připojuji…" : data?.profile?.googleCalendarConnected ? "Znovu připojit" : "Připojit Google Calendar"}
                </Button>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
