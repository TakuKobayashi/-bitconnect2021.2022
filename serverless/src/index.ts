import awsLambdaFastify from '@fastify/aws-lambda';
import fastify from 'fastify';
import { obniz } from './commons/exec-obniz';
import { paypayRouter } from './routes/platform/paypay';
import { stripeRouter } from './routes/platform/stripe';

const app = fastify();

app.get('/', (request, reply) => {
  return { hello: 'world' };
});

app.register(paypayRouter, { prefix: '/platforms/paypay' });
app.register(stripeRouter, { prefix: '/platforms/stripe' });

export const handler = awsLambdaFastify(app);
