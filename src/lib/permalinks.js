export default {
  // builders

  buildURL: function(account, permalink, category) {
    if (account && permalink) {
      account = account
        .replace(/^@/, "")
        .trim()
        .replace(/^\/|\/$/g, "");
      permalink = permalink.trim().replace(/^\/|\/$/g, "");
      category = category.trim().replace(/^\/|\/$/g, "");

      return this.buildAccount(account) + category || "" + permalink;
    } else if (account && !permalink) {
      let url = account;

      let scheme = this.scheme(url);

      if (scheme === "flat") {
        return url;
      }

      let vars = this.deduce(url);

      return this(vars.account, vars.permlink, vars.category);
    } else {
      return null;
    }
  },

  buildAccount: function(account) {
    if (!account || typeof account !== "string") return null;
    account = account
      .replace(/^@/, "")
      .trim()
      .replace(/^\/|\/$/g, "");
    return account
      .toLowerCase()
      .replace(/-/g, "HYPHEN")
      .replace(/\./g, "--")
      .replace(/HYPHEN/g, "---");
  },

  // getters

  getAccount: function(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    let index1 = url.lastIndexOf("--");
    let index2 = url.lastIndexOf("---");

    if (!index1 && !index2) return url.split("-")[0];

    index1 = index1 + 3;
    index2 = index2 + 4;

    let index = Math.max(index1, index2);

    let ind = url.indexOf("-", index);

    let substring = url.substring(0, ind);

    return substring.replace(/---/g, "-").replace(/--/g, "."); // replace '---' before '--' else ...
  },

  getPermlink: function(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    url = url.split("#")[0];
    let index1 = url.lastIndexOf("--");
    let index2 = url.lastIndexOf("---");

    if (!index1 && !index2) return url.split("-")[0];

    index1 = index1 + 3;
    index2 = index2 + 4;

    let index = Math.max(index1, index2);

    let ind = url.indexOf("-", index);

    let substring = url.substring(ind).replace(/^-/, "");

    return substring;
  },

  getCategory: function(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    let category;
    let permalink = url.split("@")[1] || url;

    let len = permalink.split("/").length - 1;
    if (len === 2) {
      category = permalink.split("/")[1];
      return category;
    } else {
      return null;
    }
  },

  // parsers
  parse: function(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    let account = this.getAccount(url);
    let permlink = this.getPermlink(url);
    let category = this.getCategory(url);

    return { account: account, permlink: permlink, category: category };
  },

  deduce: function(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    let permlink = url.split("@")[1] || url;
    let author, category, permalink;
    let params = permlink.split("/");

    author = params[0];
    permlink = params.length === 3 ? params[1] : params[2];
    category = params.length === 3 ? params[2] : null;

    return { author, category, permlink };
  },

  parseAccount: function(account) {
    if (!account || typeof account !== "string") return null;
    account = account.trim().replace(/^\/|\/$/g, "");
    return account
      .replace(/^@/, "")
      .replace(/---/g, "-")
      .replace(/--/g, "."); // replace '---' before '--' else ...
  },

  scheme: function(url) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    let permlink = url.split("@")[1] || url;

    if (permlink.split("/").length > 1) return "default";
    return "flat";
  },

  convert: function(url, type) {
    if (!url || typeof url !== "string") return null;
    url = url.trim().replace(/^\/|\/$/g, "");

    let scheme = this.scheme(url);
    if (scheme && scheme === type) return url;

    if (scheme === "default" && type === "flat") {
      let vars = this.deduce(url);
      return this.buildURL(vars.account, vars.permlink, vars.category);
    } else {
      let account = this.getAccount(url);
      let permlink = this.getPermlink(url);
      return this.parseAccount(account) + permlink;
    }
  }
};
