var steem = require("steem");
import { Client, cryptoUtils, PrivateKey } from "dsteem";
import { privateKeyFrom } from "./auth";
import * as steemuri from "steem-uri";

const EXPIRE_TIME = 1000 * 60;

export const dsteem = new Client("https://api.steemit.com");

export const validateKey = (account, privWif) => {
  return new Promise((resolve, reject) => {
    steem.api.getAccounts([account], function(err, accountData) {
      if (err || !accountData[0]) return resolve(false);
      var pubWif = accountData[0].active.key_auths[0][0];
      var isvalid;
      try {
        isvalid = steem.auth.wifIsValid(privWif, pubWif);
        return resolve(isvalid);
      } catch (e) {
        resolve(false);
      }
    });
  });
};

export const loadAccount = async username => {
  const [account] = await dsteem.database.getAccounts([username]);
  return account;
};

export const signTx = (keys, tx, authority, config) => {
  const chainId = config.CHAIN_ID;
  const privateKey =
    authority && keys[authority]
      ? privateKeyFrom(keys[authority])
      : privateKeyFrom(keys.active || keys.posting || keys.memo);
  return cryptoUtils.signTransaction(
    tx,
    [privateKey],
    Buffer.from(chainId, "hex")
  );
};

export const signMessage = (message, authority, keys, username) => {
  const timestamp = parseInt(new Date().getTime() / 1000, 10);
  const messageObj = {
    signed_message: message,
    authors: [username],
    timestamp
  };
  const hash = cryptoUtils.sha256(JSON.stringify(messageObj));
  const privateKey =
    authority && keys[authority]
      ? privateKeyFrom(keys[authority])
      : privateKeyFrom(keys.active || keys.posting || keys.memo);
  const signature = privateKey.sign(hash).toString();
  messageObj.signatures = [signature];
  return messageObj;
};

export const resolveTx = async (parsed, signer) => {
  const props = await dsteem.database.getDynamicGlobalProperties();

  // resolve the decoded tx and params to a signable tx
  const { tx } = steemuri.resolveTransaction(parsed.tx, parsed.params, {
    /* eslint-disable no-bitwise */
    ref_block_num: props.head_block_number & 0xffff,
    ref_block_prefix: Buffer.from(props.head_block_id, "hex").readUInt32LE(4),
    expiration: new Date(Date.now() + dsteem.broadcast.expireTime + EXPIRE_TIME)
      .toISOString()
      .slice(0, -5),
    signers: [signer],
    preferred_signer: signer
  });
  tx.ref_block_num = parseInt(tx.ref_block_num, 10);
  tx.ref_block_prefix = parseInt(tx.ref_block_prefix, 10);

  return tx;
};

export const broadcastTx = tx => dsteem.broadcast.send(tx);

export const updateAccount = (keys, data) => {
  const privateKey = privateKeyFrom(keys.active);
  return dsteem.broadcast.updateAccount(data, privateKey);
};

export const updateAccountMetadata = (accountData, activeKey) => {
  return new Promise(async (resolve, reject) => {
    try {
      await dsteem.broadcast.updateAccount(
        {
          account: accountData.name,
          memo_key: accountData.memo_key,
          json_metadata: accountData.json_metadata
        },
        privateKeyFrom(activeKey)
      );

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const updateAccountAuth = (
  accountData,
  newAccount,
  accountKey,
  type
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // type should be: posting, owner, active

      const targetAuth = accountData[type];

      //check for username duplication
      const checkAuth = accountData[type].account_auths;
      var arrayindex = -1;
      var checktext = " does not yet have posting permission";
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        if (checkAuth[i][0] == newAccount) {
          arrayindex = i;
        }
      }

      if (arrayindex > -1) {
        //revoke permission
        targetAuth.account_auths.splice(arrayindex, 1);
      } else {
        //add account permission
        targetAuth.account_auths.push([
          newAccount,
          parseInt(targetAuth.weight_threshold)
        ]);
        targetAuth.account_auths.sort();
      }

      //object creation
      const accObj = {
        account: name,
        json_metadata: accountData.json_metadata,
        memo_key: accountData.memo_key,
        [type]: targetAuth
      };

      //account update broadcast
      await dsteem.broadcast.updateAccount(accObj, privateKeyFrom(accountKey));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const updateAccountWitness = (account, witness, approve, activeKey) => {
  return new Promise(async (resolve, reject) => {
    try {
      //create vote object
      const vote = ["account_witness_vote", { account, witness, approve }];

      //broadcast the vote
      await dsteem.broadcast.sendOperations([vote], privateKeyFrom(activeKey));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const updateAccountProxy = (account, proxy, activeKey) => {
  return new Promise(async (resolve, reject) => {
    try {
      //create vote object
      const vote = ["account_witness_proxy", { account, proxy }];

      //broadcast the vote
      await dsteem.broadcast.sendOperations([vote], privateKeyFrom(activeKey));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const loadAccountDelegation = (account, expiring, count = 100) => {
  return new Promise(async (resolve, reject) => {
    try {
      let delegationData;
      if (expiring) {
        //expiring delegations function
        delegationData = await steem.database.call(
          "get_expiring_vesting_delegations",
          [account, new Date(expiring).toISOString().split(".")[0], count]
        );
      } else {
        //active delegations function
        delegationData = await dsteem.database.getVestingDelegations(
          account,
          "",
          count
        );
      }

      resolve(delegationData);
    } catch (err) {
      reject(err);
    }
  });
};

export const updateAccountDelegation = (
  delegator,
  delegatee,
  vestingShares,
  activeKey
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create op object
      const op = [
        "delegate_vesting_shares",
        { delegator, delegatee, vesting_shares: vestingShares }
      ];

      console.log(op, activeKey);

      //broadcast the vote
      //await dsteem.broadcast.sendOperations([op], privateKeyFrom(activeKey));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const updateAccountKeys = (accountData, oldPass, newPass) => {
  return new Promise(async (resolve, reject) => {
    try {
      let name = accountData.name;

      const oldOwnerKey = PrivateKey.fromLogin(name, oldPass, "owner");
      //create keys for new account
      const ownerKey = PrivateKey.fromLogin(name, newPass, "owner");
      const activeKey = PrivateKey.fromLogin(name, newPass, "active");
      const postingKey = PrivateKey.fromLogin(name, newPass, "posting");
      let memoKey = PrivateKey.fromLogin(name, newPass, "memo");

      let accObj = {
        account: name,
        json_metadata: accountData.json_metadata,
        owner: {
          key_auths: [[ownerKey.createPublic(), 1]],
          account_auths: accountData.owner.account_auths,
          weight_threshold: 1
        },
        active: {
          key_auths: [[activeKey.createPublic(), 1]],
          account_auths: accountData.active.account_auths,
          weight_threshold: 1
        },
        posting: {
          key_auths: [[postingKey.createPublic(), 1]],
          account_auths: accountData.posting.account_auths,
          weight_threshold: 1
        },
        memo_key: memoKey.createPublic()
      };

      //account update broadcast
      await dsteem.broadcast.updateAccount(accObj, privateKeyFrom(oldOwnerKey));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const updateAccountRecovery = (account, recoverer, ownerKey) => {
  return new Promise(async (resolve, reject) => {
    try {
      const op = [
        "change_recovery_account",
        {
          account_to_recover: account,
          new_recovery_account: recoverer,
          extensions: []
        }
      ];

      await dsteem.broadcast.sendOperations([op], privateKeyFrom(ownerKey));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
