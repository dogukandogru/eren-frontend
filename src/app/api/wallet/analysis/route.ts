import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URL parameterelerini al
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const quickTradeMinutes = searchParams.get('quick_trade_minutes');
    const days = searchParams.get('days');

    // Parametreleri doğrula
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Cüzdan adresi gereklidir' },
        { status: 400 }
      );
    }

    // API URL'ini al
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Proxy istekleri yap
    const response = await fetch(
      `${apiUrl}/wallet/analysis?address=${address}${quickTradeMinutes ? `&quick_trade_minutes=${quickTradeMinutes}` : ''}${days ? `&days=${days}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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