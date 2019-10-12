var steem = require("steem");

export const validateKey = (account, type, privWif) => {
  return new Promise((resolve, reject) => {
    steem.api.getAccounts([account], function(err, accountData) {
      if (err || !accountData[0]) return resolve(false);
      var pubWif = accountData[0][type].key_auths[0][0];
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

// validate account
export const validateAccount = value => {
  let i, label, len;

  if (!value) {
    return "Account name should not be empty";
  }

  const length = value.length;

  if (length < 3) {
    return "Account name should be at least 3 characters long";
  }
  if (length > 16) {
    return "Account name should be not be more than 16 characters";
  }

  const ref = value.split(".");

  for (i = 0, len = ref.length; i < len; i++) {
    label = ref[i];
    if (!/^[a-z]/.test(label)) {
      return "Invalid account";
    }
    if (!/^[a-z0-9-]*$/.test(label)) {
      return "Invalid account";
    }
    if (/--/.test(label)) {
      return "Invalid account";
    }
    if (!/[a-z0-9]$/.test(label)) {
      return "Invalid account";
    }
    if (!(label.length >= 3)) {
      return "Invalid account";
    }
  }
  return true;
};

export const validatePassword = value => {
  if (!value) return "Value must not be empty";

  var lowerCaseLetters = /[a-z]/g;
  if (!value.match(lowerCaseLetters))
    return "Must include lowercase charactors";

  var upperCaseLetters = /[A-Z]/g;
  if (!value.match(upperCaseLetters))
    return "Must include uppercase charactors";

  var numbers = /[0-9]/g;
  if (!value.match(numbers)) return "Must include a number";

  if (value.length < 8) return "Must be at least 8 charactors long";

  if (value.length > 30) return "Should not be more than 30 charactors";

  /* eslint-disable-next-line */
  var special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (!special.test(value))
    return "Must contain at least one special charactor";

  return true;
};

export const validateAmount = amount => {
  let valid;
  let value = amount.split(" ")[0];

  valid = parseInt(value, 10);
  if (isNaN(valid)) return "Must begin with a valid interger";

  let extensions = ["VESTS", "SP", "STEEM", "SBD"];
  let extension = amount.split(" ")[1];
  valid = extensions.indexOf(extension) > -1;
  return valid ? valid : "Must include ' VESTS', ' SP', ' STEEM', ' SBD'";
};

export const validateInt = val => {
  let valid = parseInt(val, 10);
  return isNaN(valid) ? "Must be a valid interger" : valid;
};

export const validateBool = val => {
  let valid = val === "true" || val === "false" ? true : false;
  return valid ? valid : "Must be either 'true' or 'false'";
};

export const validateDate = val => {
  var date = new Date(val);
  let valid = date instanceof Date && !isNaN(date.valueOf());
  return valid ? valid : "Must be a valid date";
};

/* eslint-disable */
export const validateOpData = (value, type) => {
  switch (type) {
    case "string":
      return typeof value === "string" ? true : "Type must be string";
    case "account":
      return realValue;
    case "amount":
      return realValue;
    case "int":
      return realValue;
    case "bool":
      return realValue;
    case "array":
      return realValue;
    case "time":
      return realValue;
    case "object":
      return realValue;
    case "json":
      return realValue;
    default:
      return "Sorry, type not known";
  }
};

export const castOpData = (value, type) => {
  switch (type) {
    case "string":
      return value;
    case "account":
      return value;
    case "amount":
      return value;
    case "int":
      return parseInt(value, 10);
    case "bool":
      return JSON.parse(value);
    case "array":
      return JSON.parse(value);
    case "time":
      return new Date(value);
    case "object":
      return JSON.parse(value);
    case "json":
      return JSON.parse(value);
    default:
      return "Sorry, type not known";
  }
};
