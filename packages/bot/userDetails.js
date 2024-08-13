import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const defaultPrivateKey =
  "0xcd4c30aefc1eb18a75ada590be78aea2f923ec89643bf94f1a850deab0870138";

async function promptForMandatoryInput(question) {
  let answer = "";
  while (!answer) {
    answer = await rl.question(question);
    if (!answer) {
      console.log("This field is mandatory. Please provide a value.");
    }
  }
  return answer;
}

async function promptForOptionalInput(question, defaultValue) {
  let answer = await rl.question(question);
  return answer || defaultValue;
}

// Prompt for contract address (mandatory)
const contractAddress = await promptForMandatoryInput(
  "Enter Contract Address: "
);

// Prompt for private key (optional with default value)
const privateKey = await promptForOptionalInput(
  "Enter Private Key (optional): ",
  defaultPrivateKey
);

console.log(`**Contract Address**: ${contractAddress.toString()}.`);
console.log(`**Private Key**: ${privateKey.toString()}.`);

rl.close();

export { contractAddress, privateKey };
