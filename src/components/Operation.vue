<template>
  <div>
    <div v-for="(op, opsIndex) in ops" :key="opsIndex" class="op-card">
      <a-card style="width: 100%">
        <div class="justified" style="margin-bottom: 2rem">
          <div>
            <a-tag>{{ op[0] }}</a-tag>
          </div>

          <div>
            <a-icon
              v-if="failed"
              type="exclamation-circle"
              theme="twoTone"
              two-tone-color="#eb2f96"
            />
            <a-icon
              v-else-if="confirmationKeys.length"
              type="check-circle"
              theme="twoTone"
              two-tone-color="#52c41a"
            />
          </div>
        </div>

        <div v-for="(key, indTx) in getKeys(op)" :key="indTx" class="justified">
          <div>{{ key }}</div>
          <div>{{ getValues(op)[indTx] }}</div>
        </div>
      </a-card>
    </div>

    <a-divider v-if="extKeys.length" orientation="right">Extensions</a-divider>
    <div>
      <div v-for="(key, index) in extKeys" :key="index" class="justified">
        <div>{{ key }}</div>
        <div>{{ extValues[index] }}</div>
      </div>
    </div>

    <a-divider v-if="confirmationKeys.length" orientation="right"
      >Details</a-divider
    >
    <div>
      <div
        v-for="(key, index) in confirmationKeys"
        :key="index"
        class="justified"
      >
        <div>{{ key }}</div>
        <div>{{ confirmationValues[index] }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tx: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    ops() {
      return this.tx.operations;
    },
    ext() {
      return this.tx.extensions;
    },
    confirmation() {
      return this.tx.confirmation;
    },
    failed() {
      return this.tx.failed;
    },
    extKeys() {
      return Object.keys(this.ext);
    },
    extValues() {
      return Object.values(this.ext);
    },
    confirmationKeys() {
      return Object.keys(this.confirmation);
    },
    confirmationValues() {
      return Object.values(this.confirmation);
    }
  },
  methods: {
    getKeys(op) {
      return Object.keys(op[1]);
    },
    getValues(op) {
      return Object.values(op[1]);
    }
  }
};
</script>

<style>
.op-card {
  margin: 2rem 0rem;
}
</style>
