<template>
  <div class="form-container">
    <div class="form">
      <a-divider orientation="left">
        Lock
      </a-divider>

      <a-form :form="form" class="login-form" @submit="handleSubmit">
        <a-form-item>
          <a-input
            v-decorator="[
              'password',
              {
                rules: [
                  { required: true, message: 'Please input your new password' },
                  { validator: validateNewPassword }
                ]
              }
            ]"
            :disabled="loading"
            type="password"
            placeholder="Password"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-input
            v-decorator="[
              'confirm',
              {
                rules: [
                  { required: true, message: 'Please confirm your password!' },
                  { validator: compareToFirstPassword }
                ]
              }
            ]"
            :disabled="loading"
            type="password"
            placeholder="Confirm password"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>

        <a-form-item>
          <div class="justified">
            <div>
              <a-checkbox
                v-decorator="[
                  'store',
                  {
                    rules: [],
                    valuePropName: 'checked',
                    initialValue: storageMode === 'local'
                  }
                ]"
                :disabled="(Boolean(storageMode) && accountsExist) || loading"
              >
                This is my personal computer, save session.
              </a-checkbox>
            </div>
            <a-button
              :loading="loading"
              type="primary"
              html-type="submit"
              class="login-form-button"
            >
              Lock
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { encrypt } from "@lib/encryptor";
import { storage } from "@lib/storage";
import { validatePassword } from "@lib/validator";

export default {
  data() {
    return {
      loading: false
    };
  },
  computed: {
    isActicated() {
      return this.$store.getters.getActivated;
    },
    pending() {
      return this.$store.getters.getPending;
    },
    loggedIn() {
      return this.$store.getters.getLoggedIn;
    },
    account() {
      return this.$store.getters.getAccount.name;
    },
    storageMode() {
      return this.$store.getters.getSettings.storageMode;
    },
    accountsExist() {
      return (
        this.$store.getters.getAccounts &&
        this.$store.getters.getAccounts.length
      );
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  async created() {
    if (!this.account) return this.$router.push("/login");
    if (this.loggedIn) return this.$router.push("/");
  },
  destroyed() {
    this.$store.dispatch("setPending", "");
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true;
          try {
            let storageEngine = values.store ? storage() : storage("session");

            let storageMode = values.store ? "local" : "session";

            let updatedSettings = this.$store.getters.getSettings;
            updatedSettings.storageMode = storageMode;

            this.$store.dispatch("setSettings", updatedSettings);

            let account = this.$store.getters.getAccount.name;
            let keys = this.$store.getters.getAccount.keys;

            let newAccountData = { name: account, keys: keys };
            let encryptedAccount = encrypt(newAccountData, values.password);

            let accounts = storageEngine.get("accounts");
            accounts[account] = encryptedAccount;

            storageEngine.set("accounts", accounts);

            this.$store.dispatch("setActivated", true);
            this.$store.dispatch("setLoggedIn", true);

            this.$message.success("Success, loading your account");
            await this.$store.dispatch("loadUserData");

            this.$store.dispatch("updateSession");

            if (this.pending) {
              this.$router.push(this.pending);
            } else {
              this.$router.push("/");
            }
          } catch (err) {
            this.$message.warn("Error occured, see console for details");
            this.loading = false;
            console.log(err);
          }
        }
      });
    },
    validateNewPassword(rule, value, callback) {
      const form = this.form;
      if (value) {
        let passwordValidity = validatePassword(form.getFieldValue("password"));
        if (typeof passwordValidity === "string") {
          callback(passwordValidity);
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form;
      if (value && value !== form.getFieldValue("password")) {
        callback("Two passwords you entered are inconsistent!");
      } else {
        callback();
      }
    }
  }
};
</script>

<style scoped></style>
