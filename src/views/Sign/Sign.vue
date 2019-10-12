<template>
  <div class="form" style="margin-bottom: 5rem;">
    <a-divider orientation="left"> {{ statusMessage }} </a-divider>
    <operation-card :tx="tx" />
    <div class="justified">
      <div></div>
      <a-button
        v-if="!published"
        :loading="loading"
        type="primary"
        @click="nextClick"
      >
        {{ loggedIn ? "Sign" : "Sign in" }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { resolveTx, signTx, broadcastTx } from "@lib/steem";
import { getLowestAuthorityRequired } from "@lib/auth";
import * as steemuri from "steem-uri";
import OperationCard from "@components/Operation";
import operations from "@store/operations.json";

export default {
  components: {
    OperationCard
  },
  data() {
    return {
      authority: "",
      statusMessage: "Sign",
      loading: false,
      failed: false,
      confirmation: {}
    };
  },
  computed: {
    loggedIn() {
      return this.$store.getters.getLoggedIn;
    },
    activated() {
      return this.$store.getters.getActivated;
    },
    activeUser() {
      return this.$store.getters.getAccount;
    },
    config() {
      return this.$store.getters.getConfig;
    },
    op() {
      return operations[this.operation];
    },
    opName() {
      return operations[this.operation].name;
    },
    schema() {
      return this.op.schema;
    },
    schemaKeys() {
      return Object.keys(this.schema);
    },
    link() {
      return this.$route.fullPath;
    },
    parsedTx() {
      return steemuri.decode("steem:/" + this.link);
    },
    tx() {
      return {
        ...this.parsedTx.tx,
        confirmation: this.confirmation,
        failed: this.failed
      };
    },
    published() {
      return Object.keys(this.confirmation).length > 0;
    }
  },
  created() {
    this.$store.dispatch("setPending", this.link);
  },
  mounted() {
    this.authority = getLowestAuthorityRequired(this.parsedTx.tx);
  },
  methods: {
    nextClick() {
      if (!this.loggedIn) {
        // if not logged in, store tx in store and direct users to login
        this.$store.dispatch("setPending", this.link);
        if (!this.activated) {
          this.$router.push("/login");
        } else {
          this.$router.push("/unlock");
        }
      } else {
        // if logged in show sign approve pop confirm
        let self = this;
        this.$confirm({
          title: "Approve transaction",
          content:
            "Are you sure you want to sign and publish this transaction?",
          onOk() {
            self.processTx();
          },
          onCancel() {}
        });
      }
    },
    async processTx() {
      this.loading = true;

      // resolve tx
      let resolvedTx = await resolveTx(this.parsedTx, this.activeUser.name);

      // sign tx
      let signedTx = await signTx(
        this.activeUser.keys,
        resolvedTx,
        this.authority,
        this.config
      );

      // broadast tx
      let confirmation;
      let [sig] = signedTx.signatures;
      this.statusMessage = "Signed";

      if (!this.parsedTx.params.no_broadcast) {
        try {
          confirmation = await broadcastTx(signedTx);
          this.transactionId = confirmation.id;
          this.statusMessage = "Published";
          this.$message.success("Successful");
        } catch (err) {
          console.log(err);
          this.failed = true;
          this.$message.warn("Error occured, see console for detils");
          return;
        }
      }

      this.loading = false;
      this.confirmation = confirmation;

      this.$store.dispatch("setPending", null);

      if (confirmation && this.parsedTx.params.callback) {
        this.$message.success("Redirecting you in a moment...");

        setTimeout(() => {
          window.location = steemuri.resolveCallback(
            this.parsedTx.params.callback,
            {
              sig,
              id: confirmation.id || undefined,
              block: confirmation.block_num || undefined,
              txn: confirmation.txn_num || undefined
            }
          );
        }, 10000);
      } else {
        this.loading = false;
      }
    }
  }
};
</script>

<style></style>
