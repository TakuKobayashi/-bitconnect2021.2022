import { v4 as uuidv4 } from 'uuid';
import PAYPAY from '@paypayopa/paypayopa-sdk-node';
import axios from 'axios';
PAYPAY.Configure({
  clientId: process.env.PAYPAY_API_KEY,
  clientSecret: process.env.PAYPAY_API_SECRET,
  merchantId: process.env.PAYPAY_MERCHANT_ID,
  /* production_mode : Set the connection destination of the sandbox environment / production environment. 
The default false setting connects to the sandbox environment. The True setting connects to the production environment. */
  productionMode: false,
});

export async function paypayRouter(app, opts): Promise<void> {
  app.get('/kintone', async (req, res) => {
    return getKintoneRecords();
  });
  app.get('/account_link', async (req, res) => {
    const currentBaseUrl = [req.protocol + '://' + req.hostname, req.awsLambda.event.requestContext.stage].join('/');
    const payload = {
      scopes: ['direct_debit'],
      nonce: uuidv4(),
      referenceId: uuidv4(),
      // 認可処理で使われる redirectUrl は ここ https://developer.paypay.ne.jp/settings で登録しているものと整合性が取れている必要がある
      redirectUrl: currentBaseUrl + '/platforms/paypay/oauth_result',
      redirectType: 'WEB_LINK',
    };
    // ここではOAuthによる認可処理が行われる
    const response = await PAYPAY.AccountLinkQRCodeCreate(payload);
    // responseはうまく行くと以下のような感じ
    /*
    {
      STATUS: 201,
      BODY: {
        resultInfo: { code: 'SUCCESS', message: 'Success', codeId: 'codeId' },
        data: {
          linkQRCodeURL: 'https://...'
        }
      }
    }
    */
    const body = response.BODY;
    res.redirect(body.data.linkQRCodeURL);
  });
  app.get('/oauth_result', async (req, res) => {
    /*
    req.queryの値でこんな感じの値が取れる
    {"apiKey":"apiKey","responseToken":"...."},
    */
    const jwtResponse = PAYPAY.ValidateJWT(req.query.responseToken, process.env.PAYPAY_API_SECRET);
    /*
      jwtResponse はこんな感じの値がとれる
      {
        result: 'succeeded',
        aud: 'aud',
        iss: 'paypay.ne.jp',
        profileIdentifier: '電話番号(隠し)',
        exp: 1655918951,
        nonce: 'nonce',
        userAuthorizationId: 'userAuthorizationId 記録して使う',
        referenceId: 'referenceId'
      }
    */
    const payload = {
      merchantPaymentId: uuidv4(),
      amount: {
        amount: 1000,
        currency: 'JPY',
      },
      userAuthorizationId: jwtResponse.userAuthorizationId,
      orderDescription: 'OAuthを使っての何かお支払い',
    };
    // 認可が通っているのでこのリクエストを投げれば決済できちゃう(お金を減らせる)
    const response = await PAYPAY.CreatePayment(payload);
    const body = response.BODY;
    /*
    CreatePayment 後の response の中身はこんな感じ
    {
      STATUS: 200,
      BODY: {
        resultInfo: { code: 'SUCCESS', message: 'Success', codeId: 'codeId' },
        data: {
          paymentId: 'paymentId',
          status: 'COMPLETED',
          acceptedAt: 1655918996,
          merchantPaymentId: 'merchantPaymentId',
          userAuthorizationId: 'userAuthorizationId',
          amount: {
            amount:1000,
            currency:"JPY"
          },
          requestedAt: 1655918996,
          orderDescription: 'OAuthを使っての何かお支払い',
          assumeMerchant: 'assumeMerchant'
        }
      }
    }
    */
    return {
      jwtResponse: jwtResponse,
      payment: body,
    };
  });
  // 金額を指定して購入してもらう場合の処理の実行(ここでは100円の商品を1個購入する)
  app.get('/', async (req, res) => {
    const currentBaseUrl = [req.protocol + '://' + req.hostname, req.awsLambda.event.requestContext.stage].join('/');
    const mst_product_records = await getKintoneRecords();
    const payload = {
      merchantPaymentId: uuidv4(),
      amount: {
        //        amount: 100,
        amount: mst_product_records[0]['数値'].value,
        currency: 'JPY',
      },
      codeType: 'ORDER_QR',
      //      orderDescription: 'なにかの商品',
      orderDescription: mst_product_records[0]['文字列__1行__0'].value,
      isAuthorization: false,
      redirectUrl: currentBaseUrl + '/platforms/paypay/payment_result',
      redirectType: 'WEB_LINK',
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
    res.redirect(body.data.url);
  });
  app.get('/payment_result', async (req, res) => {
    const response = await axios.get('https://obniz.com/events/2264/pImYzvnd7d56yocccRrf3qCgARCvEBjh/run');
    return {
      result: 'payment success!!',
    };
  });
  app.post('/payment_webhook', async (req, res) => {
    const response = await axios.get('https://obniz.com/events/2264/pImYzvnd7d56yocccRrf3qCgARCvEBjh/run');
    console.log(req.body);
    return {
      result: 'webhook',
    };
  });
}

async function getKintoneRecords(): Promise<any> {
  const kintoneAuthHeaderPlane = [process.env.KINTONE_USERNAME, process.env.KINTONE_PASSWORD].join(':');
  const kintoneAuthHeaderBase64 = Buffer.from(kintoneAuthHeaderPlane).toString('base64');
  const kintoneCursorResponse = await axios.post(
    'https://x9uzn8r37o0p.cybozu.com/k/v1/records/cursor.json',
    { app: '2' },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Cybozu-Authorization': kintoneAuthHeaderBase64,
      },
    },
  );
  console.log(kintoneCursorResponse.data);
  const kintoneRecordResponse = await axios.get('https://x9uzn8r37o0p.cybozu.com/k/v1/records/cursor.json', {
    headers: {
      'Content-Type': 'application/json',
      'X-Cybozu-Authorization': kintoneAuthHeaderBase64,
    },
    data: {
      id: kintoneCursorResponse.data.id,
    },
  });
  return kintoneRecordResponse.data.records;
}
