<template>
  <div class="contained">
    <div class="header-query">
      <div class="justified">
        <div>
          <a-button-group>
            <a-button
              :loading="loading && target === 'properties'"
              @click="loadTarget('properties')"
            >
              <a-icon type="setting" />
              Properties
            </a-button>
            <a-button
              :loading="loading && target === 'chain'"
              @click="loadTarget('chain')"
            >
              <a-icon type="pushpin" />
              Chain
            </a-button>
            <a-button
              :loading="loading && target === 'config'"
              @click="loadTarget('config')"
            >
              <a-icon type="barcode" />
              Config
            </a-button>
          </a-button-group>
        </div>
        <div>
          <a-tag color="orange">Network</a-tag>
        </div>
      </div>
    </div>
    <div v-if="Object.keys(targetData).length" class="json-view">
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
import steem from "steem";

export default {
  components: {
    VueJsonPretty
  },
  data() {
    return {
      target: "",
      targetData: {},
      loading: false
    };
  },
  async mounted() {
    let target = this.$route.params
      ? this.$route.params.target
        ? this.$route.params.target
        : null
      : null;
    if (!target) return;

    this.target = target;
    this.loadTarget(target);
  },
  methods: {
    loadTarget(target) {
      this.target = target;
      this.loading = true;
      this.targetData = {};

      // now load target data
      let self = this;

      if (target === "config") {
        steem.api.getConfig(function(err, result) {
          if (err) {
            self.$message.warn("Error occured. Please try again.");
            console.log(err);
            self.loading = false;
            return;
          } else {
            self.targetData = result;
            self.loading = false;
          }
        });
      } else if (target === "properties") {
        steem.api.getDynamicGlobalProperties(function(err, result) {
          if (err) {
            self.$message.warn("Error occured. Please try again.");
            console.log(err);
            self.loading = false;
            return;
          } else {
            self.targetData = result;
            self.loading = false;
          }
        });
      } else if (target === "chain") {
        steem.api.getChainProperties(function(err, result) {
          if (err) {
            self.$message.warn("Error occured. Please try again.");
            console.log(err);
            self.loading = false;
            return;
          } else {
            self.targetData = result;
            self.loading = false;
          }
        });
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
