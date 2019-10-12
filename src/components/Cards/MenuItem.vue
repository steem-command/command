<template>
  <a-card
    :class="notReady ? 'css-disabled-all' : ''"
    style="width: 100%"
    hoverable
    @click="$router.push(route)"
  >
    <div class="menuItem">
      <div class="content">
        <div class="title">{{ title }}</div>
        <div class="description">{{ description }}</div>
      </div>
    </div>
  </a-card>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    route: {
      type: String,
      default: ""
    },
    notReady: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.menuItem {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
