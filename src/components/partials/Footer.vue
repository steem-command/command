<template>
  <div class="container footer">
    <small class="justified">
      <div>
        Developed by
        <a href="https://steemstudios.com" target="_blank">Steem Studios</a> and
        the
        <a href="https://steem.institute" target="_blank">Steem Institute</a>.
      </div>

      <div>
        <router-link to="/about">About</router-link> |&nbsp;
        <a href="https://steemstudios.com/contact" target="_blank">Contact</a>
        |&nbsp;
        <a href="https://github.com/steem-command/command/issues" target="_blank"
          >Issues</a
        >
        |&nbsp; <router-link to="/terms"> Terms </router-link> |&nbsp;
        <router-link to="/privacy"> Privacy </router-link>
      </div>
    </small>
  </div>
</template>

<style>
.footer {
  margin: 4rem auto 2rem !important;
}
.footer > * {
  color: #2c3e50 !important;
  text-decoration: none !important;
}
.footer * {
  color: #2c3e50 !important;
  text-decoration: none !important;
}
</style>
