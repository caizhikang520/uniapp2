Vue.component('qrcodeStreamVue', {
  template: `
  <div>
    <p class="error">error: {{ error }}</p>
    <p class="decode-result">Last result: <b>{{ result }}</b></p>
    <div @click="scenCodeClick">
        扫描测试
    </div>

    <qrcode-stream
      v-if="scenVisible"
      :key="_uid"
      :camera="camera"
      :track="paintOutline"
      style="z-index:1;height: 100vh;position: fixed;top: 0;left: 0"
      @decode="onDecode"
      @init="onInit"
    >
      <template v-if="qrScannerVisible">
        <div class="qrcode-stream-title">
          <div class="qrcode-stream-close" @click="closeScenCode">
          <
          </div>
          <span style="font-size: 22px;color: #fff">扫一扫</span>
        <div>
        <div class="qr-scanner">
          <div class="box">
                <div class="line"></div>
                <div class="angle"></div>
            </div>
        </div>
      </template>
    </qrcode-stream>

  </div>
  `,
  data() {
    return {
      // 扫描
      error: '',
      result: '',
      scenVisible: false,
      qrScannerVisible: false,
      camera: 'rear'
    }
  },
  watch: {
    camera(val) {
      if(val){
        console.log(val)
      }
    }
  },
  methods: {
    closeScenCode () {
      this.camera = 'off'
      this.qrScannerVisible = false
      this.scenVisible = false
      this.camera = 'rear'
    },
    onDecode (result) {
      this.closeScenCode()
      this.result = result
    },
    scenCodeClick () {
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
        await promise.then(()=>{
          this.$nextTick(()=>{
            this.qrScannerVisible = true
          })
        })
      } catch (error) {
        this.closeScenCode()
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


