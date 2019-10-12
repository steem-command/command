<template>
  <div>
    <a-divider orientation="left">Account</a-divider>

    <div class="menu-grid">
      <menu-card
        v-for="(item, index) in accountItems"
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
      accountItems: [
        {
          title: "Cast Account",
          description: "Cast your account's profile",
          route: "/manage/cast"
        },
        {
          title: "Delegation",
          description: "Manage your account's delegations",
          route: "/manage/delegation"
        },
        {
          title: "Auth",
          description: "Manage your accounts's shared auths",
          route: "/manage/auth"
        },
        {
          title: "Witnesses",
          description: "Manage witnesses you voted for",
          route: "/manage/witness"
        },
        {
          title: "Keys",
          description: "Manage your account's keys",
          route: "/manage/keys"
        }
      ]
    };
  }
};
</script>

<style></style>
