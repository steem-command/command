<template>
  <div class="form-container">
    <div class="form">
      <a-divider orientation="left">Login</a-divider>

      <a-form :form="form" class="login-form" @submit="handleSubmit">
        <a-form-item>
          <a-input
            v-decorator="[
              'username',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please input your username'
                  },
                  { validator: accountValidator }
                ]
              }
            ]"
            :disabled="loading"
            placeholder="Username"
          >
            <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            v-decorator="[
              'password',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please input your account password'
                  },
                  {
                    min: 10,
                    max: 100,
                    message: 'Must be between 10 to 100 charactors'
                  },
                  { validator: keyValidator }
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
            <a-checkbox
              v-decorator="[
                'terms',
                {
                  rules: [
                    {
                      required: true,
                      transform: value => value || undefined,
                      type: 'boolean',
                      message: 'Please read and accept our Terms of Service!'
                    }
                  ],
                  valuePropName: 'checked',
                  initialValue: false
                }
              ]"
            >
              I agree to the
              <router-link to="/terms">Terms (MIT License)</router-link>.
            </a-checkbox>
            <a-button
              :loading="loading"
              :disabled="loading"
              type="primary"
              html-type="submit"
              class="login-form-button"
            >
              Next
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { validateAccount } from "@lib/validator";
import { getKeys } from "@lib/auth";
import { credentialsValid } from "@lib/auth";

export default {
  data() {
    return {
      loading: false
    };
  },
  computed: {
    termsAgreed() {
      return this.form.getFieldValue("terms");
    },
    storageMode() {
      return this.$store.getters.getSettings.storageMode;
    },
    accountNames() {
      return this.$store.getters.getAccounts || [];
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  methods: {
    async handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true;
          let validKey = await credentialsValid(
            values.username,
            values.password
          );
          let keys = await getKeys(values.username, values.password);
          if (validKey) {
            this.$message.success("Successfully verified your account and key");
            this.loading = false;
            this.$store.dispatch("setAccount", {
              name: values.username,
              keys: keys
            });
            this.$router.push("/lock");
          } else {
            this.$message.warn("Invalid account or active key");
            this.loading = false;
          }
        } else {
          this.loading = false;
          console.log(err);
        }
      });
    },
    accountValidator(rule, value, callback) {
      let accountStatus = validateAccount(value);

      if (value && (this.accountNames || []).indexOf(value) > -1) {
        callback("Sorry, account already exists. Login or reset app.");
      } else if (value && typeof accountStatus === "string") {
        callback(accountStatus);
      } else {
        callback();
      }
    },
    keyValidator(rule, value, callback) {
      let keyStatus = value.match(/^[0-9a-zA-Z]+$/);

      if (value && !keyStatus) {
        callback("Valid key cannot contain non-alphanumeric charactors");
      } else {
        callback();
      }
    }
  }
};
</script>

<style scoped></style>
