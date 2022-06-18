import { v4 as uuidv4 } from 'uuid';
import PAYPAY from '@paypayopa/paypayopa-sdk-node';
PAYPAY.Configure({
  clientId: process.env.PAYPAY_API_KEY,
  clientSecret: process.env.PAYPAY_API_SECRET,
  merchantId: process.env.PAYPAY_MERCHANT_ID,
  /* production_mode : Set the connection destination of the sandbox environment / production environment. 
The default false setting connects to the sandbox environment. The True setting connects to the production environment. */
  productionMode: false,
});

export async function paypayRouter(app, opts): Promise<void> {
  app.get('/', async (req, res) => {
    const payload = {
      merchantPaymentId: uuidv4(),
      amount: {
          amount: 1,
          currency: "JPY"
      },
      codeType: "ORDER_QR",
      orderDescription: "Mune's Favourite Cake",
      isAuthorization: false,
      redirectUrl: "https://paypay.ne.jp/",
      redirectType: "WEB_LINK",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1"
    };
    const response = await PAYPAY.QRCodeCreate(payload);
    const body = response.BODY;
   /*
   // responseの中身はこんな感じ
   {
     STATUS: 201,
     BODY: {
       resultInfo: { code: 'SUCCESS', message: 'Success', codeId: 'codeId' },
       data: {
         codeId: '04-z6GEjgqM4N8SeIOR',
         url: 'paymentUrl',
         expiryDate: 1655550397,
         merchantPaymentId: 'merchantPaymentId',
         amount: {
           amount: 1,
           currency: JPY
         },
         orderDescription: "Mune's Favourite Cake",
         codeType: 'ORDER_QR',
         requestedAt: 1655550097,
         redirectUrl: 'https://paypay.ne.jp/',
         redirectType: 'WEB_LINK',
         isAuthorization: false,
         deeplink: 'paymentdeeplink'
       }
    }
  }
  */
    console.log(response);
    return {
      hello: 'salut',
    };
  });
}
