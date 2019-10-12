<template>
  <div>
    <div>
      <a-divider orientation="left">Account's Delegations</a-divider>

      <div class="justified" style="margin-bottom: 2rem">
        <div></div>
        <div>
          <a-button
            type="primary"
            style="margin-right: 0.6rem"
            @click="showModal"
            >New <a-icon type="plus" />
          </a-button>
        </div>
      </div>

      <a-list :data-source="accountDelegations" item-layout="horizontal">
        <a-list-item slot="renderItem" slot-scope="item, index">
          <a-list-item-meta>
            <router-link slot="title" :to="'/explore/account/' + item.account">
              {{ item.account }}
            </router-link>
            <a-avatar slot="avatar" :src="item.image" />
          </a-list-item-meta>
          <div>
            <a-button type="danger" @click="confirmRevoke(item.account)">
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
        :destroy-on-close="true"
        :cancel-button-props="{ props: { disabled: loading } }"
        title="New delegation"
        ok-text="Confirm"
        cancel-text="Cancel"
        @ok="confirmNewSubmit"
      >
        <div>
          <a-form :form="form" class="login-form" @submit="confirmNew">
            <div style="display: flex">
              <a-form-item label="Account" style="width: 49%; margin-right: 2%">
                <a-input
                  v-decorator="[
                    'account',
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
              <a-form-item
                :label="availableSPNum + ' Steem available'"
                style="width: 49%;"
              >
                <a-input
                  v-decorator="[
                    'steem',
                    {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter an amount'
                        },
                        {
                          min: 1,
                          max: availableSPNum,
                          message:
                            'Must not be less than 1 Steem or more than is available'
                        }
                      ]
                    }
                  ]"
                  :disabled="loading"
                  :max="availableSP"
                  placeholder="Steem"
                  type="number"
                  min="1"
                >
                  <a-icon
                    slot="prefix"
                    type="thunderbolt"
                    style="color: rgba(0,0,0,.25)"
                  />
                </a-input>
              </a-form-item>
            </div>
          </a-form>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script>
import { validateAccount } from "@lib/validator";
import { mapGetters } from "vuex";
import { loadAccountDelegation, updateAccountDelegation } from "@lib/steem";

export default {
  data() {
    return {
      modal: false,
      loading: false,
      delegations: []
    };
  },
  computed: {
    ...mapGetters(["getUserData", "getAccount", "getGprops"]),
    accountDelegations() {
      let delegations = this.delegations.map(del => {
        console.log(del);
        let image = "https://steemitimages.com/u/" + del.delegatee + "/avatar";
        return { account: del.delegatee, image };
      });

      return delegations;
    },
    availableSP() {
      const avail =
        parseFloat(this.getUserData.vesting_shares) -
        (parseFloat(this.getUserData.to_withdraw) -
          parseFloat(this.getUserData.withdrawn)) /
          1e6 -
        parseFloat(this.getUserData.delegated_vesting_shares);
      return this.vestsToSteem(avail);
    },
    availableSPNum() {
      return +this.availableSP.toFixed();
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  async created() {
    await this.loadDelegation();
  },
  methods: {
    showModal() {
      this.modal = true;
    },
    vestsToSteem(vests) {
      let steem = parseFloat(
        parseFloat(this.getGprops.total_vesting_fund_steem) *
          (parseFloat(vests) / parseFloat(this.getGprops.total_vesting_shares)),
        6
      );
      return steem;
    },
    steemToVests(steem) {
      let vests = parseFloat(
        parseFloat(this.getGprops.total_vesting_shares) *
          (parseFloat(steem) /
            parseFloat(this.getGprops.total_vesting_fund_steem)),
        6
      );
      return vests;
    },
    accountValidator(rule, value, callback) {
      let accountStatus = validateAccount(value);

      if (value && typeof accountStatus === "string") {
        callback(accountStatus);
      } else {
        callback();
      }
    },
    confirmNewSubmit() {
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.processDelegation(values.account, values.steem);
        }
      });
    },
    confirmNew(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.processDelegation(values.account, values.steem);
        }
      });
    },
    async processDelegation(account, steem) {
      try {
        this.loading = true;
        await this.updateDelegation(account, this.steemToVests(steem));

        await this.$store.dispatch("loadUserData");
        await this.loadDelegation();
        this.modal = false;
        this.loading = false;
        this.$message.success("Success");
      } catch (err) {
        this.$message.warn("An error occured, view console for details");
        console.log(err);
        this.loading = false;
      }
    },
    confirmRevoke(delegatee) {
      let self = this;
      const modal = this.$confirm({
        title: "Do you want to revoke @" + delegatee + "'s delegation?",
        onOk() {
          return new Promise(async (resolve, reject) => {
            modal.update({
              maskClosable: false,
              cancelButtonProps: {
                props: { disabled: true }
              }
            });
            await this.updateDelegation(delegatee, 0);

            await this.$store.dispatch("loadUserData");
            await this.loadDelegation();
            modal.destroy();
            resolve();
          }).catch(err => {
            console.log(err);
            this.$message.warn("Error occured, see console.for details.");
          });
        },
        onCancel() {},
        destroyOnClose: true
      });
    },
    async updateDelegation(delegatee, vestingShares) {
      await updateAccountDelegation(
        this.getUserData.name,
        delegatee,
        vestingShares,
        this.getAccount.keys.active
      );
    },
    async loadDelegation(expiring, count) {
      let delegations = await loadAccountDelegation(
        this.getUserData.name,
        expiring,
        count
      );
      this.delegations = delegations;
    }
  }
};
</script>

<style></style>
