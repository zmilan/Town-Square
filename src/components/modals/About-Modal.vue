<template>
<modal name="about-modal" transition="pop-out" :width="modalWidth" height="auto">
  <div class="modal-content">
    <div class="btn-container">
      <button class="btn" @click="$modal.hide('about-modal')">[X]</button>
    </div>
    <p>
      ⛲ Town Square is a fully decentralized discussion platform that's owned by everybody, built on Ethereum and IPFS.
    </p>
    <p>
      An Ethereum smart contract is used to keep track of the comments and verify identities.
    </p>
    <p>
      IPFS is used to store the content of the comments.
    </p>
    <p>
      Town Square is a project for the community. There is no token. The only costs are gas fees to the ethereum network. 
    </p>
    <p>
      The project is open source so please take a look at the code and contribute on <a href="https://github.com/WillWhiteneck/Town-Square" target="_blank" >Github</a> ✌️
    </p>
  </div>
</modal>
</template>
<script>

export default {
  name: 'AboutModal',
  data () {
    return {
      modalWidth: 550,
      modalHeight: 400
    }
  },
  created () {
    this.modalWidth = window.innerWidth < this.modalWidth
      ? window.innerWidth
      : this.modalWidth

    if (this.modalWidth < 1000) {
      this.modalHeight += 200
    }
  }
}
</script>
<style lang="stylus" scoped>
.modal-content
  margin 2em
  .btn-container
    text-align center
    align center
    .btn
      font-size 1em
      background none
      border none
      color #828282
      &:hover
        color black
        text-decoration underline
        cursor pointer
</style>
