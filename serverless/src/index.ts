import awsLambdaFastify from '@fastify/aws-lambda';
import fastify from 'fastify';
import { paypayRouter } from './routes/platform/paypay';

const app = fastify();

app.get('/', (request, reply) => {
  return { hello: 'world' };
});

app.register(paypayRouter, { prefix: '/platforms/paypay' });

export const handler = awsLambdaFastify(app);
