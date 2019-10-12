<template>
  <div class="form-container">
    <div class="form cast">
      <a-divider orientation="left">
        Cast
      </a-divider>

      <a-form :form="form" class="login-form" @submit="handleSubmit">
        <a-form-item>
          <a-form-item label="Badge" style="width: 62%; margin-right: 3%">
            <a-input
              v-decorator="[
                'badge',
                {
                  rules: [
                    { required: true, message: 'Please input your badge' },
                    {
                      min: 3,
                      max: 20,
                      message: 'Must be between 3 and 20 charactors'
                    },
                    { validator: badgeValidator }
                  ]
                }
              ]"
              :disabled="loading"
              placeholder="Badge"
            >
              <a-icon slot="prefix" type="tag" style="color: rgba(0,0,0,.25)" />
            </a-input>
          </a-form-item>

          <a-form-item label="Type" style="width: 35%;">
            <a-select
              v-decorator="['type', { initialValue: 'account' }]"
              :disabled="loading"
            >
              <a-select-option value="account">Account</a-select-option>
              <a-select-option value="app">App</a-select-option>
              <a-select-option value="publisher">Publisher</a-select-option>
              <a-select-option value="curator">Curator</a-select-option>
              <a-select-option value="witness">Witness</a-select-option>
              <a-select-option value="bot">Bot</a-select-option>
            </a-select>
          </a-form-item>
        </a-form-item>

        <a-form-item label="Domain">
          <a-input
            v-decorator="[
              'domain',
              {
                rules: [
                  { required: true, message: 'Please enter your domain URI' }
                ]
              }
            ]"
            :disabled="loading"
            placeholder="Enter your URI"
          >
            <a-icon slot="prefix" type="link" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>

        <a-form-item label="Scopes">
          <a-input
            v-decorator="[
              'scopes',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please enter your scopes'
                  }
                ]
              }
            ]"
            :disabled="loading"
            placeholder="Enter scopes, seperated by space"
          >
            <a-icon slot="prefix" type="key" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>

        <a-form-item label="Description">
          <a-input
            v-decorator="[
              'description',
              {
                rules: [
                  { required: true, message: 'Please input your description' }
                ]
              }
            ]"
            :disabled="loading"
            type="textarea"
            placeholder="Enter your description"
          >
          </a-input>
        </a-form-item>

        <a-form-item>
          <div class="justified">
            <div></div>
            <a-button
              :loading="loading"
              type="primary"
              html-type="submit"
              class="login-form-button"
            >
              Confirm
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { isBadgeWorthy } from "@lib/helpers";
import { updateAccountMetadata } from "@lib/steem";

export default {
  data() {
    return {
      loading: false,
      newCast: {}
    };
  },
  computed: {
    ...mapGetters(["getUserData"]),
    metadata() {
      return JSON.parse(this.getUserData.json_metadata || "{}");
    },
    oldCast() {
      return this.metadata.cast;
    },
    activeKey() {
      return this.$store.getters.getAccount.keys.active;
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  mounted() {
    this.newCast = this.oldCast;
  },
  methods: {
    async showConfirm(data) {
      let self = this;
      this.$confirm({
        title: "Update your account's cast?",
        onOk() {
          return new Promise(async resolve => {
            await self.castAccount(data);
            resolve();
          }).catch(err => console.log(err));
        },
        maskClosable: !self.loading,
        cancelButtonProps: {
          props: { disabled: self.loading }
        },
        destroyOnClose: true,
        onCancel() {}
      });
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, cast) => {
        if (!err) {
          this.loading = true;
          cast.scopes = cast.scopes
            .trim()
            .replace(/[^\w\s]/gi, "")
            .split(" ");
          let newMetadata = JSON.stringify({ ...this.metadata, cast });
          let accountData = { ...this.getUserData, json_metadata: newMetadata };
          this.showConfirm(accountData);
        }
      });
    },
    async castAccount(accountData) {
      try {
        await updateAccountMetadata(accountData, this.activeKey);
        await this.$store.dispatch("loadUserData");
        this.$message.success("Account successfully casted");
        this.loading = false;
        this.$router.push("/manage");
      } catch (err) {
        this.loading = false;
        console.log(err);
        this.$message.warn(
          "An error occured, please try again. See console for more details"
        );
      }
    },
    badgeValidator(rule, value, callback) {
      let badgeWorthy = isBadgeWorthy(value);
      if (value && !badgeWorthy) {
        callback("Alphabetical charactors only");
      } else {
        callback();
      }
    }
  }
};
</script>

<style>
.cast .ant-form-item-children {
  display: flex;
}
</style>
