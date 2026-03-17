import React, { useState, useMemo } from 'react';
import {
  Calculator, Info, ChevronRight, MessageSquare,
  Users, History, DollarSign, BarChart3, ClipboardList, TrendingUp,
  Tag
} from 'lucide-react';

const App = () => {
  // 計費級距數據
  const TIER_DATA = [
    { start: 6000, end: 25000, rate: 0.2 },
    { start: 25000, end: 35000, rate: 0.165 },
    { start: 35000, end: 45000, rate: 0.154 },
    { start: 45000, end: 65000, rate: 0.143 },
    { start: 65000, end: 105000, rate: 0.132 },
    { start: 105001, end: 185000, rate: 0.121 },
    { start: 185001, end: 345000, rate: 0.1045 },
    { start: 345001, end: 665000, rate: 0.1034 },
    { start: 665001, end: 825000, rate: 0.099 },
    { start: 825001, end: 1305000, rate: 0.0946 },
    { start: 1305001, end: 2585000, rate: 0.0858 },
    { start: 2585001, end: 3525000, rate: 0.077 },
    { start: 3525001, end: 5145000, rate: 0.066 },
    { start: 5145001, end: 8025000, rate: 0.055 },
    { start: 8025001, end: 10265000, rate: 0.0385 },
    { start: 10265001, end: 20505000, rate: 0.0187 },
    { start: 20505001, end: Infinity, rate: 0.011 }
  ];

  const BASE_FEE = 1200;
  const FREE_MESSAGES = 6000;

  // 核心計算函數
  const calculateCostDetail = (totalMessages) => {
    let remaining = Math.max(0, totalMessages - FREE_MESSAGES);
    let totalTieredCost = 0;
    const breakdown = [];

    if (totalMessages > FREE_MESSAGES) {
      for (const tier of TIER_DATA) {
        const tierSize = tier.end - tier.start;
        const messagesInThisTier = Math.min(remaining, tierSize);
        if (messagesInThisTier > 0) {
          const cost = messagesInThisTier * tier.rate;
          totalTieredCost += cost;
          breakdown.push({
            range: `${tier.start.toLocaleString()}~${tier.end === Infinity ? '以上' : tier.end.toLocaleString()}`,
            count: messagesInThisTier,
            rate: tier.rate,
            cost: cost
          });
          remaining -= messagesInThisTier;
        }
        if (remaining <= 0) break;
      }
    }
    const totalCost = BASE_FEE + totalTieredCost;
    return {
      totalMessages,
      totalTieredCost,
      totalCost,
      breakdown,
      unitPrice: totalMessages > 0 ? totalCost / totalMessages : 0
    };
  };

  // 狀態管理
  const [activeTab, setActiveTab] = useState('history'); // 預設改為顯示歷史數據
  const [friendsInput, setFriendsInput] = useState('1000');
  const [frequencyInput, setFrequencyInput] = useState('4');
  const [historyInput, setHistoryInput] = useState(`2026\t3\t1130917\n2026\t2\t1767083\n2026\t1\t2122659\n2025\t12\t2199952\n2025\t11\t1986951\n2025\t10\t2005291\n2025\t9\t1989364\n2025\t8\t1948255\n2025\t7\t2043215\n2025\t6\t1911624`);

  // 計算單次即時結果
  const friends = useMemo(() => {
    const n = parseInt(friendsInput, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  }, [friendsInput]);

  const frequency = useMemo(() => {
    const n = parseInt(frequencyInput, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  }, [frequencyInput]);

  const instantCalc = useMemo(() => calculateCostDetail(friends * frequency), [friends, frequency]);

  // 解析並計算歷史數據
  const historyAnalysis = useMemo(() => {
    const lines = historyInput.trim().split('\n');
    const records = lines.map(line => {
      const parts = line.split(/\s+/);
      if (parts.length < 3) return null;
      const year = parts[0];
      const month = parts[1];
      const count = parseInt(parts[2].replace(/,/g, ''));
      if (isNaN(count)) return null;
      return { year, month, count, ...calculateCostDetail(count) };
    }).filter(r => r !== null);

    if (records.length === 0) return null;

    const totalAllMessages = records.reduce((a, b) => a + b.count, 0);
    const totalAllCost = records.reduce((a, b) => a + b.totalCost, 0);
    const avgMessages = totalAllMessages / records.length;
    const avgCost = totalAllCost / records.length;
    const avgUnitPrice = totalAllCost / totalAllMessages; // 整體平均單價
    const maxCost = Math.max(...records.map(r => r.totalCost));
    const minCost = Math.min(...records.map(r => r.totalCost));

    return { records, avgMessages, avgCost, maxCost, minCost, avgUnitPrice };
  }, [historyInput]);

  const highVolumeUnitPrice = historyAnalysis?.records.find((r) => r.count > 2000000)?.unitPrice;
  const lowVolumeUnitPrice = historyAnalysis?.records.find((r) => r.count < 1200000)?.unitPrice;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-100">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">LINE 費用成本計算機</h1>
              <p className="text-slate-500 text-sm">階梯計價與歷史成本控管分析-以2026/3月公告價格估算</p>
            </div>
          </div>

          <div className="inline-flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calc' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              單月估算
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              歷史數據與成本分析
            </button>
          </div>
        </header>

        {activeTab === 'calc' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in">
            {/* ... 單月估算部分保持不變 ... */}
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> 好友推播估算
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">目標好友人數</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={friendsInput}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setFriendsInput(e.target.value.replace(/[^\d]/g, ''))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">每月推播次數</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={frequencyInput}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setFrequencyInput(e.target.value.replace(/[^\d]/g, ''))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <div className="bg-green-600 p-6 rounded-3xl text-white shadow-xl shadow-green-100">
                <p className="text-green-100 text-sm mb-1">預估月費 (未稅)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">${Math.round(instantCalc.totalCost).toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-green-500 flex justify-between text-xs opacity-90">
                  <span>平均單價: ${instantCalc.unitPrice.toFixed(4)} / 則</span>
                  <span>總量: {instantCalc.totalMessages.toLocaleString()} 則</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full">
                <div className="p-6 border-b border-slate-50 font-bold flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-green-500" /> 計算明細
                </div>
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs border-b border-slate-100">
                        <th className="pb-3 font-medium text-left">階梯級距</th>
                        <th className="pb-3 font-medium text-left">加購則數</th>
                        <th className="pb-3 font-medium text-right">費用</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className="text-slate-400"><td className="py-3">基本月費 (含 6,000 則)</td><td>-</td><td className="text-right text-slate-600 font-bold">$1,200</td></tr>
                      {instantCalc.breakdown.map((b, i) => (
                        <tr key={i} className="text-slate-700">
                          <td className="py-3">{b.range} <span className="text-[10px] text-blue-500">(@{b.rate})</span></td>
                          <td className="py-3">{b.count.toLocaleString()}</td>
                          <td className="py-3 text-right font-bold">${Math.round(b.cost).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in">
            {/* History Analysis Tab */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3">
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-500" /> 數據輸入
                  </h2>
                  <p className="text-[10px] text-slate-400 mb-4">格式：年 月 訊息量 (以空白或 Tab 分隔)</p>
                  <textarea
                    value={historyInput}
                    onChange={(e) => setHistoryInput(e.target.value)}
                    className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all"
                  />
                </section>
              </div>

              <div className="lg:col-span-9 space-y-6">
                {/* Stats Summary - 新增單價指標 */}
                {historyAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm border-b-4 border-b-green-500">
                      <p className="text-[10px] text-slate-400 mb-1">整體平均單價</p>
                      <p className="text-2xl font-black text-slate-800">${historyAnalysis.avgUnitPrice.toFixed(4)}</p>
                      <div className="mt-2 text-[10px] flex items-center text-green-600 gap-1 font-bold">
                        <Tag className="w-3 h-3" /> 成本控管核心基準
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 mb-1">10個月平均月費</p>
                      <p className="text-2xl font-black text-slate-800">${Math.round(historyAnalysis.avgCost).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-2">常態預算配置</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 mb-1">峰值月費 (12月)</p>
                      <p className="text-2xl font-black text-red-500">${Math.round(historyAnalysis.maxCost).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-2">最高支出警戒線</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 mb-1">平均訊息量</p>
                      <p className="text-2xl font-black text-blue-600">{Math.round(historyAnalysis.avgMessages / 10000)}萬</p>
                      <p className="text-[10px] text-slate-400 mt-2">每月穩定推播規模</p>
                    </div>
                  </div>
                )}

                {/* History Table - 新增平均單價欄位 */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h2 className="font-bold flex items-center gap-2 text-slate-700">
                      <BarChart3 className="w-5 h-5 text-blue-500" /> 逐月成本控管報告
                    </h2>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr className="text-slate-400 text-[10px] uppercase font-bold text-left border-b border-slate-100">
                          <th className="px-6 py-4">月份</th>
                          <th className="px-6 py-4">訊息量</th>
                          <th className="px-6 py-4">計算總費 (未稅)</th>
                          <th className="px-6 py-4 text-right bg-blue-50/30 text-blue-600">平均單價</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {historyAnalysis?.records.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-bold text-slate-500">{r.year} / {r.month}</td>
                            <td className="px-6 py-4 font-medium text-slate-600">{r.count.toLocaleString()}</td>
                            <td className="px-6 py-4 font-black text-slate-800">
                              ${Math.round(r.totalCost).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-blue-600 bg-blue-50/10 group-hover:bg-blue-50/30">
                              ${r.unitPrice.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> 成本控管洞察
                  </h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    觀察「平均單價」欄位，當月發送量超過 200 萬則時，單價會顯著下降至約 <b>${highVolumeUnitPrice?.toFixed(4) ?? 'N/A'}</b>；
                    反之，當則數降至 110 萬則左右時，單價會回升至 <b>${lowVolumeUnitPrice?.toFixed(4) ?? 'N/A'}</b>。
                    這證明了集中在特定月份進行大規模推播（例如大促活動）比分散在各月份推播更具成本優勢。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 pt-8 border-t border-slate-200 text-center text-slate-400 text-[10px]">
          <p>※ 平均單價公式 = (基本月費 $1,200 + 該月超額費用) / 該月總訊息量</p>
          <p className="mt-1">※ 基於 LINE 2025 年高用量方案計費邏輯開發 | 資料僅供參考</p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.4s ease-out; }
      `}} />
    </div>
  );
};

export default App;
