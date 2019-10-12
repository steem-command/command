<template>
  <div>
    <a-divider orientation="left">Account's Witnesses</a-divider>

    <div class="justified" style="margin-bottom: 2rem">
      <div>
        <div v-if="recovery">
          <span>Uses @{{ recovery }} as recovery</span>
        </div>
      </div>
      <div>
        <a-dropdown placement="bottomRight">
          <a-menu slot="overlay">
            <a-menu-item key="password" @click="showModal('password')"
              ><a-icon type="key" />Password</a-menu-item
            >
            <a-menu-item key="recovery" @click="showModal('recovery')"
              ><a-icon type="safety" />Recovery</a-menu-item
            >
          </a-menu>
          <a-button type="primary" style="margin-right: 0.6rem"
            >New <a-icon type="plus" />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <div class="keys">
      <a-list :data-source="keysData" item-layout="vertical" size="large">
        <div slot="footer">
          <a-icon
            type="warning"
            theme="twoTone"
            two-tone-color="red"
            style="margin-right: 0.2rem"
          />
          <b>Whatever you do, keep these keys safe!</b>
        </div>
        <a-list-item slot="renderItem" slot-scope="item, index" key="index">
          <template v-for="{ icon, name } in item.functions" slot="actions">
            <span :key="name">
              <a-icon :type="icon" style="margin-right: 8px" />
              {{ name }}
            </span>
          </template>
          <qrcode
            slot="extra"
            :value="item.key"
            :options="{ width: 200 }"
          ></qrcode>
          <a-list-item-meta :description="item.key">
            <span slot="title">{{ item.name }}</span>
            <a-avatar slot="avatar" :icon="item.icon" />
          </a-list-item-meta>
          {{ item.about }}
        </a-list-item>
      </a-list>
    </div>

    <div>
      <a-modal
        v-model="modal"
        :confirm-loading="loading"
        :mask-closable="!loading"
        :destroy-on-close="true"
        :after-close="afterModalClose"
        :cancel-button-props="{ props: { disabled: loading } }"
        :title="
          newType === 'password'
            ? 'Update account password'
            : 'Update recovery account'
        "
        ok-text="Confirm"
        cancel-text="Cancel"
        @ok="confirmNewSubmit"
      >
        <div>
          <a-form :form="form" class="login-form" @submit="confirmNew">
            <a-form-item v-if="newType === 'password'">
              <a-form-item label="New password">
                <a-input
                  v-decorator="[
                    'newPass',
                    {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your new password'
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
                  placeholder="New password must be alpha-numeric only with upper and lower case letters."
                  type="password"
                >
                </a-input>
              </a-form-item>

              <a-form-item label="Confirm">
                <a-input
                  v-decorator="[
                    'confirm',
                    {
                      rules: [
                        {
                          required: true,
                          message: 'Please confirm your new password!'
                        },
                        { validator: compareToFirstPassword }
                      ]
                    }
                  ]"
                  :disabled="loading"
                  placeholder="Confirm new password"
                  type="password"
                >
                </a-input>
              </a-form-item>

              <a-form-item label="Existing password">
                <a-input
                  v-decorator="[
                    'oldPass',
                    {
                      rules: [
                        {
                          required: true,
                          message: 'Please input account name'
                        },
                        { validator: accountValidator }
                      ]
                    }
                  ]"
                  :disabled="loading"
                  placeholder="Existing password"
                  type="password"
                >
                </a-input>
              </a-form-item>
            </a-form-item>

            <a-form-item v-else label="New recovery account">
              <a-input
                v-decorator="[
                  'recoverer',
                  {
                    rules: [
                      {
                        required: true,
                        message: 'Please input account name'
                      },
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
          </a-form>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script>
import { validatePassword, validateAccount } from "@lib/validator";
import { updateAccountRecovery, updateAccountKeys } from "@lib/steem";
import { getKeys } from "@lib/auth";
import { removeAccount } from "@/lib/storage";

export default {
  data() {
    return {
      newType: "password",
      modal: false,
      loading: false,
      keysFunction: {
        posting: [
          { icon: "edit", name: "Comment" },
          { icon: "up", name: "Vote" },
          { icon: "retweet", name: "Resteem" },
          { icon: "user-add", name: "Follow" }
        ],
        memo: [{ icon: "mail", name: "Decrypt private message" }],
        active: [
          { icon: "edit", name: "Posting capabilities +" },
          { icon: "plus", name: "Create new user" },
          { icon: "bg-colors", name: "Update account" },
          { icon: "arrow-right", name: "Transfer funds" },
          { icon: "stock", name: "Trade STEEM/SBD" },
          { icon: "to-top", name: "Power up/down" },
          { icon: "like", name: "Vote witnesses" },
          { icon: "safety", name: "Create escrow" }
        ],
        owner: [
          { icon: "thunderbolt", name: "Active capabilities +" },
          { icon: "key", name: "Change account keys" },
          { icon: "unlock", name: "Account recovery" }
        ]
      },
      keysInfo: {
        posting: "Used for social functions.",
        active: "Used for account management.",
        memo: "Used for decrypting private memos.",
        owner: "Used for account and keys management."
      },
      keysIcon: {
        posting: "edit",
        active: "thunderbolt",
        memo: "mail",
        owner: "key"
      }
    };
  },
  computed: {
    keys() {
      return this.$store.getters.getAccount.keys;
    },
    keysData() {
      let keys = Object.keys(this.keysInfo);
      let keysData = keys.map(key => {
        return {
          name: key,
          key: this.keys[key],
          about: this.keysInfo[key],
          icon: this.keysIcon[key],
          functions: this.keysFunction[key]
        };
      });
      return keysData;
    },
    getUserData() {
      return this.$store.getters.getUserData;
    },
    recovery() {
      return this.getUserData.recovery_account;
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  methods: {
    showModal(type) {
      this.modal = true;
      this.newType = type;
      this.form.resetFields();
    },
    afterModalClose() {
      this.newType = "witness";
    },
    accountValidator(rule, value, callback) {
      let accountStatus = validateAccount(value);

      if (value && typeof accountStatus === "string") {
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
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form;
      if (value && value !== form.getFieldValue("newPass")) {
        callback("Two passwords you entered are inconsistent!");
      } else {
        callback();
      }
    },
    confirmNewSubmit() {
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.processNew(values);
        }
      });
    },
    confirmNew(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.processNew(values);
        }
      });
    },
    async processNew(data) {
      try {
        this.loading = true;

        let activeUser = this.getUserData.name;

        if (this.newType === "password") {
          await this.newAccountKeys(data.oldPass, data.newPass);

          this.$store.dispatch("setAccount", {});
          this.$store.dispatch("setLoggedIn", false);

          let keys = await getKeys(activeUser, data.newPass);
          this.$store.dispatch("setAccount", {
            name: activeUser,
            keys: keys
          });

          await removeAccount(activeUser);

          this.$message.success("Success");
          this.modal = false;
          this.loading = false;
          this.$router.push("/lock");
        } else {
          await this.newAccountRecovery(data.recovery);
          await this.$store.dispatch("loadUserData");
          this.modal = false;
          this.loading = false;
          this.$message.success("Success");
        }
      } catch (err) {
        this.$message.warn("An error occured, view console for details");
        console.log(err);
        this.loading = false;
      }
    },
    async newAccountKeys(oldPass, newPass) {
      await updateAccountKeys(this.getUserData, oldPass, newPass);
    },
    async newAccountRecovery(recoverer) {
      await updateAccountRecovery(
        this.getUserData.name,
        recoverer,
        this.getAccount.keys.onwer
      );
    }
  }
};
</script>

<style>
.keys .ant-list-item-meta-description {
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;
}
</style>
