const Obniz = require('obniz');

export const obnizDevice = new Obniz(process.env.OBNIZ_DEVICE_ID);
obnizDevice.onconnect = async function () {
  console.log('connect!!');
};
