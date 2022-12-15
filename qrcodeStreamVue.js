Vue.component('qrcodeStreamVue', {
  template: `
  <div>
    <p class="error">error: {{ error }}</p>
    <p class="decode-result">Last result: <b>{{ result }}</b></p>
    <p> {{ detectedCodes ? JSON.stringify(detectedCodes) : '' }} </p>
    <p>
      Track function:
      <select v-model="selected">
        <option v-for="option in options" :key="option.text" :value="option">
          {{ option.text }}
        </option>
      </select>
    </p>
    <qrcode-stream
      :key="_uid"
      :camera="camera"
      :track="selected.value"
      @decode="onDecode"
      @init="onInit"
    />
    <div @click="scenCodeClick">
        扫描测试
    </div>
  </div>
  `,
  data() {
    const options = [
      { text: "nothing (default)", value: undefined },
      { text: "outline", value: this.paintOutline },
      { text: "centered text", value: this.paintCenterText },
      { text: "bounding box", value: this.paintBoundingBox },
    ]

    const selected = options[1]
    return {
      // 扫描
      error: '',
      result: '',
      scenVisible: false,
      camera: 'rear',
      selected,
      options,
      detectedCodes: null
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
    paintOutline (detectedCodes, ctx) {
      console.log(detectedCodes, ctx);
      this.detectedCodes = detectedCodes
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

    paintBoundingBox (detectedCodes, ctx) {
      for (const detectedCode of detectedCodes) {
        const { boundingBox: { x, y, width, height } } = detectedCode

        ctx.lineWidth = 2
        ctx.strokeStyle = '#007bff'
        ctx.strokeRect(x, y, width, height)
      }
    },

    paintCenterText (detectedCodes, ctx) {
      for (const detectedCode of detectedCodes) {
        const { boundingBox, rawValue } = detectedCode

        const centerX = boundingBox.x + boundingBox.width/ 2
        const centerY = boundingBox.y + boundingBox.height/ 2

        const fontSize = Math.max(12, 50 * boundingBox.width/ctx.canvas.width)
        console.log(boundingBox.width, ctx.canvas.width)

        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = "center"

        ctx.lineWidth = 3
        ctx.strokeStyle = '#35495e'
        ctx.strokeText(detectedCode.rawValue, centerX, centerY)

        ctx.fillStyle = '#5cb984'
        ctx.fillText(rawValue, centerX, centerY)
      }
    },

    logErrors (promise) {
      promise.catch(console.error)
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


