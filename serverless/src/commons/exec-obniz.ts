const Obniz = require("obniz");

export const obniz = new Obniz("1234-5678");
obniz.onconnect = async function () {
  console.log("connect!!")
}