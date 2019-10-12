<template>
  <div class="container header">
    <div class="justified">
      <div class="logo">
        <router-link to="/">
          <h2>
            <span class="tablet">Steem Command [beta]</span>
            <span class="mobile">Steem CMD [beta]</span>
          </h2>
        </router-link>
      </div>

      <div>
        <a-dropdown :placement="'bottomRight'" class="mobile">
          <a class="ant-dropdown-link">
            <a-icon type="app-store" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="route('/explore')">Explore</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="route('/manage')">Manage</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="route('/sign')">Sign</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="route('/manage/keys')">Keys</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="route('/logout')">Sign</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>

        <div class="menu tablet">
          <a-button @click="route('/explore')">Explore</a-button>
          <a-button @click="route('/manage')">Manage</a-button>
          <a-button @click="route('/sign')">Sign</a-button>
          &nbsp; | &nbsp;
          <a-button v-if="!getLoggedIn" @click="route(loginRoute)">
            {{ getActivated ? "Unlock" : "Login" }}
          </a-button>

          <a-dropdown v-else :placement="'bottomRight'">
            <a-avatar
              :src="
                'https://steemitimages.com/u/' + getAccount.name + '/avatar'
              "
              :size="50"
              class="user-avatar"
            />
            <a-menu slot="overlay">
              <a-menu-item>
                <router-link :to="'/explore/account/' + getAccount.name"
                  >Account</router-link
                >
              </a-menu-item>
              <a-menu-item>
                <router-link to="/manage/auth">Auth</router-link>
              </a-menu-item>
              <a-menu-item>
                <router-link to="/manage/cast">Cast</router-link>
              </a-menu-item>
              <a-menu-item>
                <router-link to="/manage/keys">Keys</router-link>
              </a-menu-item>
              <a-menu-item>
                <router-link to="/logout">Logout</router-link>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["getLoggedIn", "getActivated", "getAccount"]),
    loginRoute() {
      return this.getActivated ? "/unlock" : "/login";
    }
  },
  methods: {
    route(route) {
      this.$router.push(route);
    }
  }
};
</script>

<style scoped>
.header {
  margin: auto;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.menu > * {
  margin: 0 5px;
}
.logo * {
  text-decoration: none;
}
</style>
