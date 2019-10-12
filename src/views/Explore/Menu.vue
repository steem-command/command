<template>
  <div>
    <a-divider orientation="left">Generated</a-divider>

    <div class="menu-grid">
      <menu-card
        v-for="(item, index) in generatedItems"
        :key="index"
        :title="item.title"
        :description="item.description"
        :route="item.route"
        :class="'menu-item'"
      ></menu-card>
    </div>

    <a-divider orientation="left">Network</a-divider>

    <div class="menu-grid">
      <menu-card
        v-for="(item, index) in networkItems"
        :key="index"
        :title="item.title"
        :description="item.description"
        :route="item.route"
        :class="'menu-item'"
      ></menu-card>
    </div>
  </div>
</template>

<script>
import MenuCard from "@components/Cards/MenuItem";

export default {
  components: {
    MenuCard
  },
  data() {
    return {
      generatedItems: [
        {
          title: "Account",
          route: "/explore/account"
        }
      ],
      networkItems: [
        {
          title: "Properties",
          route: "/explore/network/properties"
        },
        {
          title: "Chain",
          route: "/explore/network/chain"
        },
        {
          title: "Config",
          route: "/explore/network/config"
        }
      ]
    };
  }
};
</script>

<style></style>
