import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URL parameterelerini al
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const quickTradeMinutes = searchParams.get('quick_trade_minutes');
    const days = searchParams.get('days');
    
    // Yeni filtre parametreleri
    const isQuickTrade = searchParams.get('quick_trade');
    const isTransferredFromAnotherAccount = searchParams.get('is_coin_transferred_from_another_account');
    const isTradedToAnotherWallet = searchParams.get('coin_traded_to_another_wallet');
    const isUnrealizedProfit = searchParams.get('is_unrealized_profit');

    // Parametreleri doğrula
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Cüzdan adresi gereklidir' },
        { status: 400 }
      );
    }

    // API URL'ini al
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Proxy isteğini oluştur
    let apiParams = new URLSearchParams();
    apiParams.append('address', address);
    
    if (quickTradeMinutes) apiParams.append('quick_trade_minutes', quickTradeMinutes);
    if (days) apiParams.append('days', days);
    if (isQuickTrade) apiParams.append('quick_trade', isQuickTrade);
    if (isTransferredFromAnotherAccount) apiParams.append('is_coin_transferred_from_another_account', isTransferredFromAnotherAccount);
    if (isTradedToAnotherWallet) apiParams.append('coin_traded_to_another_wallet', isTradedToAnotherWallet);
    if (isUnrealizedProfit) apiParams.append('is_unrealized_profit', isUnrealizedProfit);
    
    // Proxy istekleri yap
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 dakika timeout

    const response = await fetch(
      `${apiUrl}/wallet/analysis?${apiParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    // API yanıtını al
    const data = await response.json();

    // Yanıtı döndür
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'API isteği sırasında bir hata oluştu' 
      },
      { status: 500 }
    );
  }
} 