/* eslint-disable no-useless-escape */

export default function(val) {
  if (!val) return false;

  val = val.replace(/,/g, "");

  // check if is transactions
  let isTX = val.match(/^([0-z]{40})$/);
  if (isTX) {
    return { type: "tx", value: isTX[1] };
  }

  // check for block
  let isBlock = val.match(/^([0-9]{1,8})$/);
  if (isBlock) {
    return { type: "block", value: isBlock[1] };
  }

  // check for account
  let isAccount = val.match(/^([0-z-\.]{3,16})$/);
  if (isAccount) {
    return { type: "account", value: isAccount[1].replace("@", "") };
  }

  // check for post
  let permlink = val.split("@")[1] || val;
  let len = permlink.split("/").length - 1;
  if (len >= 1 && len <= 2) {
    let acc = permlink.split("/")[0];
    let isAcc = acc.match(/^([0-z-\.]{3,16})$/);
    if (isAcc) {
      return { type: "post", value: permlink };
    }
  }

  // failed to deduce type
  return false;
}
