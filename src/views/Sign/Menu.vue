<template>
  <div>
    <div>
      <div v-for="(category, index) in categories" :key="index">
        <a-divider orientation="left">
          {{ capitalize(category) }} operations
        </a-divider>

        <div class="menu-grid">
          <menu-card
            v-for="(item, index) in signItems[category]"
            :key="index"
            :title="item.title"
            :not-ready="item.notReady"
            :description="item.description"
            :route="item.route"
            :class="'menu-item'"
          ></menu-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MenuCard from "@components/Cards/MenuItem";
import operations from "@store/operations.json";

export default {
  components: {
    MenuCard
  },
  data() {
    return {
      categories: [
        "account",
        "post",
        "wallet",
        "escrow",
        "market",
        "custom",
        "witness"
      ]
    };
  },
  computed: {
    signItems() {
      let keys = Object.keys(operations);
      let values = Object.values(operations);

      let opArray = {};
      let op = {};
      let category = "";

      keys.map(key => {
        op = operations[key];
        category = op.category;

        opArray[category] = opArray[category] || [];
        opArray[category].push({
          title: op.name,
          route: "/sign/" + key.replace(/_/g, "-"),
          // description: op.description,
          notReady: op.notReady
        });
      });
      return opArray;
    }
  },
  methods: {
    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
  }
};
</script>

<style></style>
