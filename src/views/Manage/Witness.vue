<template>
  <div>
    <div>
      <a-divider orientation="left">Account's Witnesses</a-divider>

      <div class="justified" style="margin-bottom: 2rem">
        <div>
          <div v-if="proxy">
            <span>Uses @{{ proxy }} as proxy</span>
          </div>
        </div>
        <div>
          <a-button
            type="primary"
            style="margin-right: 0.6rem"
            @click="showModal"
            >New <a-icon type="plus" />
          </a-button>
        </div>
      </div>

      <a-list :data-source="witnessVotes" item-layout="horizontal">
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
        :after-close="afterModalClose"
        :cancel-button-props="{ props: { disabled: loading } }"
        title="New account auth"
        ok-text="Confirm"
        cancel-text="Cancel"
        @ok="confirmApproveSubmit"
      >
        <div>
          <a-form :form="form" class="login-form" @submit="confirmApprove">
            <div style="display: flex">
              <a-form-item label="Account" style="width: 62%; margin-right: 3%">
                <a-input
                  v-decorator="[
                    'account',
                    {
                      rules: [
                        {
                          required: accountRequired,
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

              <a-form-item label="Type" style="width: 35%;">
                <a-select
                  v-decorator="['type', { initialValue: witnessType }]"
                  :disabled="loading"
                  @change="changeWitnessType"
                >
                  <a-select-option value="witness">Witness</a-select-option>
                  <a-select-option value="proxy">Proxy</a-select-option>
                </a-select>
              </a-form-item>
            </div>
            <a-form-item>
              Note: to remove existing proxy, create new with blank account.
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
import { updateAccountWitness, updateAccountProxy } from "@lib/steem";

export default {
  data() {
    return {
      witnessType: "witness",
      modal: false,
      loading: false
    };
  },
  computed: {
    ...mapGetters(["getUserData", "getAccount"]),
    witnessVotes() {
      let witnessVotes = this.getUserData.witness_votes.map(account => {
        let image = "https://steemitimages.com/u/" + account + "/avatar";
        return { account, image };
      });

      return witnessVotes;
    },
    accountRequired() {
      return this.witnessType === "witness";
    },
    proxy() {
      return this.getUserData.proxy;
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  methods: {
    showModal() {
      this.modal = true;
    },
    afterModalClose() {
      this.witnessType = "witness";
    },
    changeWitnessType(e) {
      this.witnessType = e;
      this.form.resetFields();
      if (e === "proxy")
        this.$message.warn("This will reset your current witness votes");
    },
    accountValidator(rule, value, callback) {
      let accountStatus = validateAccount(value);

      if (value && typeof accountStatus === "string") {
        callback(accountStatus);
      } else {
        callback();
      }
    },
    confirmApproveSubmit() {
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.processApprove(values.account || "", values.type);
        }
      });
    },
    confirmApprove(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.processApprove(values.account || "", values.type);
        }
      });
    },
    async processApprove(witness, type) {
      try {
        this.loading = true;

        if (type === "witness") {
          await this.updateWitnessVote(witness, true);
        } else {
          if (!witness && !this.proxy) {
            this.$message.info("You do not have an existing witness proxy");
            this.loading = false;
            this.modal = false;
            return;
          } else {
            await this.updateWitnessProxy(witness);
          }
        }
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
    confirmRevoke(witness) {
      let self = this;
      const modal = this.$confirm({
        title: "Do you want to revoke @" + witness + "'s witness vote?",
        onOk() {
          return new Promise(async (resolve, reject) => {
            modal.update({
              maskClosable: false,
              cancelButtonProps: {
                props: { disabled: true }
              }
            });
            await self.updateWitnessVote(witness, false);
            await self.$store.dispatch("loadUserData");
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
    async updateWitnessVote(witness, approve) {
      await updateAccountWitness(
        this.getUserData.name,
        witness,
        approve,
        this.getAccount.keys.active
      );
    },
    async updateWitnessProxy(proxy) {
      await updateAccountProxy(
        this.getUserData.name,
        proxy,
        this.getAccount.keys.active
      );
    }
  }
};
</script>

<style></style>
