<template>
  <div>
    <div>
      <a-divider orientation="left">{{ authType }} account auths</a-divider>

      <div class="justified" style="margin-bottom: 2rem">
        <div></div>
        <div>
          <a-button
            type="primary"
            style="margin-right: 0.6rem"
            @click="showModal"
            >New <a-icon type="plus" />
          </a-button>
          <a-dropdown>
            <a-menu slot="overlay" @click="changeAuthType">
              <a-menu-item key="Posting">Posting</a-menu-item>
              <a-menu-item key="Active">Active</a-menu-item>
              <a-menu-item key="Owner">Owner</a-menu-item>
            </a-menu>
            <a-button> Type <a-icon type="down" /> </a-button>
          </a-dropdown>
        </div>
      </div>

      <a-list :data-source="accountAuths" item-layout="horizontal">
        <a-list-item slot="renderItem" slot-scope="item, index">
          <a-list-item-meta description="app?">
            <router-link slot="title" :to="'/explore/account/' + item.account">
              {{ item.account }}
            </router-link>
            <a-avatar slot="avatar" :src="item.image" />
          </a-list-item-meta>
          <div>
            <a-button
              type="danger"
              @click="confirmRevoke(item.account, authType.toLowerCase())"
            >
              Revoke <a-icon type="close" />
            </a-button>
          </div>
        </a-list-item>
      </a-list>
    </div>
    <div>
      <a-modal
        v-model="modal"
        :confirm-loading="loading"
        :mask-closable="!loading"
        :cancel-button-props="{ props: { disabled: loading } }"
        :destroy-on-close="true"
        title="New account auth"
        ok-text="Confirm"
        cancel-text="Cancel"
        @ok="confirmAuth"
      >
        <div>
          <a-form :form="form" class="login-form" style="display: flex">
            <a-form-item label="Account" style="width: 62%; margin-right: 3%">
              <a-input
                v-decorator="[
                  'account',
                  {
                    rules: [
                      { required: true, message: 'Please input account name' },
                      { validator: accountValidator }
                    ]
                  }
                ]"
                :disabled="loading"
                placeholder="Username"
              >
                <a-icon
                  slot="prefix"
                  type="user"
                  style="color: rgba(0,0,0,.25)"
                />
              </a-input>
            </a-form-item>

            <a-form-item label="Auth" style="width: 35%;">
              <a-select
                v-decorator="['type', { initialValue: 'posting' }]"
                :disabled="loading"
              >
                <a-select-option value="posting">Posting</a-select-option>
                <a-select-option value="active">Active</a-select-option>
                <a-select-option value="owner">Owner</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script>
import { validateAccount } from "@lib/validator";
import { mapGetters } from "vuex";
import { updateAccountAuth } from "@lib/steem";

export default {
  data() {
    return {
      authType: "Posting",
      modal: false,
      loading: false
    };
  },
  computed: {
    ...mapGetters(["getUserData"]),
    accounts() {
      return {
        Posting: this.getUserData.posting.account_auths,
        Active: this.getUserData.active.account_auths,
        Owner: this.getUserData.owner.account_auths
      };
    },
    accountAuths() {
      let accountAuths = this.accounts[this.authType].map(([account, auth]) => {
        let image = "https://steemitimages.com/u/" + account + "/avatar";
        return { account, auth, image };
      });

      return accountAuths;
    },
    activeUser() {
      return this.$store.getters.getAccount;
    },
    userData() {
      return this.$store.getters.getUserData;
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  methods: {
    showModal() {
      this.modal = true;
    },
    changeAuthType(e) {
      this.authType = e.key;
    },
    accountValidator(rule, value, callback) {
      let accountStatus = validateAccount(value);

      if (value && typeof accountStatus === "string") {
        callback(accountStatus);
      } else {
        callback();
      }
    },
    confirmAuth(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true;
          this.confirmNew(values.account, values.type);
        } else {
          this.loading = false;
        }
      });
    },
    confirmNew(app, type) {
      let self = this;
      this.$confirm({
        title:
          "Do you want to share your account's *" +
          type +
          "* auth with @" +
          app +
          "?",
        content: "This app will gain control access your account.",
        onOk() {
          self.processNew(app, type);
        },
        onCancel() {}
      });
    },
    async processNew(app, type) {
      try {
        this.loading = true;

        await updateAccountAuth(
          this.userData,
          app,
          type === "owner"
            ? this.activeUser.keys.owner
            : this.activeUser.keys.active,
          type
        );
        await this.$store.dispatch("loadUserData");
        this.modal = false;
        this.loading = false;
        this.$message.success("Success");
      } catch (err) {
        this.$message.warn("An error occured, view console for details");
        console.log(err);
        this.loading = false;
      }
    },
    confirmRevoke(app, type) {
      let self = this;
      const modal = this.$confirm({
        title: "Do you want to revoke @" + app + " app's *" + type + "* auth?",
        content: "This app will no longer gain control access your account.",
        async onOk() {
          return new Promise(async resolve => {
            modal.update({
              maskClosable: false,
              cancelButtonProps: {
                props: { disabled: true }
              }
            });
            await self.processRevoke(app, type);
            modal.destroy();
            resolve();
          });
        },
        onCancel() {},
        destroyOnClose: true
      });
    },
    async processRevoke(app, type) {
      try {
        this.loading = true;

        await updateAccountAuth(
          this.userData,
          app,
          type === "owner"
            ? this.activeUser.keys.owner
            : this.activeUser.keys.active,
          type
        );
        await this.$store.dispatch("loadUserData");
        this.loading = false;
        this.$message.success("Success");
      } catch (err) {
        this.$message.warn("An error occured, view console for details");
        console.log(err);
        this.loading = false;
      }
    }
  }
};
</script>

<style></style>
