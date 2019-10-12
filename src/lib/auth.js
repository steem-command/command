import { PrivateKey } from "dsteem";
import * as bs58 from "bs58";
import { dsteem } from "./steem";
import operations from "@store/operations.json";

function decodePrivate(encodedKey) {
  const buffer = bs58.decode(encodedKey);

  if (buffer[0] !== 128) throw new Error("private key network id mismatch");

  return buffer.slice(0, -4);
}

export function privateKeyFrom(password) {
  return new PrivateKey(decodePrivate(password).slice(1));
}

function isKey(username, password) {
  try {
    privateKeyFrom(password);
    return true;
  } catch (err) {
    return false;
  }
}

async function getUserKeysMap(username) {
  const keys = {};

  let accounts = null;
  try {
    accounts = await dsteem.database.getAccounts([username]);
  } catch (err) {
    console.error(err);
    return keys;
  }

  if (accounts.length !== 1) return keys;

  const [account] = accounts;

  keys[account.memo_key] = "memo";

  const types = ["owner", "active", "posting"];

  for (let i = 0; i < types.length; i += 1) {
    const keysOfType = account[types[i]].key_auths;

    for (let j = 0; j < keysOfType.length; j += 1) {
      keys[keysOfType[j][0]] = types[i];
    }
  }

  return keys;
}

export async function credentialsValid(username, password) {
  const keysMap = await getUserKeysMap(username);

  const key = isKey(username, password)
    ? privateKeyFrom(password)
    : PrivateKey.fromLogin(username, password, "active");

  return !!keysMap[key.createPublic().toString()];
}

export async function getKeys(username, password) {
  const keys = {
    owner: null,
    active: null,
    posting: null,
    memo: null
  };

  const keysMap = await getUserKeysMap(username);

  if (isKey(username, password)) {
    const type =
      keysMap[
        privateKeyFrom(password)
          .createPublic()
          .toString()
      ];

    keys[type] = password;

    return keys;
  }

  const ownerKey = PrivateKey.fromLogin(username, password, "owner");
  const activeKey = PrivateKey.fromLogin(username, password, "active");
  const postingKey = PrivateKey.fromLogin(username, password, "posting");
  const memoKey = PrivateKey.fromLogin(username, password, "memo");

  keys.owner = ownerKey.toString();
  keys.active = activeKey.toString();
  keys.posting = postingKey.toString();

  if (keysMap[memoKey.createPublic().toString()] === "memo") {
    keys.memo = memoKey.toString();
  }

  return keys;
}

export function getLowestAuthorityRequired(tx) {
  let authority;
  tx.operations.forEach(operation => {
    if (operations[operation[0]] && operations[operation[0]].authority) {
      if (operations[operation[0]].authority === "active") authority = "active";
      if (
        operations[operation[0]].authority === "posting" &&
        authority !== "active"
      )
        authority = "posting";
    }
  });
  return authority;
}

export function getAuthority(str, fallback) {
  return ["active", "posting"].includes(str) ? str : fallback;
}
