var StellarSdk = require('stellar-sdk');
const fetch = require('node-fetch');

var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();
// The admin account is the account we will be signing transaction to pay new account.
const adminSecretKey = 'SCVRNIUJFOUF7MKYJKAXG5Z5SBEDG4NHSPWLCYVWYJUQIWMQDSPJKDM2';
// Derive Keypair object and public key (that starts with a G) from the secret of Admin
const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
const adminPublicKey = adminKeypair.publicKey();
console.log(adminPublicKey,'***  Admin public key dfjgbkjdfhsd,nv,mdsnv, ***');

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

//step 1 
// operation name - change trust
// functioning - trust distributor to issuer 

(async function changeTrustDis() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(distributorPublicKey);
    //console.log(account);
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
    
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })  
    // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset('vmc1', issuerPublicKey)
      }))
      .setTimeout(30)
      .build();
  
    transaction.sign(distributorKeypair);  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    //console.log(transaction.toEnvelope().toXDR('base64'));

    // Submit the transaction to the Horizon server. The Horizon server will then
    // submit the transaction into the network for us.
    try {
      const transactionResult = await server.submitTransaction(transaction);
      //console.log(JSON.stringify(transactionResult, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(transactionResult._links.transaction.href);
    } catch (e) {
      console.log('An error has occured:');
      console.log(e);
    }
  })();

// step 2
// operation name - payment
// functioning - create tokens  


  (async function paymentDis() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(issuerPublicKey);
  
  
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
  
  
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })
      // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.payment({
        destination: distributorPublicKey,
        // The term native asset refers to lumens
        asset: new StellarSdk.Asset('vmc1', issuerPublicKey),
        // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
        // the decimal. They are represented in JS Stellar SDK in string format
        // to avoid errors from the use of the JavaScript Number data structure.
        amount: '1000000',
      }))
      // Make this transaction valid for the next 30 seconds only
      .setTimeout(30)
      // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
      // .addMemo(StellarSdk.Memo.text('Hello world!'))
      .build();
  
    // Sign this transaction with the secret key
    // NOTE: signing is transaction is network specific. Test network transactions
    // won't work in the public network. To switch networks, use the Network object
    // as explained above (look for StellarSdk.Network).
    transaction.sign(issuerKeypair);
  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    console.log(transaction.toEnvelope().toXDR('base64'));
  
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

// step 3
// operation name - manage offer
// functioning - create an offer for investors by distributor

  (async function manageOfferDis() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(distributorPublicKey);
  
  
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
   
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })
      // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.manageOffer({
        selling: new StellarSdk.Asset('vmc1', issuerPublicKey),
        buying: StellarSdk.Asset.native(),
        amount: '1000000',
        price: '1',
        offerId:0 // for creating new offer id must be 0
      }))
      // Make this transaction valid for the next 30 seconds only
      .setTimeout(30)
      // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
      // .addMemo(StellarSdk.Memo.text('Hello world!'))
      .build();
  
    // Sign this transaction with the secret key
    // NOTE: signing is transaction is network specific. Test network transactions
    // won't work in the public network. To switch networks, use the Network object
    // as explained above (look for StellarSdk.Network).
    transaction.sign(distributorKeypair);
  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    console.log(transaction.toEnvelope().toXDR('base64'));
  
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

// step 4
// operation name - change trust 
// functioning - change trust between investor and issuer of token, by investor

  (async function changeTrustIsu() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(investorPublicKey);
    //console.log(account);
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
    
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })  
    // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset('vmc1', issuerPublicKey)
      }))
      .setTimeout(30)
      .build();
  
    transaction.sign(investorKeypair);  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    //console.log(transaction.toEnvelope().toXDR('base64'));

    // Submit the transaction to the Horizon server. The Horizon server will then
    // submit the transaction into the network for us.
    try {
      const transactionResult = await server.submitTransaction(transaction);
      //console.log(JSON.stringify(transactionResult, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(transactionResult._links.transaction.href);
    } catch (e) {
      console.log('An error has occured:');
      console.log(e);
    }
  })();

// step 5
// operation name - manage offer 
// functioning - buy token , by creating an offer against issuer asset

  //buying assets
  (async function userManageOffer() {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(investorPublicKey);
  
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
   
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })
      // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.manageOffer({
        selling: StellarSdk.Asset.native(),
        buying: new StellarSdk.Asset('vmc1', issuerPublicKey),
        amount: '100',
        price: 1,
        offerId:0 // for creating new offer id must be 0
      }))
      // Make this transaction valid for the next 30 seconds only
      .setTimeout(30)
      // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
      // .addMemo(StellarSdk.Memo.text('Hello world!'))
      .build();
  
    // Sign this transaction with the secret key
    // NOTE: signing is transaction is network specific. Test network transactions
    // won't work in the public network. To switch networks, use the Network object
    // as explained above (look for StellarSdk.Network).
    transaction.sign(investorKeypair);
  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    console.log(transaction.toEnvelope().toXDR('base64'));
  
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


  async function generateKeyPair() {

    //randomly generate key pair for issuer account
    const Issuer = StellarSdk.Keypair.random();
    //generated public key 
    console.log(Issuer.publicKey(),'***  public key of issuer  ***');        
    //generated secret key
    console.log(Issuer.secret(),'***  secret key of issuer  ***');

    //randomly generate key pair for distributor
    const Distributor = StellarSdk.Keypair.random();
    //generated public key 
    console.log(Distributor.publicKey(),'***  public key of Distributor  ***');        
    //generated secret key
    console.log(Distributor.secret(),'***  secret key of Distributor  ***');
    
}

// for now we will use pre exist accounts for issuer and distributor due to lack of funds in friend bot    
//generateKeyPair();