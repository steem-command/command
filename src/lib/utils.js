
import operations from '@/helpers/operations.json';

export function getVestsToSP(properties) {
  return (
    parseFloat(properties.total_vesting_fund_steem) / parseFloat(properties.total_vesting_shares)
  );
}

function processValue(schema, key, value, { vestsToSP }) {
  const { type, defaultValue } = schema[key];
  const realValue = !value && typeof defaultValue !== 'undefined' ? defaultValue : value;
  switch (type) {
    case 'asset':
      if (realValue.indexOf('VESTS') !== -1) return `${parseFloat(realValue).toFixed(6)} VESTS`;
      if (realValue.indexOf('SP') !== -1)
        return `${(parseFloat(realValue) / vestsToSP).toFixed(6)} VESTS`;
      if (realValue.indexOf('STEEM') !== -1) return `${parseFloat(realValue).toFixed(3)} STEEM`;
      if (realValue.indexOf('SBD') !== -1) return `${parseFloat(realValue).toFixed(3)} SBD`;
      return realValue;
    case 'int':
      return parseInt(realValue, 10);
    default:
      return realValue;
  }
}

export function processTransaction(transaction, config) {
  const processed = { ...transaction };
  processed.tx.operations = transaction.tx.operations.map(([name, payload]) => {
    const processedPayload = Object.keys(operations[name].schema).reduce(
      (acc, key) => ({
        ...acc,
        [key]: processValue(operations[name].schema, key, payload[key], config),
      }),
      {},
    );
    return [name, processedPayload];
  });
  return processed;
}
