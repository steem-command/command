export default {
  setActivated(state, payload) {
    state.activated = payload;
  },
  setAccount(state, payload) {
    state.account = payload;
  },
  setUserData(state, payload) {
    state.userData = payload;
  },
  setAccounts(state, payload) {
    state.accounts = payload;
  },
  setLoggedIn(state, payload) {
    state.loggedIn = payload;
  },
  setLocked(state, payload) {
    state.locked = payload;
  },
  setPending(state, payload) {
    state.pending = payload;
  },
  setActivity(state, payload) {
    state.activity = payload;
  },
  setConfig(state, payload) {
    state.config = payload;
  },
  setSettings(state, payload) {
    state.settings = payload;
  },
  setGprops(state, payload) {
    state.gprops = payload;
  },
  resetSession(state) {
    state.activated = false;
    state.account = {};
    state.accounts = {};
    state.loggedIn = false;
    state.locked = false;
    state.pendingTx = "";
    state.activity = [];
    state.config = {};
    state.settings = {};
    state.gprops = {};
  }
};
