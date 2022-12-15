Vue.component('qrcodeStreamVue', {
  template: `
  <div>
    <p class="error">error: {{ error }}</p>
    <p class="decode-result">Last result: <b>{{ result }}</b></p>
    <qrcode-stream
      :key="_uid"
      :camera="camera"
      :track="paintOutline"
      style="height: 100vh;position: fixed;top: 0;left: 0"
      @decode="onDecode"
      @init="onInit"
    />
    <div @click="scenCodeClick">
        扫描测试
    </div>
    <div @click="switchCamera">
        切换镜头
    </div>
  </div>
  `,
  data() {
    return {
      // 扫描
      error: '',
      result: '',
      scenVisible: false,
      camera: 'rear'
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
      this.camera = 'off'
    },
    scenCodeClick () {
      this.camera = 'rear'
      this.scenVisible = true
    },
    // 扫描成功后给予扫条框
    paintOutline (detectedCodes, ctx) {
      for (const detectedCode of detectedCodes) {
        const [ firstPoint, ...otherPoints ] = detectedCode.cornerPoints

        ctx.strokeStyle = "red";

        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (const { x, y } of otherPoints) {
          ctx.lineTo(x, y);
        }
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        ctx.stroke();
      }
    },
    paintCenterText (detectedCodes, ctx) {
      for (const detectedCode of detectedCodes) {
        const { boundingBox, rawValue } = detectedCode

        const centerX = boundingBox.x + boundingBox.width/ 2
        const centerY = boundingBox.y + boundingBox.height/ 2

        const fontSize = Math.max(12, 50 * boundingBox.width/ctx.canvas.width)

        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = "center"

        ctx.lineWidth = 3
        ctx.strokeStyle = '#35495e'
        ctx.strokeText(detectedCode.rawValue, centerX, centerY)

        ctx.fillStyle = '#5cb984'
        ctx.fillText(rawValue, centerX, centerY)
      }
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


