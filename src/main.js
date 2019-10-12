import Vue from "vue";
import App from "./App.vue";
import router from "@router/index";
import store from "@store/index";
import "./registerServiceWorker";
import "@styles/index.css";

import {
  Icon,
  Avatar,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  List,
  Menu,
  Radio,
  Tabs,
  Steps,
  Tag,
  Modal,
  Popconfirm,
  Checkbox,
  Breadcrumb,
  Switch,
  Divider,
  Col,
  Card,
  Table,
  Form,
  Collapse,
  Tooltip,
  Dropdown,
  message,
  notification
} from "ant-design-vue";

import vueScrollto from "vue-scrollto";
import VueProgressBar from "vue-progressbar";

import TreeView from "vue-json-tree-view";
import VueQrcode from "@chenfengyuan/vue-qrcode";

Vue.prototype.$message = message;
Vue.prototype.$notification = notification;
Vue.prototype.$info = Modal.info;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$confirm = Modal.confirm;

Vue.component(VueQrcode.name, VueQrcode);

Vue.use(TreeView);
Vue.use(Icon);
Vue.use(Avatar);
Vue.use(Select);
Vue.use(List);
Vue.use(Popconfirm);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Radio);
Vue.use(Modal);
Vue.use(Breadcrumb);
Vue.use(Switch);
Vue.use(Divider);
Vue.use(Tabs);
Vue.use(Tag);
Vue.use(Checkbox);
Vue.use(Col);
Vue.use(Card);
Vue.use(DatePicker);
Vue.use(Tooltip);
Vue.use(Button);
Vue.use(Table);
Vue.use(Form);
Vue.use(Steps);
Vue.use(Collapse);
Vue.use(Menu);
Vue.use(Dropdown);

Vue.use(vueScrollto);

Vue.use(VueProgressBar, {
  color: "#39f",
  failedColor: "red",
  height: "40px"
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  mounted() {
    document.dispatchEvent(new Event("render-event"));
  },
  render: h => h(App)
}).$mount("#app");
