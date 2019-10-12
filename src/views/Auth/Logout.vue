<template>
  <div class="form-container">
    <div class="form">
      <a-divider orientation="left">Logout</a-divider>

      <a-form :form="form" class="login-form" @submit="confirmReset">
        <a-form-item>
          <div class="justified">
            <a-checkbox
              v-decorator="[
                'reset',
                {
                  rules: [],
                  valuePropName: 'checked',
                  initialValue: false
                }
              ]"
              :disabled="forceReset"
              @change="changeAction"
            >
              Remove all accounts and reset app?
            </a-checkbox>

            <a-popconfirm
              :visible="resetVisiblePopup"
              title="Do you want to remove all accounts and reset app?"
              ok-text="Yes"
              cancel-text="No"
              @visibleChange="handleVisibleChange"
              @confirm="confirmReset"
              @cancel="cancelReset"
            >
              <a-button
                :type="reset ? 'danger' : 'primary'"
                html-type="submit"
                class="login-form-button"
              >
                {{ reset ? "Reset" : "Logout" }}
              </a-button>
            </a-popconfirm>
          </div>
        </a-form-item>
      </a-form>

      <div v-if="accountsList.length">
        <a-list :data-source="accountsList" item-layout="horizontal">
          <a-list-item slot="renderItem" slot-scope="item, index">
            <a-list-item-meta>
              <router-link
                slot="title"
                :to="'/explore/account/' + item.account"
              >
                {{ item.account }}
              </router-link>
              <a-avatar slot="avatar" :src="item.image" />
            </a-list-item-meta>
            <div>
              <a-popconfirm
                placement="topRight"
                ok-text="Yes"
                cancel-text="No"
                @confirm="confirmRemove(item.account)"
              >
                <template slot="title">
                  <p>Remove all apps and reset app</p>
                </template>

                <a-button :disabled="reset && !forceReset" type="danger">
                  Remove <a-icon type="close" />
                </a-button>
              </a-popconfirm>
            </div>
          </a-list-item>
        </a-list>
      </div>
    </div>
  </div>
</template>

<script>
import { removeAccount } from "@lib/storage";

export default {
  data() {
    return {
      accountNames: [],
      reset: false,
      forceReset: false,
      resetVisiblePopup: false
    };
  },
  computed: {
    accountsList() {
      let accountsList = this.accountNames.map(account => {
        let image = "https://steemitimages.com/u/" + account + "/avatar";
        return { account, image };
      });

      return accountsList;
    },
    activeAccount() {
      return this.$store.getters.getUserData.name;
    },
    storageMode() {
      return this.$store.getters.getSettings.storageMode;
    },
    userNames() {
      return this.$store.getters.getAccounts || [];
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  async created() {
    await this.$store.dispatch("loadAccounts");
    if (!this.userNames.length) return this.$router.push("/");

    this.accountNames = this.userNames.filter(
      name => name !== this.activeAccount
    );

    if (!this.activeAccount) {
      this.reset = true;
      this.forceReset = true;
    }
  },
  methods: {
    changeAction(e) {
      this.reset = e.target.checked;
    },
    confirmReset(e) {
      if (e) e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.resetVisiblePopup = false;

          if (values.reset || this.forceReset) {
            localStorage.clear();
            sessionStorage.clear();
            this.$store.dispatch("resetSession");
          } else {
            this.$store.dispatch("setAccount", {});
            this.$store.dispatch("setUserData", {});
            this.$store.dispatch("setLoggedIn", false);
          }

          this.$store.dispatch("updateSession", true);

          await removeAccount(this.storageMode, this.activeAccount);
          await this.$store.dispatch("loadAccounts");

          if (!this.userNames.length) return this.$router.push("/");

          this.$router.push("/unlock");
        }
      });
    },
    async confirmRemove(account) {
      await removeAccount(this.storageMode, account);
      await this.$store.dispatch("loadAccounts");

      if (!this.userNames.length) return this.$router.push("/");

      this.accountNames = this.userNames.filter(
        name => name !== this.activeAccount
      );
    },
    cancelReset() {
      this.resetVisiblePopup = false;
    },
    handleVisibleChange(visible) {
      if (!visible) {
        this.resetVisiblePopup = false;
        return;
      }
      if (!this.reset) {
        this.confirmReset();
      } else {
        this.resetVisiblePopup = true;
      }
    }
  }
};
</script>

<style scoped></style>
