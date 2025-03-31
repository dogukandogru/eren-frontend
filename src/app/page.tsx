"use client";

import { useState } from "react";

interface TokenAnalysis {
  coin_traded_to_another_wallet: boolean;
  current_price_usd: string;
  first_buy_time: number;
  is_coin_transferred_from_another_account: boolean;
  is_quick_trade: boolean;
  is_unrealized_profit: boolean;
  last_sell_time: number;
  profit_usd: string;
  roi_percentage: string;
  token_address: string;
  token_image_url: string;
  token_name: string;
  token_symbol: string;
  total_buy_amount: string;
  total_buy_value_usd: string;
  total_sell_amount: string;
  total_sell_value_usd: string;
  trade_duration_minutes: number;
}

interface AnalysisSummary {
  loss_trades_count: number;
  profitable_trades_count: number;
  quick_trade_count: number;
  total_buy_value_usd: string;
  total_coins_analyzed: number;
  total_profit_usd: string;
  total_roi_percentage: string;
  traded_to_another_wallet_count: number;
  transferred_from_another_account_count: number;
  unrealized_profit_count: number;
}

interface AnalysisResponse {
  data: {
    analysis: TokenAnalysis[];
    summary: AnalysisSummary;
    wallet_address: string;
  };
  success: boolean;
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [analysisPeriod, setAnalysisPeriod] = useState<1 | 3 | 7 | 30>(7);
  const [quickTradeDuration, setQuickTradeDuration] = useState<1 | 2 | 5 | 10 | 30 | number>(5);
  const [customDuration, setCustomDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  
  // Filtre seçenekleri için state'ler
  const [includeQuickTrade, setIncludeQuickTrade] = useState(false);
  const [includeTransferredFrom, setIncludeTransferredFrom] = useState(false);
  const [includeTransferredTo, setIncludeTransferredTo] = useState(false);
  const [includeUnrealizedProfit, setIncludeUnrealizedProfit] = useState(true);

  const handleWalletSearch = async () => {
    if (!walletAddress.trim()) {
      setError("Lütfen bir cüzdan adresi girin");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Filtreleri URL parametrelerine ekleyelim
      const params = new URLSearchParams({
        address: walletAddress,
        quick_trade_minutes: quickTradeDuration.toString(),
        days: analysisPeriod.toString(),
        quick_trade: includeQuickTrade.toString(),
        is_coin_transferred_from_another_account: includeTransferredFrom.toString(),
        coin_traded_to_another_wallet: includeTransferredTo.toString(),
        is_unrealized_profit: includeUnrealizedProfit.toString()
      });

      const response = await fetch(`/api/wallet/analysis?${params.toString()}`);

      if (!response.ok) {
        throw new Error("API yanıt vermedi, lütfen daha sonra tekrar deneyin.");
      }

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Hata:", err);
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleWalletSearch();
    }
  };

  const handlePeriodChange = (period: 1 | 3 | 7 | 30) => {
    setAnalysisPeriod(period);
  };

  const handleQuickTradeDurationChange = (duration: 1 | 2 | 5 | 10 | 30) => {
    setQuickTradeDuration(duration);
    setCustomDuration("");
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    
    if (value && !isNaN(Number(value))) {
      setQuickTradeDuration(Number(value));
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('tr-TR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num / 100);
  };

  const getTimeFromUnix = (timestamp: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString('tr-TR');
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-4">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">Solana Cüzdan Ara</h1>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={walletAddress}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Solana cüzdan adresi girin"
            className="flex-1 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Solana cüzdan adresi"
          />
          <button
            onClick={handleWalletSearch}
            disabled={loading}
            className={`rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] px-4 py-2 text-sm font-medium transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Ara"
            tabIndex={0}
          >
            {loading ? "Aranıyor..." : "Ara"}
          </button>
        </div>

        {/* Filtre Seçenekleri */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-black/10 rounded-lg">
          <p className="text-sm font-medium mb-3">Filtreleme Seçenekleri</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="quickTradeFilter"
                checked={includeQuickTrade}
                onChange={(e) => setIncludeQuickTrade(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="quickTradeFilter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Quick Trade
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="transferredFromFilter"
                checked={includeTransferredFrom}
                onChange={(e) => setIncludeTransferredFrom(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="transferredFromFilter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Başka Cüzdandan Gelen
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="transferredToFilter"
                checked={includeTransferredTo}
                onChange={(e) => setIncludeTransferredTo(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="transferredToFilter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Bu Cüzdandan Giden
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="unrealizedProfitFilter"
                checked={includeUnrealizedProfit}
                onChange={(e) => setIncludeUnrealizedProfit(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="unrealizedProfitFilter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Gerçekleşmemiş Kâr/Zarar
              </label>
            </div>
          </div>
        </div>

        {/* Analiz Süresi Seçimi */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2 text-center">Analiz Süresi</p>
          <div className="flex justify-between gap-2">
            {[1, 3, 7, 30].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period as 1 | 3 | 7 | 30)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  analysisPeriod === period
                    ? "bg-foreground text-background"
                    : "bg-transparent border border-black/[.08] dark:border-white/[.145] hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                }`}
                aria-pressed={analysisPeriod === period}
                tabIndex={0}
              >
                {period} Gün
              </button>
            ))}
          </div>
        </div>

        {/* Quick Trade Süresi Seçimi */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2 text-center">Quick Trade Süresi</p>
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            {[1, 2, 5, 10, 30].map((duration) => (
              <button
                key={duration}
                onClick={() => handleQuickTradeDurationChange(duration as 1 | 2 | 5 | 10 | 30)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors min-w-[60px] ${
                  quickTradeDuration === duration && customDuration === ""
                    ? "bg-foreground text-background"
                    : "bg-transparent border border-black/[.08] dark:border-white/[.145] hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                }`}
                aria-pressed={quickTradeDuration === duration && customDuration === ""}
                tabIndex={0}
              >
                {duration} Dakika
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              value={customDuration}
              onChange={handleCustomDurationChange}
              placeholder="Özel süre (dakika)"
              className="flex-1 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Özel quick trade süresi"
            />
            <span className="text-sm font-medium">Dakika</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-4xl p-4 mb-6 bg-red-100 border border-red-300 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {loading && (
        <div className="w-full max-w-4xl flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-foreground"></div>
          <p className="ml-4 text-lg font-medium">Analiz yapılıyor...</p>
        </div>
      )}

      {result && result.success && (
        <div className="w-full max-w-4xl">
          {/* Özet Kartı */}
          <div className="bg-white dark:bg-black/20 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Cüzdan Özeti</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam İşlem</p>
                <p className="text-lg font-semibold">{result.data.summary.total_coins_analyzed}</p>
              </div>
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Quick Trade</p>
                <p className="text-lg font-semibold">
                  {result.data.summary.quick_trade_count}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((result.data.summary.quick_trade_count / result.data.summary.total_coins_analyzed) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Kârlı İşlemler</p>
                <p className="text-lg font-semibold">
                  {result.data.summary.profitable_trades_count}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((result.data.summary.profitable_trades_count / result.data.summary.total_coins_analyzed) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Zararlı İşlemler</p>
                <p className="text-lg font-semibold">
                  {result.data.summary.loss_trades_count}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((result.data.summary.loss_trades_count / result.data.summary.total_coins_analyzed) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transfer Edilen Tokenler</p>
                <p className="text-lg font-semibold">
                  {result.data.summary.transferred_from_another_account_count}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((result.data.summary.transferred_from_another_account_count / result.data.summary.total_coins_analyzed) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Başka Cüzdana Aktarılan Tokenler</p>
                <p className="text-lg font-semibold">
                  {result.data.summary.traded_to_another_wallet_count}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((result.data.summary.traded_to_another_wallet_count / result.data.summary.total_coins_analyzed) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerçekleşmemiş Kâr/Zarar Olan Tokenler</p>
                <p className="text-lg font-semibold">
                  {result.data.summary.unrealized_profit_count}
                  <span className="text-xs text-gray-500 ml-2">
                    ({((result.data.summary.unrealized_profit_count / result.data.summary.total_coins_analyzed) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg ${parseFloat(result.data.summary.total_profit_usd) >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Kâr/Zarar</p>
                <p className={`text-lg font-semibold ${parseFloat(result.data.summary.total_profit_usd) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(result.data.summary.total_profit_usd)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${parseFloat(result.data.summary.total_roi_percentage) >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam ROI</p>
                <p className={`text-lg font-semibold ${parseFloat(result.data.summary.total_roi_percentage) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatPercentage(result.data.summary.total_roi_percentage)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Yatırım</p>
                <p className="text-lg font-semibold">{formatCurrency(result.data.summary.total_buy_value_usd)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cüzdan Adresi</p>
              <p className="text-sm font-mono break-all">{result.data.wallet_address}</p>
            </div>
          </div>

          {/* İşlem Listesi */}
          <h2 className="text-xl font-bold mb-4">İşlemler</h2>
          <div className="space-y-4">
            {result.data.analysis.map((token, index) => (
              <div key={index} className={`bg-white dark:bg-black/20 rounded-lg shadow-md p-4 border-l-4 ${parseFloat(token.profit_usd) >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {token.token_image_url ? (
                    <img 
                      src={token.token_image_url} 
                      alt={token.token_name} 
                      className="w-10 h-10 rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=Token" }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs">{token.token_symbol || "?"}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{token.token_name || token.token_symbol || "İsimsiz Token"}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{token.token_symbol}</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {token.is_quick_trade && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                        Quick Trade
                      </span>
                    )}
                    {token.coin_traded_to_another_wallet && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded">
                        Başka Cüzdana Transfer Edildi
                      </span>
                    )}
                    {token.is_coin_transferred_from_another_account && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded">
                        Başka Cüzdandan Transfer Edildi
                      </span>
                    )}
                    {token.is_unrealized_profit && (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-xs rounded">
                        Gerçekleşmemiş Kâr/Zarar
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kâr/Zarar</p>
                    <p className={`font-semibold ${parseFloat(token.profit_usd) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(token.profit_usd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                    <p className={`font-semibold ${parseFloat(token.roi_percentage) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(token.roi_percentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Alım Değeri</p>
                    <p className="font-semibold">{formatCurrency(token.total_buy_value_usd)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Satım Değeri</p>
                    <p className="font-semibold">{formatCurrency(token.total_sell_value_usd)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Alınan Miktar</p>
                    <p className="font-medium">{Number(token.total_buy_amount).toLocaleString('tr-TR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Satılan Miktar</p>
                    <p className="font-medium">{Number(token.total_sell_amount).toLocaleString('tr-TR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">İlk Alım</p>
                    <p>{getTimeFromUnix(token.first_buy_time)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Son Satım</p>
                    <p>{getTimeFromUnix(token.last_sell_time)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">İşlem Süresi</p>
                    <p>{token.trade_duration_minutes} Dakika</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  <a 
                    href={`https://solscan.io/token/${token.token_address}`}
          target="_blank"
          rel="noopener noreferrer"
                    className="hover:text-blue-500 underline"
                  >
                    {token.token_address.slice(0, 6)}...{token.token_address.slice(-6)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
