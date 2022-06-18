const PAYPAY = require('@paypayopa/paypayopa-sdk-node');
PAYPAY.Configure({
  clientId: process.env.API_KEY,
  clientSecret: process.env.API_SECRET,
  merchantId: process.env.MERCHANT_ID,
  /* production_mode : Set the connection destination of the sandbox environment / production environment. 
The default false setting connects to the sandbox environment. The True setting connects to the production environment. */
  productionMode: false,
});

export async function paypayRouter(app, opts): Promise<void> {
  app.get('/', async (req, res) => {
    return {
      hello: 'salut',
    };
  });
}
