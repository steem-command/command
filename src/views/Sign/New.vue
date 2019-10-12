<template>
  <div class="form">
    <a-divider orientation="left">{{ opName }}</a-divider>

    <a-form :form="form" @submit="handleSubmit">
      <span v-for="(fieldName, index) in schemaKeys" :key="index">
        <!-- account, string, object, json, buffer, and array input -->
        <a-form-item
          v-if="fieldMatch(schemaValues[index].type)"
          :label="fieldName + ' [' + schemaValues[index].type + ']'"
        >
          <a-input
            v-decorator="[
              fieldName,
              {
                rules: [
                  { required: true, message: 'Value required!' },
                  {
                    validator:
                      schemaValues[index].type === 'account'
                        ? accountValidator
                        : schemaValues[index].type === 'object'
                        ? objectValidator
                        : schemaValues[index].type === 'array'
                        ? arrayValidator
                        : schemaValues[index].type === 'json'
                        ? jsonValidator
                        : stringValidator
                  }
                ]
              }
            ]"
            :type="schemaValues[index].type === 'account' ? 'text' : 'textarea'"
            :placeholder="
              schemaValues[index].type === 'account'
                ? ''
                : 'Enter stringified value'
            "
          />
        </a-form-item>

        <!-- number input -->
        <a-form-item
          v-else-if="schemaValues[index].type === 'int'"
          :label="fieldName + ' [' + schemaValues[index].type + ']'"
        >
          <a-input-number
            v-decorator="[
              fieldName,
              {
                rules: [
                  { required: true, message: 'Value required!' },
                  { type: 'number', message: 'Value must be a number' }
                ]
              }
            ]"
            :min="0.001"
            style="width: 100%"
          />
        </a-form-item>

        <!-- time input -->
        <a-form-item
          v-else-if="schemaValues[index].type === 'time'"
          :label="fieldName + ' [' + schemaValues[index].type + ']'"
          style="width: 100%"
        >
          <a-date-picker
            v-decorator="[fieldName, config]"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          >
          </a-date-picker>
        </a-form-item>

        <!-- boolean input -->
        <a-form-item
          v-else-if="schemaValues[index].type === 'bool'"
          :label="fieldName + ' [' + schemaValues[index].type + ']'"
          style="width: 100%"
        >
          <a-radio-group
            v-decorator="[
              fieldName,
              {
                initialValue: 'true',
                rules: [{ required: true, message: 'Value required!' }]
              }
            ]"
            style="width: 100%"
          >
            <a-radio-button value="true" style="width: 50%">
              TRUE
            </a-radio-button>
            <a-radio-button value="false" style="width: 50%">
              FALSE
            </a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- amount input -->
        <a-form-item
          v-else-if="schemaValues[index].type === 'asset'"
          class="child-flex"
        >
          <a-form-item
            :label="fieldName + ' [' + schemaValues[index].type + ']'"
            style="width: 63%; margin-right: 2%;"
          >
            <a-input-number
              v-decorator="[
                fieldName,
                {
                  rules: [
                    { required: true, message: 'Value required!' },
                    { type: 'number', message: 'Value must be a number' }
                  ]
                }
              ]"
              :min="0.001"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="'currency'" style="width: 35%;">
            <a-select
              v-decorator="[fieldName + '_ext', { initialValue: 'STEEM' }]"
            >
              <a-select-option value="STEEM">STEEM</a-select-option>
              <a-select-option value="SBD">SBD</a-select-option>
              <a-select-option value="SP">SP</a-select-option>
              <a-select-option value="VESTS">VESTS</a-select-option>
            </a-select>
          </a-form-item>
        </a-form-item>
      </span>

      <!-- callback -->
      <a-form-item label="Callback">
        <a-input v-decorator="['callback']" placeholder="Link or scheme" />
        <div class="info-area" v-html="callbackMsg"></div>
      </a-form-item>

      <!-- submit button -->
      <a-form-item>
        <div class="justified">
          <a-form-item>
            <a-checkbox
              v-decorator="[
                'no_broadcast',
                {
                  rules: [],
                  valuePropName: 'checked',
                  initialValue: false
                }
              ]"
            >
              No broadcast
            </a-checkbox>
          </a-form-item>
          <a-button type="primary" html-type="submit">
            Next
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import * as steemuri from "steem-uri";
import operations from "@store/operations.json";
import { validateAccount } from "@lib/validator";

export default {
  data() {
    return {
      formLayout: "horizontal",
      config: {
        rules: [
          { type: "object", required: true, message: "Please select time!" }
        ]
      },
      callbackMsg: `
          Callback url in the format: https://myapp.com/wallet?tx={{id}}&included_in={{block}}
          or mymobileapp://signed/{{sig}}. Other params: txn.
           <br/>
          Note: <i>id</i>, <i>txn</i> and <i>block</i> are not available if no_broadcast is <i>true</i>.
        `
    };
  },
  computed: {
    operation() {
      return this.$route.params.op.replace(/-/g, "_");
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
    schemaValues() {
      return Object.values(this.schema);
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
    window.scroll(0, 0);
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          let callback = values.callback;
          let no_broadcast = values.no_broadcast;
          delete values.callback;
          delete values.no_broadcast;

          Object.keys(values).map(v => {
            let schema = this.schema[v];
            if (!schema) return;

            let type = schema.type;
            if (type === "time") {
              values[v] = values[v].format("YYYY-MM-DD HH:mm:ss");
            } else if (type === "asset") {
              values[v] += " " + values[v + "_ext"];
              delete values[v + "_ext"];
            }
          });

          let opData = [this.operation, values];
          let encodedOpData = steemuri.encodeOp(opData, {
            callback,
            no_broadcast
          });

          let encodedUrl = encodedOpData.split("steem:/")[1];
          this.$router.push(encodedUrl);
        }
      });
    },
    accountValidator(rule, value, callback) {
      let valid = validateAccount(value);

      if (value && typeof valid === "string") {
        callback(valid);
      } else {
        callback();
      }
    },
    intValidator(rule, value, callback) {
      let valid = parseInt(value, 10);

      if (isNaN(valid)) {
        callback("Value must be a valid number");
      } else {
        callback();
      }
    },
    stringValidator(rule, value, callback) {
      callback();
    },
    arrayValidator(rule, value, callback) {
      let schemeMsg = "Must be a stringified array in the format: ['steem', 1]";
      let valid = false;
      try {
        let parsed = JSON.parse(value);
        if (parsed && Array.isArray(parsed)) valid = true;
      } catch (err) {
        valid = false;
      }
      return callback(valid ? null : schemeMsg);
    },
    objectValidator(rule, value, callback) {
      let schemeMsg =
        "Must be a stringified object in the format: {'account' : 'steem'}";
      let valid = false;
      try {
        let parsed = JSON.parse(value);
        if (parsed instanceof Object) valid = true;
      } catch (err) {
        valid = false;
      }
      return callback(valid ? null : schemeMsg);
    },
    jsonValidator(rule, value, callback) {
      let schemeMsg =
        "Must be a stringified json in the format: {'account' : 'steem'}";
      let valid = false;
      try {
        let parsed = JSON.parse(value);
        if (parsed instanceof Object) valid = true;
      } catch (err) {
        valid = false;
      }
      return callback(valid ? null : schemeMsg);
    },
    fieldMatch(type, field) {
      let stringFields = [
        "string",
        "account",
        "array",
        "object",
        "json",
        "buffer"
      ];
      if (stringFields.indexOf(type) > -1) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style>
.child-flex .ant-form-item-children {
  display: flex;
}
</style>
