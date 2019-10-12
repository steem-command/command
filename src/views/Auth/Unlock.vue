<template>
  <div class="form-container">
    <div class="form">
      <a-divider orientation="left">
        Unlock
      </a-divider>

      <a-form :form="form" class="login-form" @submit="handleSubmit">
        <a-form-item>
          <a-select
            v-decorator="[
              'account',
              {
                rules: [{ required: true, message: 'Please select an account' }]
              }
            ]"
            :disabled="loading"
            :filter-option="filterOption"
            show-search
            placeholder="Select account"
            option-filter-prop="children"
            @change="selectAccount"
          >
            <a-select-option
              v-for="(account, index) in accountNames"
              :key="index"
              :value="account"
              >{{ account }}</a-select-option
            >
          </a-select>
        </a-form-item>

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
          <div class="justified">
            <div>
              <a-button-group>
                <a-button :disabled="loading" @click="route('/logout')"
                  >Reset</a-button
                >
                <a-button
                  :disabled="loading"
                  type="primary"
                  @click="route('/login')"
                  >New</a-button
                >
              </a-button-group>
            </div>
            <div>
              <a-button
                :loading="loading"
                type="primary"
                html-type="submit"
                class="login-form-button"
              >
                Unlock
              </a-button>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { decrypt } from "@lib/encryptor";
import { validatePassword } from "@lib/validator";
import { getAccount } from "@lib/storage";

export default {
  data() {
    return {
      activeAccount: "",
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
    accountNames() {
      return this.$store.getters.getAccounts;
    },
    storageMode() {
      return this.$store.getters.getSettings.storageMode;
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  created() {
    if (!this.accountNames.length) return this.$router.push("/login");
    if (this.loggedIn) return this.$router.push("/");
    let activated = this.$store.getters.getActivated;
    if (!activated) return this.$router.push("/login");
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
            let activeAccountData = await getAccount(
              this.storageMode,
              this.activeAccount
            );

            let decryptedAccount = decrypt(activeAccountData, values.password);
            decryptedAccount = JSON.parse(decryptedAccount);

            this.$store.dispatch("setAccount", decryptedAccount);
            this.$store.dispatch("setLoggedIn", true);

            this.$message.success("Success, loading your account");
            await this.$store.dispatch("loadUserData");

            this.$store.dispatch("updateSession");

            if (this.pending) {
              this.$router.push(this.pending);
            } else {
              this.$router.push("/");
            }
          } catch (e) {
            this.$message.warn("Invalid unlocking password");
            this.loading = false;
          }
        }
      });
    },
    selectAccount(value) {
      this.activeAccount = value;
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
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
    route(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style scoped></style>
