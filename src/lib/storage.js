import { notEmptyObject, notEmptyArray } from "./helpers";

export const sessionStore = {
  set: function(key, value) {
    return new Promise(resolve => {
      value = typeof value === "string" ? value : JSON.stringify(value);
      sessionStorage.setItem(key, value);
      resolve(true);
    });
  },
  get: function(key) {
    return new Promise(resolve => {
      let data = JSON.parse(sessionStorage.getItem(key) || "{}");
      resolve(notEmptyObject(data) ? data : null);
    });
  }
};

export const localStore = {
  set: function(key, value) {
    return new Promise(resolve => {
      value = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, value);
      resolve(true);
    });
  },
  get: function(key) {
    return new Promise(resolve => {
      let data = JSON.parse(localStorage.getItem(key) || "{}");
      resolve(notEmptyObject(data) ? data : null);
    });
  }
};

export const storage = mode => (mode === "session" ? sessionStore : localStore);

export const listAccounts = mode => {
  return new Promise(async resolve => {
    let s = storage(mode);
    let accounts = await s.get("accounts");

    if (!accounts) return resolve(null);

    let keys = Object.keys(accounts);
    resolve(notEmptyArray(keys) ? keys : null);
  });
};

export const getAccount = (mode, account) => {
  return new Promise(async resolve => {
    let s = storage(mode);
    let accounts = await s.get("accounts");

    if (!accounts) return resolve(null);

    resolve(accounts[account]);
  });
};

export const removeAccount = (mode, account) => {
  return new Promise(async resolve => {
    let s = storage(mode);
    let accounts = await s.get("accounts");

    if (!accounts) return resolve(null);

    delete accounts[account];
    s.set("accounts", notEmptyObject(accounts) ? accounts : null);
    resolve(true);
  });
};
