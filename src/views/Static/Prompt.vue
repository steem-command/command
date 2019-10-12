<template>
  <div class="form-container">
    <div class="form">
      <div>
        <h6>Steem Command Prompt</h6>
        <a-input-search
          placeholder="Enter tx ID, account, block number, ..."
          size="large"
          @search="onSearch"
        >
          <a-icon slot="prefix" type="user" />
          <a-button slot="enterButton">Explore</a-button>
        </a-input-search>
      </div>
    </div>
  </div>
</template>

<script>
import deduceType from "@lib/deduceType";
import permalinks from "@lib/permalinks";

export default {
  methods: {
    onSearch(value) {
      if (!value) return this.$message.warning("Please enter something!");

      let type = deduceType(value);

      if (type) {
        this.$router.push(
          "/explore/" +
            type.type +
            "/" +
            (type.type === "post"
              ? permalinks.buildURL(type.value)
              : type.value)
        );
      } else {
        this.$message.warning("Sorry, could not deduce your input type.");
        this.$router.push("/explore");
      }
    }
  }
};
</script>

<style></style>
