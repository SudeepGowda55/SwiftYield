import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const contractAddress = await rl.question("Enter Contract Address: ");
const privateKey = await rl.question("Enter Private Key: ");
console.log(`**Contract Address**: ${contractAddress.toString()}.`);
console.log(`**Private Key**: ${privateKey.toString()}.`);

export { contractAddress, privateKey };
