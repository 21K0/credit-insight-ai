import * as XLSX from "xlsx";

export type FinancialData = {
  revenue?: number;
  cost?: number;
  netProfit?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  operatingCashFlow?: number;
  accountsReceivable?: number;
  inventory?: number;
};

const fieldMap: Record<string, keyof FinancialData> = {
  "营业收入": "revenue",
  "营业成本": "cost",
  "净利润": "netProfit",
  "总资产": "totalAssets",
  "总负债": "totalLiabilities",
  "流动资产": "currentAssets",
  "流动负债": "currentLiabilities",
  "经营活动现金流": "operatingCashFlow",
  "经营活动现金流净额": "operatingCashFlow",
  "应收账款": "accountsReceivable",
  "存货": "inventory",
};

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/,/g, "")
      .replace(/，/g, "")
      .replace(/%/g, "")
      .trim();

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : undefined;
  }

  return undefined;
}

export async function parseFinancialExcel(file: File): Promise<FinancialData> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const result: FinancialData = {};

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
    });

    for (const row of rows) {
      if (!Array.isArray(row)) continue;

      const label = String(row[0] ?? "").trim();

      const field = fieldMap[label];

      if (!field) continue;

      const value = normalizeNumber(row[1]);

      if (value !== undefined) {
        result[field] = value;
      }
    }
  }

  return result;
}

export function calculateFinancialMetrics(data: FinancialData) {
  const metrics = {
    debtRatio:
      data.totalAssets && data.totalAssets > 0 && data.totalLiabilities !== undefined
        ? (data.totalLiabilities / data.totalAssets) * 100
        : undefined,

    netMargin:
      data.revenue && data.revenue > 0 && data.netProfit !== undefined
        ? (data.netProfit / data.revenue) * 100
        : undefined,

    currentRatio:
      data.currentLiabilities &&
      data.currentLiabilities > 0 &&
      data.currentAssets !== undefined
        ? data.currentAssets / data.currentLiabilities
        : undefined,

    receivableRatio:
      data.totalAssets &&
      data.totalAssets > 0 &&
      data.accountsReceivable !== undefined
        ? (data.accountsReceivable / data.totalAssets) * 100
        : undefined,

    cashFlowProfitRatio:
      data.netProfit &&
      data.netProfit !== 0 &&
      data.operatingCashFlow !== undefined
        ? data.operatingCashFlow / data.netProfit
        : undefined,
  };

  return metrics;
}

export function analyzeFinancialRisk(
  data: FinancialData,
  metrics: ReturnType<typeof calculateFinancialMetrics>,
) {
  const risks: {
    title: string;
    level: "high" | "medium" | "low";
    description: string;
  }[] = [];

  if (data.operatingCashFlow !== undefined && data.operatingCashFlow < 0) {
    risks.push({
      title: "经营现金流风险",
      level: "high",
      description:
        "经营活动现金流为负，说明企业经营活动产生的现金净流入不足，建议进一步核查客户回款、应收账款及现金流形成原因。",
    });
  }

  if (metrics.debtRatio !== undefined && metrics.debtRatio > 70) {
    risks.push({
      title: "高负债水平",
      level: "high",
      description:
        "资产负债率超过70%，企业整体负债水平较高，建议进一步分析负债结构及偿债能力。",
    });
  } else if (metrics.debtRatio !== undefined && metrics.debtRatio > 60) {
    risks.push({
      title: "资产负债率偏高",
      level: "medium",
      description:
        "资产负债率超过60%，建议结合行业特征、负债期限结构及偿债能力进一步判断。",
    });
  }

  if (
    data.netProfit !== undefined &&
    data.netProfit < 0
  ) {
    risks.push({
      title: "盈利能力风险",
      level: "high",
      description:
        "企业当前净利润为负，建议进一步核查亏损原因及持续经营能力。",
    });
  }

  if (
    metrics.currentRatio !== undefined &&
    metrics.currentRatio < 1
  ) {
    risks.push({
      title: "短期偿债能力风险",
      level: "medium",
      description:
        "流动比率低于1，流动资产对流动负债的覆盖能力相对有限，建议进一步核查短期偿债压力。",
    });
  }

  if (risks.length === 0) {
    risks.push({
      title: "暂未发现明显风险信号",
      level: "low",
      description:
        "基于当前上传数据及规则暂未发现明显风险信号，仍需结合完整尽调资料进行人工判断。",
    });
  }

  return risks;
}
