import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileChartColumn,
  FileSearch,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Menu,
  Plus,
  Pencil,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  parseFinancialExcel,
  calculateFinancialMetrics,
  calculateMetricChanges,
  analyzeFinancialRisk,
} from "@/lib/excel-analyzer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CreditRiskAI｜企业信贷风险分析助手" },
      { name: "description", content: "面向银行客户经理的企业信贷资料解析、风险识别与贷前分析工作台。" },
      { property: "og:title", content: "CreditRiskAI｜企业信贷风险分析助手" },
      { property: "og:description", content: "企业客户资料、财务指标、风险依据与贷前报告一站式分析。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
  }),
  component: Index,
});

type View = "dashboard" | "profile" | "portrait" | "risk" | "evidence" | "report" | "settings";
type RiskTone = "high" | "medium" | "low";

const navigation = [
  { id: "dashboard" as const, label: "工作台", icon: LayoutDashboard },
  { id: "profile" as const, label: "客户资料", icon: Building2 },
  { id: "portrait" as const, label: "AI客户画像", icon: UsersRound },
  { id: "risk" as const, label: "风险分析", icon: ShieldCheck },
  { id: "report" as const, label: "AI分析报告", icon: FileChartColumn },
  { id: "settings" as const, label: "设置", icon: Settings },
];

const initialFiles = [
  { name: "2025年度财务报告.pdf", size: "3.8 MB", type: "pdf" },
  { name: "企业经营情况说明.pdf", size: "1.2 MB", type: "pdf" },
  { name: "近12个月银行流水.xlsx", size: "2.6 MB", type: "excel" },
  { name: "企业征信摘要.pdf", size: "1.5 MB", type: "pdf" },
];

function Index() {
  const [view, setView] = useState<View>("profile");
  const [financialData, setFinancialData] = useState<Awaited<ReturnType<typeof parseFinancialExcel>> | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState(initialFiles);

  const changeView = (next: View) => {
    setView(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentTitle = navigation.find((item) => item.id === view)?.label ?? "风险依据详情";

  return (
    <div className="min-h-screen bg-app text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-border bg-background px-4 lg:px-6">
        <div className="flex w-64 items-center gap-3">
          <button className="lg:hidden" aria-label="打开导航" onClick={() => setMobileNav(true)}>
            <Menu className="size-5" />
          </button>
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div>
            <div className="text-[17px] font-bold text-navy">CreditRiskAI</div>
            <div className="text-[10px] text-muted-foreground">企业信贷风险分析助手</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="通知" className="relative">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-risk-high" />
          </Button>
          <span className="hidden h-6 w-px bg-border sm:block" />
          <div className="grid size-8 place-items-center rounded-full bg-primary-soft font-semibold text-primary">张</div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">张经理</div>
            <div className="text-[11px] text-muted-foreground">公司业务部</div>
          </div>
        </div>
      </header>

      <aside className={cn("fixed inset-y-16 left-0 z-30 w-60 border-r border-border bg-background p-3 transition-transform lg:translate-x-0", mobileNav ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-2 flex items-center justify-between px-3 py-2 lg:hidden">
          <span className="text-sm font-semibold">功能导航</span>
          <Button size="icon" variant="ghost" onClick={() => setMobileNav(false)} aria-label="关闭导航"><X className="size-4" /></Button>
        </div>
        <nav className="space-y-1" aria-label="主导航">
          {navigation.map((item) => {
            const active = item.id === view || (view === "evidence" && item.id === "risk");
            return (
              <button key={item.id} onClick={() => changeView(item.id)} className={cn("flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <item.icon className="size-[18px]" />{item.label}
                {active && <span className="ml-auto h-5 w-0.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 rounded-md border border-border bg-muted/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium"><ShieldCheck className="size-4 text-risk-low" />数据安全保护</div>
          <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">企业资料仅用于本次信贷分析</p>
        </div>
      </aside>
      {mobileNav && <button className="fixed inset-0 z-20 bg-overlay lg:hidden" aria-label="关闭导航遮罩" onClick={() => setMobileNav(false)} />}

      <main className="pt-16 lg:pl-60">
        <div className="mx-auto max-w-[1240px] px-5 py-7 lg:px-8 lg:py-8">
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span>CreditRiskAI</span><ChevronRight className="size-3.5" /><span className="text-foreground">{currentTitle}</span>
          </div>
          {view === "dashboard" && <Dashboard onOpen={() => changeView("profile")} />}
          {view === "profile" && <CustomerProfile files={files} setFiles={setFiles} financialData={financialData} setFinancialData={setFinancialData} onNext={() => changeView("portrait")} />}
          {view === "portrait" && <CustomerPortrait financialData={financialData} onNext={() => changeView("risk")} />}
          {view === "risk" && <RiskAnalysis financialData={financialData} onEvidence={() => changeView("evidence")} />}
          {view === "evidence" && <Evidence onBack={() => changeView("risk")} onSource={() => setSourceOpen(true)} onReport={() => changeView("report")} />}
          {view === "report" && <Report saved={saved} onSave={() => setSaved(true)} />}
          {view === "settings" && <SettingsPage />}
        </div>
      </main>

      {sourceOpen && <SourceModal onClose={() => setSourceOpen(false)} />}
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <div className="mb-2 text-xs font-semibold text-primary">{eyebrow}</div>}<h1 className="text-2xl font-bold text-navy lg:text-[28px]">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-border bg-card shadow-card", className)}>{children}</section>;
}

function StatusTag({ tone, children }: { tone: RiskTone | "blue"; children: ReactNode }) {
  const tones = { high: "bg-risk-high-soft text-risk-high", medium: "bg-risk-medium-soft text-risk-medium", low: "bg-risk-low-soft text-risk-low", blue: "bg-primary-soft text-primary" };
  return <span className={cn("inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

function Dashboard({ onOpen }: { onOpen: () => void }) {
  return <><PageHeader title="工作台" description="欢迎回来，张经理。这里是您当前的客户与分析任务概览。" action={<Button onClick={onOpen}><Plus className="size-4" />发起客户分析</Button>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[{ label: "待分析客户", value: "6", note: "较昨日 +2", icon: UsersRound }, { label: "本月已完成", value: "24", note: "完成率 92%", icon: CheckCircle2 }, { label: "待跟进风险", value: "8", note: "高风险 2 项", icon: AlertTriangle }, { label: "已生成报告", value: "21", note: "本月累计", icon: FileChartColumn }].map((item) => <Card key={item.label} className="p-5"><div className="mb-5 flex items-center justify-between"><span className="text-sm text-muted-foreground">{item.label}</span><item.icon className="size-5 text-primary" /></div><div className="text-3xl font-bold text-navy">{item.value}</div><div className="mt-2 text-xs text-muted-foreground">{item.note}</div></Card>)}
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card><div className="border-b border-border p-5"><h2 className="font-semibold text-navy">近期客户</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">客户名称</th><th className="px-5 py-3 font-medium">行业</th><th className="px-5 py-3 font-medium">分析状态</th><th className="px-5 py-3 font-medium">风险等级</th><th className="px-5 py-3 font-medium">更新时间</th></tr></thead><tbody>{[["XX科技有限公司","软件服务","分析完成","中风险","今天 09:42"],["华东设备制造有限公司","装备制造","资料解析中","待评估","昨天 16:25"],["恒瑞商贸有限公司","批发零售","报告待确认","低风险","09月14日"]].map((row, index)=><tr className="border-t border-border first:border-0" key={row[0]}>{row.map((cell,i)=><td key={cell} className="px-5 py-4">{i===0?<button onClick={index===0?onOpen:undefined} className="font-medium text-primary hover:underline">{cell}</button>:i===3?<StatusTag tone={cell==="中风险"?"medium":cell==="低风险"?"low":"blue"}>{cell}</StatusTag>:cell}</td>)}</tr>)}</tbody></table></div></Card>
      <Card className="p-5"><h2 className="font-semibold text-navy">待办事项</h2><div className="mt-4 space-y-4">{["确认 XX科技有限公司分析报告","补充华东设备制造公司流水","复核恒瑞商贸授信建议"].map((task,i)=><div key={task} className="flex gap-3"><span className={cn("mt-1 size-2 rounded-full",i===0?"bg-risk-high":i===1?"bg-risk-medium":"bg-primary")} /><div><p className="text-sm font-medium">{task}</p><p className="mt-1 text-xs text-muted-foreground">{i===0?"今天到期":"本周内"}</p></div></div>)}</div></Card>
    </div></>;
}

function CustomerProfile({ files, setFiles, financialData, setFinancialData, onNext }: { files: typeof initialFiles; setFiles: (files: typeof initialFiles) => void; financialData: Awaited<ReturnType<typeof parseFinancialExcel>> | null; setFinancialData: (data: Awaited<ReturnType<typeof parseFinancialExcel>>) => void; onNext: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = async (list: FileList | null) => {
  if (!list) return;

  const selectedFiles = Array.from(list);

  for (const file of selectedFiles) {
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      try {
        const data = await parseFinancialExcel(file);
        setFinancialData(data);
      } catch (error) {
        console.error("Excel解析失败:", error);
      }
    }
  }

  setFiles([
    ...files,
    ...selectedFiles.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      type: file.name.toLowerCase().endsWith(".xlsx") ? "excel" : "pdf",
    })),
  ]);
};
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); addFiles(event.dataTransfer.files); };
  return <><PageHeader eyebrow="客户编号 CR-20250916-001" title="客户资料" description="上传并核对企业客户的基础信息与信贷分析材料。" />
    <Card className="mb-6 p-5 lg:p-6"><div className="grid gap-5 sm:grid-cols-3"><Info label="客户名称" value="XX科技有限公司" icon={<Building2 />} /><Info label="企业类型" value="有限责任公司" icon={<BriefcaseBusiness />} /><Info label="所属行业" value="软件服务" icon={<FileChartColumn />} /></div></Card>
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <Card className="p-5 lg:p-6"><div className="mb-4"><h2 className="font-semibold text-navy">上传客户资料</h2><p className="mt-1 text-xs text-muted-foreground">文件将自动进行安全解析和信息提取</p></div><div onDragOver={(e)=>e.preventDefault()} onDrop={onDrop} onClick={()=>inputRef.current?.click()} className="group flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-primary/35 bg-primary-subtle p-6 text-center transition-colors hover:border-primary hover:bg-primary-soft/50"><input ref={inputRef} className="hidden" type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={(e: ChangeEvent<HTMLInputElement>)=>addFiles(e.target.files)} /><div className="mb-4 grid size-12 place-items-center rounded-full bg-primary-soft text-primary"><UploadCloud className="size-6" /></div><div className="font-medium text-navy">拖拽文件到此处上传</div><div className="mt-2 text-sm text-muted-foreground">或点击选择本地文件</div><div className="mt-5 rounded bg-background px-3 py-1.5 text-xs text-muted-foreground">支持 PDF / Excel / Word，单个文件不超过 20MB</div></div></Card>
      <Card><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold text-navy">已上传资料</h2><p className="mt-1 text-xs text-muted-foreground">共 4 份，全部解析完成</p></div><StatusTag tone="low"><Check className="size-3" />资料齐全</StatusTag></div><div className="divide-y divide-border">{files.map((file)=><div key={file.name} className="flex items-center gap-3 p-4"><div className={cn("grid size-10 shrink-0 place-items-center rounded-md",file.type==="excel"?"bg-risk-low-soft text-risk-low":"bg-risk-high-soft text-risk-high")}>{file.type==="excel"?<FileSpreadsheet className="size-5"/>:<FileText className="size-5"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="mt-1 text-xs text-muted-foreground">{file.size} · 已完成内容识别</p></div><StatusTag tone="low">已解析</StatusTag></div>)}</div>
        <div className="border-t border-border bg-primary-subtle/50 px-5 py-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-3.5 text-risk-low" />资料完整度较高，已覆盖财务、经营、流水及征信信息</p></div>
      </Card>
    </div><div className="mt-6">
  {financialData && (
    <Card className="mb-4 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-navy">Excel 已读取数据</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            系统已识别 Excel 中最近两期财务数据，可用于同比分析
          </p>
        </div>
        <StatusTag tone="low">
          <CheckCircle2 className="size-3" />
          两期已读取
        </StatusTag>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {financialData.periods.map((period) => (
          <div key={period.period} className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-navy">{period.period}年</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">营业收入</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {period.data.revenue !== undefined
                    ? `${period.data.revenue.toLocaleString()} 万元`
                    : "未读取"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">净利润</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {period.data.netProfit !== undefined
                    ? `${period.data.netProfit.toLocaleString()} 万元`
                    : "未读取"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">总资产</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {period.data.totalAssets !== undefined
                    ? `${period.data.totalAssets.toLocaleString()} 万元`
                    : "未读取"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">总负债</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {period.data.totalLiabilities !== undefined
                    ? `${period.data.totalLiabilities.toLocaleString()} 万元`
                    : "未读取"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )}

  <div className="flex justify-end">
    <Button size="lg" onClick={onNext}>
      开始AI分析
      <ArrowRight className="size-4" />
    </Button>
  </div>
</div></>;
}

function Info({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-muted text-primary [&>svg]:size-5">{icon}</div><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-navy">{value}</p></div></div>; }

function CustomerPortrait({ financialData, onNext }: { financialData: Awaited<ReturnType<typeof parseFinancialExcel>> | null; onNext: () => void }) {
  const previous = financialData?.periods[0].data;
  const current = financialData?.periods[1].data;

  const changes = previous && current
    ? calculateMetricChanges(previous, current)
    : {};

  const currentMetrics = current
    ? calculateFinancialMetrics(current)
    : {};

  const formatYoY = (value: number | undefined) => {
    if (value === undefined) return "同比 —";
    return `同比 ${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const metrics = [
    {
      label: "营业收入",
      value: current?.revenue !== undefined
        ? current.revenue.toLocaleString()
        : "—",
      unit: "万元",
      change: formatYoY(changes.revenueYoY),
      up: changes.revenueYoY !== undefined
        ? changes.revenueYoY >= 0
        : true,
    },
    {
      label: "净利润",
      value: current?.netProfit !== undefined
        ? current.netProfit.toLocaleString()
        : "—",
      unit: "万元",
      change: formatYoY(changes.netProfitYoY),
      up: changes.netProfitYoY !== undefined
        ? changes.netProfitYoY >= 0
        : current?.netProfit !== undefined && current.netProfit >= 0,
    },
    {
      label: "资产负债率",
      value: currentMetrics.debtRatio !== undefined
        ? currentMetrics.debtRatio.toFixed(1)
        : "—",
      unit: "%",
      change:
        changes.debtRatioChange !== undefined
          ? `较上期 ${changes.debtRatioChange >= 0 ? "+" : ""}${changes.debtRatioChange.toFixed(1)}个百分点`
          : "较上期 —",
      up:
        changes.debtRatioChange !== undefined
          ? changes.debtRatioChange <= 0
          : true,
    },
    {
      label: "经营活动现金流",
      value: current?.operatingCashFlow !== undefined
        ? current.operatingCashFlow.toLocaleString()
        : "—",
      unit: "万元",
      change:
        previous?.operatingCashFlow !== undefined &&
        current?.operatingCashFlow !== undefined &&
        previous.operatingCashFlow >= 0 &&
        current.operatingCashFlow < 0
          ? "由正转负"
          : formatYoY(changes.operatingCashFlowYoY),
      up:
        current?.operatingCashFlow !== undefined
          ? current.operatingCashFlow >= 0
          : true,
    },
  ];

  const currentPeriod = financialData?.periods[1]?.period
    ? `${financialData.periods[1].period}年`
    : "当前期";

  const previousPeriod = financialData?.periods[0]?.period
    ? `${financialData.periods[0].period}年`
    : "上期";

  const revenueYoYText =
    changes.revenueYoY !== undefined
      ? `营业收入同比${changes.revenueYoY >= 0 ? "增长" : "下降"}${Math.abs(changes.revenueYoY).toFixed(1)}%`
      : "营业收入同比变化暂不可计算";

  const netProfitYoYText =
    changes.netProfitYoY !== undefined
      ? `净利润同比${changes.netProfitYoY >= 0 ? "增长" : "下降"}${Math.abs(changes.netProfitYoY).toFixed(1)}%`
      : "净利润同比变化暂不可计算";

  const cashFlowText =
    previous?.operatingCashFlow !== undefined &&
    current?.operatingCashFlow !== undefined &&
    previous.operatingCashFlow >= 0 &&
    current.operatingCashFlow < 0
      ? `经营活动现金流由${previous.operatingCashFlow.toLocaleString()}万元转为${current.operatingCashFlow.toLocaleString()}万元，由正转负`
      : current?.operatingCashFlow !== undefined
        ? `经营活动现金流为${current.operatingCashFlow.toLocaleString()}万元`
        : "经营活动现金流数据暂不可用";

  const insightTitle =
    changes.revenueYoY !== undefined &&
    changes.revenueYoY > 0 &&
    changes.netProfitYoY !== undefined &&
    changes.netProfitYoY < 0
      ? "收入保持增长，但盈利质量及现金流值得进一步关注。"
      : "企业财务指标已完成初步分析，建议结合其他尽调资料进一步判断。";

  const insightBody =
    `${currentPeriod}${revenueYoYText}，${netProfitYoYText}，${cashFlowText}。` +
    "收入增长与盈利、现金流表现存在一定背离，建议进一步核查应收账款变化、主要客户回款情况及经营现金流形成原因。";

  return <><PageHeader eyebrow="AI 客户画像" title="XX科技有限公司" description="软件服务业 · 成立8年 · 注册资本1000万元" action={<div className="flex gap-2"><StatusTag tone="low"><CheckCircle2 className="size-3" />AI分析已完成</StatusTag><StatusTag tone="blue"><FileText className="size-3" />数据来源 1份 Excel</StatusTag></div>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((m)=><Card key={m.label} className="p-5"><p className="text-sm text-muted-foreground">{m.label}</p><div className="mt-4 flex items-baseline gap-1"><span className="text-3xl font-bold text-navy">{m.value}</span><span className="text-sm text-muted-foreground">{m.unit}</span></div><div className={cn("mt-3 flex items-center gap-1 text-xs font-medium",m.up?"text-risk-low":"text-risk-high")}>{m.up?<TrendingUp className="size-3.5"/>:<TrendingDown className="size-3.5"/>}{m.change}</div></Card>)}</div>
    <Card className="mt-6 overflow-hidden"><div className="flex items-center gap-3 border-b border-border bg-primary-subtle px-5 py-4"><div className="grid size-9 place-items-center rounded-md bg-primary-soft text-primary"><Sparkles className="size-[18px]" /></div><div><h2 className="font-semibold text-navy">AI初步洞察</h2><p className="text-xs text-muted-foreground">基于客户资料与财务数据综合分析</p></div></div><div className="p-6"><p className="text-base font-semibold text-navy">{insightTitle}</p><p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{insightBody}</p><div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><FileText className="size-4 text-primary" />本结论基于已解析的{financialData?.periods.length ?? 0}期财务数据生成，相关数据可追溯至上传的 Excel。</div></div></Card>
    <div className="mt-6 flex justify-end"><Button size="lg" onClick={onNext}>查看风险分析<ArrowRight className="size-4" /></Button></div></>;
}

function RiskAnalysis({
  financialData,
  onEvidence,
}: {
  financialData: Awaited<ReturnType<typeof parseFinancialExcel>> | null;
  onEvidence: () => void;
}) {
  const previous = financialData?.periods[0].data ?? {};
  const current = financialData?.periods[1].data ?? {};

  const risks = financialData
    ? analyzeFinancialRisk(previous, current).map((risk) => ({
        ...risk,
        label:
          risk.level === "high"
            ? "高风险"
            : risk.level === "medium"
              ? "中风险"
              : "低风险",
        tone: risk.level,
        source: "已上传两期财务数据 · 自动计算",
        text: risk.description,
      }))
    : [];

  const highCount = risks.filter((risk) => risk.tone === "high").length;
  const mediumCount = risks.filter((risk) => risk.tone === "medium").length;
  const lowCount = risks.filter((risk) => risk.tone === "low").length;

  const overallRisk =
    highCount > 0 ? "high" : mediumCount > 0 ? "medium" : "low";

  const overallRiskLabel =
    overallRisk === "high"
      ? "高风险"
      : overallRisk === "medium"
        ? "中风险"
        : "低风险";

  const overallRiskClass =
    overallRisk === "high"
      ? "text-risk-high"
      : overallRisk === "medium"
        ? "text-risk-medium"
        : "text-risk-low";

  const overallRiskDotClass =
    overallRisk === "high"
      ? "bg-risk-high"
      : overallRisk === "medium"
        ? "bg-risk-medium"
        : "bg-risk-low";

  return <><PageHeader eyebrow="XX科技有限公司" title="风险分析" description="基于已上传资料识别关键风险信号，并提供可追溯的分析依据。" />
    <Card className="mb-6 p-5 lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr_.9fr] lg:items-center">
        <div><p className="text-sm text-muted-foreground">综合风险等级</p><div className="mt-2 flex items-center gap-3"><span className={cn("size-3 rounded-full", overallRiskDotClass)} /><span className={cn("text-3xl font-bold", overallRiskClass)}>{overallRiskLabel}</span></div></div>
        <div className="grid grid-cols-3 gap-3 border-y border-border py-5 lg:border-x lg:border-y-0 lg:px-6 lg:py-0">{[["高风险", highCount, "high"], ["中风险", mediumCount, "medium"], ["低风险", lowCount, "low"]].map(([label, value, tone]) => <div key={label} className="text-center"><p className={cn("text-xl font-bold", tone === "high" ? "text-risk-high" : tone === "medium" ? "text-risk-medium" : "text-risk-low")}>{value}项</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div>
        <div><p className="text-sm text-muted-foreground">分析依据覆盖</p><p className="mt-2 text-2xl font-bold text-navy">1/1 份资料</p><p className="mt-2 text-xs leading-5 text-muted-foreground">已关联上传 Excel 中的两期财务数据</p></div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">{["资料解析","风险识别","依据核验","人工判断"].map((step,index)=><div key={step} className="flex items-center gap-2"><span className={cn("grid size-5 place-items-center rounded-full text-[10px] font-semibold",index<3?"bg-primary-soft text-primary":"bg-muted text-muted-foreground")}>{index+1}</span><span>{step}</span>{index<3&&<ArrowRight className="size-3.5 text-border" />}</div>)}</div>
    </Card>
    <div className="mb-6 flex items-start gap-3 rounded-md border border-compliance-border bg-compliance px-4 py-3 text-sm text-compliance-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><span><strong>合规提示：</strong>AI分析结果仅用于辅助风险识别，不代表最终授信决策。请结合尽调资料及业务制度进行人工判断。</span></div>
    <div className="space-y-4">{risks.map((risk,index)=><Card key={risk.title} className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex gap-4"><span className={cn("mt-1 grid size-8 shrink-0 place-items-center rounded-md text-sm font-bold",risk.tone==="high"?"bg-risk-high-soft text-risk-high":risk.tone==="medium"?"bg-risk-medium-soft text-risk-medium":"bg-risk-low-soft text-risk-low")}>{index+1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-navy">{risk.title}</h3><StatusTag tone={risk.tone}>{risk.label}</StatusTag></div><p className="mt-2 text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">AI分析说明：</span>{risk.text}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><FileSearch className="size-3.5" /><span className="font-medium text-foreground">原始资料依据：</span>{risk.source}</p></div></div><Button variant="outline" size="sm" onClick={index===0?onEvidence:undefined} aria-disabled={index!==0} title={index===0?"查看经营现金流风险依据":"本次演示仅展开经营现金流风险依据"}>查看依据<ArrowRight className="size-3.5" /></Button></div></Card>)}</div>
    <div className="mt-6 flex items-start gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"><ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="text-foreground">建议：</strong>客户经理可逐项查看原始资料依据，并结合尽调情况进行人工复核。</span></div>
  </>;
}

function Evidence({ onBack, onSource, onReport }: { onBack: () => void; onSource: () => void; onReport: () => void }) {
  const steps=["经营现金流由正转负","现金回款能力可能发生变化","需要关注短期资金压力","建议进一步核查客户回款及应收账款情况"];
  return <><PageHeader title="风险依据详情" description="查看风险判断的关键数据、分析逻辑与原始资料出处。" />
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card><div className="border-b border-border p-5 lg:p-6"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-risk-high-soft text-risk-high"><AlertTriangle className="size-5" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-navy">经营现金流风险</h2><StatusTag tone="high">高风险</StatusTag></div><p className="mt-1 text-xs text-muted-foreground">风险编号：RISK-CF-001</p></div></div></div><div className="p-5 lg:p-6"><h3 className="text-sm font-semibold text-navy">AI判断</h3><p className="mt-2 rounded-md border-l-2 border-risk-high bg-risk-high-soft/50 px-4 py-3 text-sm leading-6">2025年经营活动现金流由2024年的+80万元下降至-125万元，现金流表现发生明显变化。建议重点核查主要客户回款情况、应收账款变化及经营现金流形成原因。</p><h3 className="mb-3 mt-6 text-sm font-semibold text-navy">关键数据对比</h3><div className="grid gap-3 sm:grid-cols-3"><DataPoint label="2024年" value="+80万元" tone="low" /><DataPoint label="2025年" value="-125万元" tone="high" /><DataPoint label="同比变化" value="-205万元" tone="high" /></div></div></Card>
        <Card className="p-5 lg:p-6"><div className="mb-5 flex items-center gap-2"><Bot className="size-5 text-primary" /><h2 className="font-semibold text-navy">AI分析推理逻辑</h2></div><div className="grid gap-2 md:grid-cols-4">{steps.map((step,index)=><div key={step} className="flex items-center md:flex-col"><div className="relative flex flex-1 items-center md:w-full"><div className="flex min-h-24 w-full items-center justify-center rounded-md border border-border bg-muted/50 p-3 text-center text-sm font-medium leading-6 text-navy"><span className="mr-2 text-xs text-primary">0{index+1}</span>{step}</div>{index<steps.length-1&&<ArrowRight className="mx-2 hidden size-4 shrink-0 text-muted-foreground md:block" />}</div>{index<steps.length-1&&<div className="mx-3 h-5 w-px bg-border md:hidden" />}</div>)}</div></Card>
      </div>
      <Card className="h-fit p-5"><div className="flex items-center gap-2"><FileSearch className="size-5 text-primary"/><h2 className="font-semibold text-navy">溯源依据</h2></div><div className="mt-5 rounded-md border border-border p-4"><div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-risk-high-soft text-risk-high"><FileText className="size-5"/></div><div><p className="text-sm font-medium">2025年度财务报告.pdf</p><p className="mt-1 text-xs text-muted-foreground">第12页 · 现金流量表</p></div></div><div className="mt-4 border-l-2 border-risk-medium bg-risk-medium-soft/50 px-3 py-3 text-sm leading-6">原文摘要：“经营活动产生的现金流量净额为<mark className="bg-highlight px-1 font-semibold text-foreground">-125万元</mark>，上年同期为80万元。”</div><div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground"><p>来源类型：企业财务资料</p><p className="flex items-center gap-1.5 text-risk-low"><CheckCircle2 className="size-3.5" />数据已关联至本次风险分析</p></div><Button className="mt-4 w-full" variant="outline" onClick={onSource}><FileSearch className="size-4"/>查看原文</Button></div></Card>
    </div>
    <div className="mt-6 flex flex-col justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center"><p className="text-xs text-muted-foreground">该风险依据将作为分析报告中的一项风险证据。</p><div className="flex flex-col-reverse gap-3 sm:flex-row"><Button variant="outline" onClick={onBack}><ArrowLeft className="size-4"/>返回风险分析</Button><Button onClick={onReport}><Plus className="size-4"/>加入分析报告</Button></div></div>
  </>;
}

function DataPoint({ label, value, tone }: { label: string; value: string; tone: "low"|"high" }) { return <div className="rounded-md border border-border bg-muted/35 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={cn("mt-2 text-xl font-bold",tone==="high"?"text-risk-high":"text-risk-low")}>{value}</p></div>; }

const defaultReportText = `一、客户基本情况\nXX科技有限公司成立8年，注册资本1000万元，企业类型为有限责任公司，所属行业为软件服务。\n\n二、经营情况\n2025年营业收入2580万元，同比增长12.5%，核心软件服务业务保持稳定。\n\n三、财务情况\n2025年净利润186万元，同比下降9.3%；资产负债率68.2%，较上年上升4.8个百分点；经营活动现金流净额-125万元，由正转负。\n\n四、风险分析\n1. 经营现金流风险（高风险）：建议核查主要客户回款、应收账款变化及经营现金流形成原因。\n2. 盈利能力下降（中风险）：建议核查成本费用及利润变动原因。\n3. 资产负债率上升（中风险）：建议结合负债结构及短期偿债能力进一步判断。\n4. 主营业务稳定（低风险）：当前未发现明显集中度异常信号，建议结合尽调持续确认经营稳定性。\n\n五、建议进一步核查事项\n1. 核查客户回款与应收账款。\n2. 了解净利润下降原因。\n3. 核查负债结构与短期偿债能力。\n4. 结合尽调进一步确认经营情况。`;

function Report({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  const [editing,setEditing]=useState(false);
  const [hasEdited,setHasEdited]=useState(false);
  const [reportText,setReportText]=useState(defaultReportText);
  const [regenerating,setRegenerating]=useState(false);
  const [confirmed,setConfirmed]=useState(false);
  const regenerate=()=>{setEditing(false);setRegenerating(true);setConfirmed(false);window.setTimeout(()=>{setReportText(defaultReportText);setHasEdited(false);setRegenerating(false);},900);};
  const confirmAndExport=()=>{setConfirmed(true);const text=`贷前风险分析报告\n客户：XX科技有限公司\n\n${reportText}\n\n本报告由 AI 辅助生成，仅用于贷前风险识别与分析参考，不代表最终授信决策。`;const url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="XX科技有限公司-贷前风险分析报告.txt";a.click();URL.revokeObjectURL(url);};
  return <><PageHeader eyebrow="XX科技有限公司" title="AI分析报告" description="AI根据已解析资料生成贷前风险分析初稿，客户经理审核后可确认并导出。" action={<div className="flex flex-wrap gap-2"><StatusTag tone={confirmed?"low":"medium"}>{confirmed?<><Check className="size-3"/>报告已确认</>:"待确认"}</StatusTag><StatusTag tone="blue"><Bot className="size-3"/>AI初稿 · 待人工审核</StatusTag></div>} />
    {confirmed&&<div className="mx-auto mb-6 flex max-w-4xl items-start gap-3 rounded-lg border border-risk-low/25 bg-risk-low-soft p-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-risk-low"/><div><h2 className="font-semibold text-navy">贷前风险分析报告已生成</h2><p className="mt-1 text-sm text-muted-foreground">本报告基于1份 Excel 中的两期财务数据生成，最终内容已由客户经理确认。</p></div></div>}
    <Card className="mx-auto max-w-4xl overflow-hidden"><div className="border-b-4 border-primary px-6 py-8 text-center lg:px-12"><div className="text-xs font-semibold text-primary">CREDIT RISK ASSESSMENT</div><h2 className="mt-3 text-2xl font-bold text-navy">贷前风险分析报告</h2><p className="mt-3 text-sm text-muted-foreground">客户：XX科技有限公司</p></div>
      {regenerating?<div className="flex min-h-96 flex-col items-center justify-center px-6 py-12 text-center"><RefreshCw className="size-7 animate-spin text-primary"/><p className="mt-4 font-medium text-navy">正在重新生成分析报告……</p></div>:editing?<div className="px-6 py-8 lg:px-12"><label className="mb-3 block text-sm font-semibold text-navy" htmlFor="report-editor">报告正文</label><textarea id="report-editor" value={reportText} onChange={(event)=>setReportText(event.target.value)} className="min-h-[620px] w-full resize-y rounded-md border border-input bg-background p-4 text-sm leading-7 text-report-body outline-none focus:ring-2 focus:ring-ring"/><div className="mt-4 flex justify-end"><Button onClick={()=>{setHasEdited(true);setEditing(false)}}><Check className="size-4"/>完成编辑并保存</Button></div></div>:hasEdited?<article className="whitespace-pre-wrap px-6 py-8 text-sm leading-7 text-report-body lg:px-12">{reportText}</article>:<ReportContent />}
      <div className="grid gap-2 border-t border-border bg-primary-subtle/40 px-6 py-4 text-xs text-muted-foreground sm:grid-cols-3 lg:px-12">{["已引用1份资料","风险项已自动识别","风险依据可追溯"].map(item=><span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-risk-low"/>{item}</span>)}</div>
      <div className="border-t border-border bg-muted/40 px-6 py-4 text-center text-xs leading-6 text-muted-foreground">本报告由 AI 辅助生成，仅用于贷前风险识别与分析参考，不代表最终授信决策。最终判断应由相关业务人员依据尽调资料及业务制度完成。</div>
    </Card>
    {saved&&<p className="mt-4 text-center text-sm text-risk-low"><CheckCircle2 className="mr-1 inline size-4"/>报告草稿已保存</p>}
    <div className="sticky bottom-0 mt-6 flex flex-wrap justify-end gap-3 border-t border-border bg-app/95 py-4 backdrop-blur"><Button variant="outline" onClick={()=>setEditing(!editing)} disabled={regenerating}><Pencil className="size-4"/>{editing?"取消编辑":"编辑报告"}</Button><Button variant="outline" onClick={regenerate} disabled={regenerating}><RefreshCw className={cn("size-4",regenerating&&"animate-spin")}/>重新生成</Button><Button variant="outline" onClick={onSave}><Save className="size-4"/>{saved?"草稿已保存":"保存草稿"}</Button><Button onClick={confirmAndExport} disabled={regenerating}><Download className="size-4"/>确认并导出</Button></div>
  </>;
}

function ReportContent(){return <article className="space-y-8 px-6 py-8 text-sm leading-7 lg:px-12">
  <ReportSection title="一、客户基本情况"><p>XX科技有限公司成立8年，注册资本1000万元，企业类型为有限责任公司，所属行业为软件服务。</p></ReportSection>
  <ReportSection title="二、经营情况"><p>2025年营业收入2580万元，同比增长12.5%，核心软件服务业务保持稳定。</p></ReportSection>
  <ReportSection title="三、财务情况"><p>2025年净利润186万元，同比下降9.3%；资产负债率68.2%，较上年上升4.8个百分点；经营活动现金流净额-125万元，由正转负。</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><MiniMetric label="净利润" value="186万元 · -9.3%"/><MiniMetric label="资产负债率" value="68.2% · +4.8个百分点"/><MiniMetric label="经营现金流" value="-125万元 · 由正转负"/></div></ReportSection>
  <ReportSection title="四、风险分析"><div className="space-y-3"><ReportRisk tone="high" number="1" title="经营现金流风险">建议核查主要客户回款、应收账款变化及经营现金流形成原因。</ReportRisk><ReportRisk tone="medium" number="2" title="盈利能力下降">建议核查成本费用及利润变动原因。</ReportRisk><ReportRisk tone="medium" number="3" title="资产负债率上升">建议结合负债结构及短期偿债能力进一步判断。</ReportRisk><ReportRisk tone="low" number="4" title="主营业务稳定">当前未发现明显集中度异常信号，建议结合尽调持续确认经营稳定性。</ReportRisk></div></ReportSection>
  <ReportSection title="五、建议进一步核查事项"><ol className="list-decimal space-y-2 pl-5"><li>核查客户回款与应收账款。</li><li>了解净利润下降原因。</li><li>核查负债结构与短期偿债能力。</li><li>结合尽调进一步确认经营情况。</li></ol></ReportSection>
</article>}
function ReportSection({title,children}:{title:string;children:ReactNode}){return <section><h3 className="mb-3 border-l-3 border-primary pl-3 text-base font-bold text-navy">{title}</h3><div className="text-report-body">{children}</div></section>}
function MiniMetric({label,value}:{label:string;value:string}){return <div className="rounded-md bg-muted px-3 py-2"><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold text-navy">{value}</p></div>}
function ReportRisk({tone,number,title,children}:{tone:RiskTone;number:string;title:string;children:ReactNode}){return <div className="rounded-md border border-border p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-muted-foreground">{number}.</span><StatusTag tone={tone}>{tone==="high"?"高风险":tone==="medium"?"中风险":"低风险"}</StatusTag><strong className="text-navy">{title}</strong></div><p className="mt-2">{children}</p></div>}

function SettingsPage(){const [notify,setNotify]=useState(true);const [auto,setAuto]=useState(false);return <><PageHeader title="系统设置" description="管理个人偏好、分析规则与通知方式。"/><div className="grid gap-6 lg:grid-cols-[260px_1fr]"><Card className="h-fit p-3">{["个人信息","分析偏好","通知设置","安全与合规"].map((x,i)=><button key={x} className={cn("flex h-10 w-full items-center rounded-md px-3 text-sm",i===0?"bg-primary-soft font-medium text-primary":"text-muted-foreground hover:bg-muted")}>{x}</button>)}</Card><div className="space-y-6"><Card className="p-6"><h2 className="font-semibold text-navy">个人信息</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><SettingField label="姓名" value="张经理"/><SettingField label="所属部门" value="公司业务部"/><SettingField label="岗位" value="客户经理"/><SettingField label="员工编号" value="CM-0862"/></div><div className="mt-5"><Button>保存修改</Button></div></Card><Card className="p-6"><h2 className="font-semibold text-navy">通知设置</h2><ToggleRow title="分析完成通知" text="客户资料分析完成后向我发送站内通知" value={notify} onClick={()=>setNotify(!notify)}/><ToggleRow title="自动保存报告草稿" text="编辑报告时每隔 5 分钟自动保存" value={auto} onClick={()=>setAuto(!auto)}/></Card></div></div></>}
function SettingField({label,value}:{label:string;value:string}){return <label className="text-sm"><span className="mb-2 block text-xs text-muted-foreground">{label}</span><input defaultValue={value} className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"/></label>}
function ToggleRow({title,text,value,onClick}:{title:string;text:string;value:boolean;onClick:()=>void}){return <div className="mt-5 flex items-center justify-between gap-5 border-t border-border pt-5 first:border-0"><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div><button role="switch" aria-checked={value} onClick={onClick} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors",value?"bg-primary":"bg-muted-foreground/30")}><span className={cn("absolute top-1 size-4 rounded-full bg-background transition-all",value?"left-6":"left-1")}/></button></div>}

function SourceModal({onClose}:{onClose:()=>void}){return <div className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4" role="dialog" aria-modal="true" aria-label="原文预览"><div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-background shadow-dialog"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-semibold text-navy">Demo演示：原文预览功能</h2><p className="mt-1 text-xs text-muted-foreground">2025年度财务报告.pdf · 第12页</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭"><X className="size-5"/></Button></div><div className="max-h-[68vh] overflow-y-auto bg-document p-5 sm:p-8"><div className="mx-auto min-h-[620px] max-w-xl bg-background p-8 shadow-document sm:p-12"><div className="border-b border-foreground pb-3 text-center"><h3 className="text-lg font-bold">现金流量表</h3><p className="mt-1 text-xs text-muted-foreground">2025年度 · 单位：人民币万元</p></div><div className="mt-8 grid grid-cols-[1fr_100px_100px] border-y border-border text-sm font-medium"><span className="p-3">项目</span><span className="border-l border-border p-3 text-right">本期金额</span><span className="border-l border-border p-3 text-right">上期金额</span></div>{[["销售商品、提供劳务收到的现金","2,205","2,118"],["购买商品、接受劳务支付的现金","1,496","1,332"],["支付给职工以及为职工支付的现金","615","536"],["支付的各项税费","219","170"]].map(row=><div className="grid grid-cols-[1fr_100px_100px] border-b border-border text-xs" key={row[0]}><span className="p-3">{row[0]}</span><span className="border-l border-border p-3 text-right">{row[1]}</span><span className="border-l border-border p-3 text-right">{row[2]}</span></div>)}<div className="mt-5 grid grid-cols-[1fr_100px_100px] border-y-2 border-risk-medium bg-highlight text-sm font-bold"><span className="p-3">经营活动产生的现金流量净额</span><span className="border-l border-risk-medium/30 p-3 text-right text-risk-high">-125</span><span className="border-l border-risk-medium/30 p-3 text-right">80</span></div><p className="mt-8 text-xs leading-6 text-muted-foreground">注：经营活动产生的现金流量净额较上年同期减少205万元，主要受部分项目回款周期延长及人员成本增加影响。</p><div className="mt-24 text-center text-xs text-muted-foreground">— 第 12 页 —</div></div></div><div className="flex justify-end border-t border-border px-5 py-4"><Button onClick={onClose}>完成查看</Button></div></div></div>}
