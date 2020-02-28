//approval required to use tokens


var StellarSdk = require('stellar-sdk');
const fetch = require('node-fetch');

var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();
// The admin account is the account we will be signing transaction to pay new account.
const adminSecretKey = 'SDN57VNK55KTXKOMUBIVP7DC7BZT2TQBSBLOUZOPBFV3M2PQFSKCZH4F';
// Derive Keypair object and public key (that starts with a G) from the secret of Admin
const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
const adminPublicKey = adminKeypair.publicKey();
console.log(adminPublicKey,'***  Admin public key  ***');

// The Issuer account is the account we will be signing transaction to pay new account.
const issuerSecretKey = 'SCGIMVOYQB2U2SWJBFV334C4WS64L3OZQVGHHKPCTFGBDRIIDPWAWPYY';
// Derive Keypair object and public key (that starts with a G) from the secret of Issuer
const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
const issuerPublicKey = issuerKeypair.publicKey();
console.log(issuerPublicKey,'***  Issuer public key  ***');

// The Distributor account is the account we will be signing transaction to pay new account.
const distributorSecretKey = 'SDZIUNKQFZJZUJRSS5FFQAP3LTLQH4UAOH46QVD7NTYHOGD35L5QG6CG';
// Derive Keypair object and public key (that starts with a G) from the secret of Distributor
const distributorKeypair = StellarSdk.Keypair.fromSecret(distributorSecretKey);
const distributorPublicKey = distributorKeypair.publicKey();
console.log(distributorPublicKey,'***  Distributor public key  ***');

// The Investor account is the account we will be signing transaction to pay new account.
const investorSecretKey = 'SCRNLGDHZTBIFO56WSWTTHQ2VXCHKXWSF4QR43BJRDQOZL4CPSWRWUZN';
// Derive Keypair object and public key (that starts with a G) from the secret of Investor
const investorKeypair = StellarSdk.Keypair.fromSecret(investorSecretKey);
const investorPublicKey = investorKeypair.publicKey();
console.log(investorPublicKey,'***  Investor public key  ***');

// The Investor account is the account we will be signing transaction to pay new account.
const investorSecretKey1 = 'SD637EJPERIE65DYAHYFQQBEXYJJRT2BLIREMKT3HRQ7Z22D5XVT3A2K';
// Derive Keypair object and public key (that starts with a G) from the secret of Investor
const investorKeypair1 = StellarSdk.Keypair.fromSecret(investorSecretKey1);
const investorPublicKey1 = investorKeypair1.publicKey();
console.log(investorPublicKey1,'***  Investor public key 1 ***');

(async function allowTrustIssu() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(issuerPublicKey);
    //console.log(account);
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
    
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })  
    // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.allowTrust({
        assetCode: 'VVCM',
        trustor : investorPublicKey1,
        authorize: true
      }))
      .setTimeout(30)
      .build();
  
    transaction.sign(issuerKeypair);  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    //console.log(transaction.toEnvelope().toXDR('base64'));

    // Submit the transaction to the Horizon server. The Horizon server will then
    // submit the transaction into the network for us.
    try {
      const transactionResult = await server.submitTransaction(transaction);
      console.log(JSON.stringify(transactionResult, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(transactionResult._links.transaction.href);
    } catch (e) {
      console.log('An error has occured:');
      console.log(e);
    }
  })();


  


