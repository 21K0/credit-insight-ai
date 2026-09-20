import * as XLSX from "xlsx";

export type FinancialPeriod = {
  period: string;
  data: FinancialData;
};

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

export type TwoPeriodFinancialData = {
  periods: [FinancialPeriod, FinancialPeriod];
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

function normalizePeriod(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const text = String(value).trim();

  if (!text) {
    return undefined;
  }

  return text.replace(/年度$/, "").replace(/年$/, "");
}

export async function parseFinancialExcel(
  file: File,
): Promise<TwoPeriodFinancialData> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const periods: string[] = [];
  const periodData: Record<string, FinancialData> = {};

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
    });

    if (rows.length === 0) continue;

    const headerRow = rows[0];

    if (!Array.isArray(headerRow)) continue;

    const periodColumns: { index: number; period: string }[] = [];

    for (let i = 1; i < headerRow.length; i++) {
      const period = normalizePeriod(headerRow[i]);

      if (period) {
        periodColumns.push({
          index: i,
          period,
        });

        if (!periods.includes(period)) {
          periods.push(period);
        }

        if (!periodData[period]) {
          periodData[period] = {};
        }
      }
    }

    for (const row of rows.slice(1)) {
      if (!Array.isArray(row)) continue;

      const label = String(row[0] ?? "").trim();
      const field = fieldMap[label];

      if (!field) continue;

      for (const column of periodColumns) {
        const value = normalizeNumber(row[column.index]);

        if (value !== undefined) {
          periodData[column.period][field] = value;
        }
      }
    }
  }

  const sortedPeriods = [...periods].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  if (sortedPeriods.length < 2) {
    throw new Error("Excel中至少需要包含两个期间的数据，例如2024年和2025年。");
  }

  const selectedPeriods = sortedPeriods.slice(-2);

  return {
    periods: [
      {
        period: selectedPeriods[0],
        data: periodData[selectedPeriods[0]],
      },
      {
        period: selectedPeriods[1],
        data: periodData[selectedPeriods[1]],
      },
    ],
  };
}

export function calculateFinancialMetrics(data: FinancialData) {
  return {
    debtRatio:
      data.totalAssets &&
      data.totalAssets > 0 &&
      data.totalLiabilities !== undefined
        ? (data.totalLiabilities / data.totalAssets) * 100
        : undefined,

    netMargin:
      data.revenue &&
      data.revenue > 0 &&
      data.netProfit !== undefined
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
}

export function calculateYoY(
  previous: number | undefined,
  current: number | undefined,
) {
  if (
    previous === undefined ||
    current === undefined ||
    previous === 0
  ) {
    return undefined;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

export function calculateMetricChanges(
  previous: FinancialData,
  current: FinancialData,
) {
  const previousMetrics = calculateFinancialMetrics(previous);
  const currentMetrics = calculateFinancialMetrics(current);

  return {
    revenueYoY: calculateYoY(previous.revenue, current.revenue),

    netProfitYoY: calculateYoY(
      previous.netProfit,
      current.netProfit,
    ),

    totalAssetsYoY: calculateYoY(
      previous.totalAssets,
      current.totalAssets,
    ),

    totalLiabilitiesYoY: calculateYoY(
      previous.totalLiabilities,
      current.totalLiabilities,
    ),

    operatingCashFlowYoY: calculateYoY(
      previous.operatingCashFlow,
      current.operatingCashFlow,
    ),

    accountsReceivableYoY: calculateYoY(
      previous.accountsReceivable,
      current.accountsReceivable,
    ),

    inventoryYoY: calculateYoY(
      previous.inventory,
      current.inventory,
    ),

    debtRatioChange:
      previousMetrics.debtRatio !== undefined &&
      currentMetrics.debtRatio !== undefined
        ? currentMetrics.debtRatio - previousMetrics.debtRatio
        : undefined,

    netMarginChange:
      previousMetrics.netMargin !== undefined &&
      currentMetrics.netMargin !== undefined
        ? currentMetrics.netMargin - previousMetrics.netMargin
        : undefined,

    currentRatioChange:
      previousMetrics.currentRatio !== undefined &&
      currentMetrics.currentRatio !== undefined
        ? currentMetrics.currentRatio - previousMetrics.currentRatio
        : undefined,
  };
}

export function analyzeFinancialRisk(
  previous: FinancialData,
  current: FinancialData,
) {
  const currentMetrics = calculateFinancialMetrics(current);
  const previousMetrics = calculateFinancialMetrics(previous);
  const changes = calculateMetricChanges(previous, current);

  const risks: {
    title: string;
    level: "high" | "medium" | "low";
    description: string;
  }[] = [];

  if (
    previous.operatingCashFlow !== undefined &&
    current.operatingCashFlow !== undefined &&
    previous.operatingCashFlow >= 0 &&
    current.operatingCashFlow < 0
  ) {
    risks.push({
      title: "经营现金流由正转负",
      level: "high",
      description:
        `经营活动现金流由${previous.operatingCashFlow.toLocaleString()}万元下降至${current.operatingCashFlow.toLocaleString()}万元，由正转负，建议进一步核查客户回款、应收账款及现金流形成原因。`,
    });
  } else if (
    current.operatingCashFlow !== undefined &&
    current.operatingCashFlow < 0
  ) {
    risks.push({
      title: "经营现金流风险",
      level: "high",
      description:
        `当前经营活动现金流为${current.operatingCashFlow.toLocaleString()}万元，处于负值，建议进一步核查经营现金流形成原因。`,
    });
  }

  if (
    currentMetrics.debtRatio !== undefined &&
    currentMetrics.debtRatio > 70
  ) {
    risks.push({
      title: "高负债水平",
      level: "high",
      description:
        `当前资产负债率为${currentMetrics.debtRatio.toFixed(1)}%，超过70%，建议进一步分析负债结构及偿债能力。`,
    });
  } else if (
    currentMetrics.debtRatio !== undefined &&
    currentMetrics.debtRatio > 60
  ) {
    const changeText =
      changes.debtRatioChange !== undefined
        ? `，较上期上升${changes.debtRatioChange.toFixed(1)}个百分点`
        : "";

    risks.push({
      title: "资产负债率偏高",
      level: "medium",
      description:
        `当前资产负债率为${currentMetrics.debtRatio.toFixed(1)}%${changeText}，建议结合行业特征、负债期限结构及偿债能力进一步判断。`,
    });
  }

  if (
    changes.netProfitYoY !== undefined &&
    changes.netProfitYoY < -10
  ) {
    risks.push({
      title: "净利润同比下降",
      level: "medium",
      description:
        `净利润同比下降${Math.abs(changes.netProfitYoY).toFixed(1)}%，建议进一步核查成本变化、主要客户及盈利来源。`,
    });
  } else if (
    current.netProfit !== undefined &&
    current.netProfit < 0
  ) {
    risks.push({
      title: "盈利能力风险",
      level: "high",
      description:
        "企业当前净利润为负，建议进一步核查亏损原因及持续经营能力。",
    });
  }

  if (
    previous.revenue !== undefined &&
    current.revenue !== undefined &&
    previous.netProfit !== undefined &&
    current.netProfit !== undefined &&
    current.revenue > previous.revenue &&
    current.netProfit < previous.netProfit
  ) {
    risks.push({
      title: "收入增长与利润变化背离",
      level: "medium",
      description:
        `营业收入同比${changes.revenueYoY !== undefined ? `增长${changes.revenueYoY.toFixed(1)}%` : "增长"}，但净利润同比${changes.netProfitYoY !== undefined ? `下降${Math.abs(changes.netProfitYoY).toFixed(1)}%` : "下降"}，收入增长与利润表现存在一定背离，建议进一步核查盈利质量。`,
    });
  }

  if (
    currentMetrics.currentRatio !== undefined &&
    currentMetrics.currentRatio < 1
  ) {
    risks.push({
      title: "短期偿债能力风险",
      level: "medium",
      description:
        `当前流动比率为${currentMetrics.currentRatio.toFixed(2)}，低于1，流动资产对流动负债的覆盖能力相对有限，建议进一步核查短期偿债压力。`,
    });
  }

  if (
    changes.accountsReceivableYoY !== undefined &&
    changes.accountsReceivableYoY > 30
  ) {
    risks.push({
      title: "应收账款增长较快",
      level: "medium",
      description:
        `应收账款同比增长${changes.accountsReceivableYoY.toFixed(1)}%，建议进一步核查客户回款情况及应收账款质量。`,
    });
  }

  if (risks.length === 0) {
    risks.push({
      title: "暂未发现明显风险信号",
      level: "low",
      description:
        "基于当前两期财务数据及规则暂未发现明显风险信号，仍需结合完整尽调资料进行人工判断。",
    });
  }

  return risks;
}
