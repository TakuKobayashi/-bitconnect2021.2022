import { v4 as uuidv4 } from 'uuid';
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
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
    const currentBaseUrl = [req.protocol + '://' + req.hostname, req.awsLambda.event.requestContext.stage].join('/');
    const payload = {
      merchantPaymentId: uuidv4(),
      amount: {
        amount: 100,
        currency: 'JPY',
      },
      codeType: "ORDER_QR",
      orderDescription: "なにかの商品",
      isAuthorization: false,
      redirectUrl: currentBaseUrl + '/platforms/paypay/payment_result',
      redirectType: "WEB_LINK",
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
    res.redirect(body.data.url)
  });
  app.get('/payment_result', async (req, res) => {
    return {
      result: 'sample',
    };
  });
  app.post('/payment_webhook', async (req, res) => {
    console.log(req.body)
    return {
      result: 'webhook',
    };
  });
}
