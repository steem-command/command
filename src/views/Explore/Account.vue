<template>
  <div class="contained">
    <div class="header-query">
      <a-input-search
        v-model="searchInput"
        placeholder="Enter valid account name"
        size="large"
        @search="onSearch"
      >
        <a-icon slot="prefix" type="user" />
        <a-button
          slot="enterButton"
          :loading="loading"
          :disabled="typeof validAccount === 'string'"
          >Explore account</a-button
        >
      </a-input-search>
      <small v-if="typeof validAccount === 'string'">
        <div style="margin: 0.5rem 0rem">{{ validAccount }}</div>
      </small>
    </div>
    <div v-if="targetData && targetData.name" class="json-view">
      <vue-json-pretty
        :path="'res'"
        :selectable-type="'single'"
        :select-on-click-node="true"
        :show-length="true"
        :show-line="true"
        :show-double-quotes="true"
        :highlight-mouseover-node="true"
        :highlight-selected-node="true"
        :data="targetData"
      >
      </vue-json-pretty>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import { Client } from "dsteem";
import { STEEM_RPC } from "@constants";
import { validateAccount } from "@lib/validator";

const client = new Client(STEEM_RPC);

export default {
  components: {
    VueJsonPretty
  },
  data() {
    return {
      target: "",
      searchInput: "",
      targetData: {},
      loading: false
    };
  },
  computed: {
    validAccount() {
      return validateAccount(this.searchInput);
    }
  },
  async mounted() {
    let target = this.$route.params
      ? this.$route.params.target
        ? this.$route.params.target.replace(/^@/, "")
        : null
      : null;
    if (!target) return;

    this.searchInput = target;
    this.target = target;
    this.loadTarget();
  },
  methods: {
    onSearch(value) {
      if (!value) return this.$message.warning("Please enter something!");
      this.target = value.replace(/^@/, "");
      this.loadTarget();
    },
    async loadTarget() {
      this.loading = true;
      this.targetData = {};

      try {
        let targetData = await client.database.getAccounts([this.target]);
        if (!targetData || !targetData[0] || !targetData[0].name) {
          this.$message.warn("Sorry, account does not exist");
          this.loading = false;
        } else {
          targetData = targetData[0];
          this.targetData = targetData;
          this.loading = false;
        }
      } catch (err) {
        this.$message.warn(
          "Error getting account. Please enter a valid account."
        );
        console.log(err);
        this.loading = false;
      }
    }
  }
};
</script>

<style>
.header-query {
  border-bottom: #fafafa solid 2px;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
}
</style>
