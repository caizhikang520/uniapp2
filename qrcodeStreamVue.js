Vue.component('qrcodeStreamVue', {
  template: `
  <div>
    <p class="error">error: {{ error }}</p>
    <p class="decode-result">Last result: <b>{{ result }}</b></p>
    <qrcode-stream
      v-if="scenVisible"
      style="height: 200px; width: 200px"
      :camera="camera"
      @decode="onDecode"
      @init="onInit"
    />
    <div @click="scenCodeClick">
        扫描测试
    </div>
  </div>
  `,
  data() {
    return {
      // 扫描
      error: '',
      result: '',
      scenVisible: false,
      camera: 'rear',
    }
  },
  methods: {
    // 相机反转
    switchCamera() {
      switch (this.camera) {
        case 'front':
          this.camera = 'rear'
          break
        case 'rear':
          this.camera = 'front'
          break
        default:
          this.$toast('错误')
      }
    },
    onDecode (result) {
      this.scenVisible = false
      this.result = result
    },
    scenCodeClick () {
      this.scenVisible = true
    },
    async onInit (promise) {
      try {
        await promise
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = "ERROR: you need to grant camera access permission"
        } else if (error.name === 'NotFoundError') {
          this.error = "ERROR: no camera on this device"
        } else if (error.name === 'NotSupportedError') {
          this.error = "ERROR: secure context required (HTTPS, localhost)"
        } else if (error.name === 'NotReadableError') {
          this.error = "ERROR: is the camera already in use?"
        } else if (error.name === 'OverconstrainedError') {
          this.error = "ERROR: installed cameras are not suitable"
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = "ERROR: Stream API is not supported in this browser"
        } else if (error.name === 'InsecureContextError') {
          this.error = `ERROR: Camera access is only permitted in secure context. 
          Use HTTPS or localhost rather than HTTP.`;
        } else {
          this.error = `ERROR: Camera error (${error.name})`;
        }
      }
    }
  }
})


