import { storage, listAccounts } from "@lib/storage";
import { dsteem } from "@lib/steem";

export default {
  setActivated({ commit }, payload) {
    commit("setActivated", payload);
  },
  setAccount({ commit }, payload) {
    commit("setAccount", payload);
  },
  setAccounts({ commit }, payload) {
    commit("setAccounts", payload);
  },
  setLoggedIn({ commit }, payload) {
    commit("setLoggedIn", payload);
  },
  setLocked({ commit }, payload) {
    commit("setLocked", payload);
  },
  setPending({ commit }, payload) {
    commit("setPending", payload);
  },
  setActivity({ commit }, payload) {
    commit("setActivity", payload);
  },
  setConfig({ commit }, payload) {
    commit("setConfig", payload);
  },
  async setSettings({ commit, state }, payload) {
    let s = storage("local");
    await s.set("settings", payload);
    commit("setSettings", payload);
  },
  resetSession({ commit }) {
    commit("resetSession");
  },
  setUserData({ commit }, payload) {
    commit("setUserData", payload);
  },
  async loadAccounts({ commit, state }) {
    commit("setAccounts", null);
    commit("setActivated", false);

    let storageMode = state.settings.storageMode;
    if (!storageMode) return;

    let accounts = await listAccounts(storageMode);
    if (accounts) {
      commit("setAccounts", accounts);
      commit("setActivated", true);
    }
  },
  loadUserData({ commit, state }) {
    return new Promise(async (resolve, reject) => {
      try {
        let [account] = await dsteem.database.call("get_accounts", [
          [state.account.name]
        ]);
        commit("setUserData", account);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  async loadProps({ commit }) {
    let config = await dsteem.database.call("get_config", []);
    commit("setConfig", {
      ADDRESS_PREFIX: config.STEEM_ADDRESS_PREFIX,
      CHAIN_ID: config.STEEM_CHAIN_ID
    });

    let s = storage("local");
    let settings = await s.get("settings");

    commit("setSettings", settings || {});
  },
  loadGprops({ commit }) {
    dsteem.database.getDynamicGlobalProperties().then(gprops => {
      commit("setGprops", gprops);
    });
  },
  updateSession({ commit, state }, reset) {
    let timer = setInterval(() => {
      if (state.LoggedIn) {
        commit("setAccount", {});
        commit("setUserData", {});
        commit("setLoggedIn", false);

        this.$message.warn(
          "Session expired. Kindly unlock to use auth functions."
        );
      }
    }, 20 * 60 * 1000);

    if (reset) clearInterval(timer);
  }
};
