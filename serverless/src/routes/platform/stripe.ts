import axios from 'axios';
const Stripe = require('stripe');

export async function stripeRouter(app, opts): Promise<void> {
  app.get('/', async (req, res) => {
    const currentBaseUrl = [req.protocol + '://' + req.hostname, req.awsLambda.event.requestContext.stage].join('/');
    const stripeApi = Stripe(process.env.STRIPE_SECRET_API_KEY);
    const products = await stripeApi.products.list();
    if (products.data.length > 0) {
      const session = await stripeApi.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: products.data[0].default_price,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${currentBaseUrl}/platforms/stripe/payment_result`,
        cancel_url: `${currentBaseUrl}/platforms/stripe/payment_result`,
        automatic_tax: { enabled: true },
      });
      res.redirect(session.url);
    } else {
      res.send({ message: 'error: price id are none.' });
    }
  });
  app.get('/payment_success', async (req, res) => {
    const response = await axios.get("https://obniz.com/events/2264/pImYzvnd7d56yocccRrf3qCgARCvEBjh/run");
    return { message: 'stripe payment success' };
  });
  app.get('/payment_cancel', async (req, res) => {
    return { message: 'stripe payment cancel' };
  });
}
