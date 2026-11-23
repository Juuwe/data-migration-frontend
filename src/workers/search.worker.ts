import {
  AutoProcessor,
  AutoTokenizer,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  RawImage,
  SiglipTextModel,
  SiglipVisionModel,
  env,
} from '@huggingface/transformers'

const LOCAL_MODEL_PATH = import.meta.env.VITE_LOCAL_MODEL_PATH as string | undefined
const MODEL_ID = (import.meta.env.VITE_AI_MODEL_ID as string | undefined) ?? 'Xenova/mobileclip_s0'
const IS_SIGLIP = MODEL_ID.toLowerCase().includes('siglip')

// Для офлайн-демонстрации можно положить модель в public/models и задать
// VITE_LOCAL_MODEL_PATH=/models/. По умолчанию модель скачивается с Hugging Face.
env.allowLocalModels = Boolean(LOCAL_MODEL_PATH)
env.allowRemoteModels = !LOCAL_MODEL_PATH
if (LOCAL_MODEL_PATH) {
  env.localModelPath = LOCAL_MODEL_PATH
  // Большие ONNX-файлы не всегда помещаются в Cache API браузера.
  env.useBrowserCache = false
}

// Один поток WASM снижает пиковое потребление памяти в WebView.
try {
  const wasmBackend = (env as any).backends?.onnx?.wasm
  if (wasmBackend) wasmBackend.numThreads = 1
} catch {
  // разные версии onnxruntime могут не поддерживать эту настройку
}

const workerScope = self as unknown as {
  postMessage: (message: unknown) => void
  addEventListener: (type: string, listener: (event: MessageEvent) => void) => void
}

class ClipService {
  static tokenizer: any = null
  static processor: any = null
  static textModel: any = null
  static visionModel: any = null

  static async initText(progressCallback?: (data: unknown) => void) {
    if (!this.tokenizer) {
      const options = { device: 'wasm', dtype: 'q8' } as const

      this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
        progress_callback: progressCallback,
      })
      this.processor = await AutoProcessor.from_pretrained(MODEL_ID, {
        progress_callback: progressCallback,
      })
      this.textModel = IS_SIGLIP
        ? await SiglipTextModel.from_pretrained(MODEL_ID, {
            ...options,
            progress_callback: progressCallback,
          })
        : await CLIPTextModelWithProjection.from_pretrained(MODEL_ID, {
            ...options,
            progress_callback: progressCallback,
          })
    }
  }

  static async initVision(progressCallback?: (data: unknown) => void) {
    if (!this.visionModel) {
      // Vision-модель грузим лениво: она нужна только после выбора картинки.
      this.visionModel = IS_SIGLIP
        ? await SiglipVisionModel.from_pretrained(MODEL_ID, {
            device: 'wasm',
            dtype: 'q8',
            progress_callback: progressCallback,
          })
        : await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, {
            device: 'wasm',
            dtype: 'q8',
            progress_callback: progressCallback,
          })
    }
  }
}

workerScope.addEventListener('message', async (event: MessageEvent) => {
  const { type, data } = event.data as { type: string; data: any }

  try {
    if (type === 'init') {
      await ClipService.initText((message) => {
        workerScope.postMessage({ type: 'progress', data: message })
      })

      const items = data as Array<{ id: number; description: string }>
      const descriptions = items.map((item) => item.description)
      const textInputs = await ClipService.tokenizer(descriptions, {
        padding: 'max_length',
        truncation: true,
      })
      const output = await ClipService.textModel(textInputs)
      const textOutput = IS_SIGLIP ? output.pooler_output : output.text_embeds
      const embeddingSize = textOutput.data.length / Math.max(items.length, 1)

      const embeddings: Record<number, number[]> = {}
      for (let i = 0; i < items.length; i += 1) {
        const start = i * embeddingSize
        const end = start + embeddingSize
        embeddings[items[i].id] = Array.from(textOutput.data.slice(start, end) as Float32Array)
      }

      workerScope.postMessage({ type: 'text_embeddings_ready', data: embeddings })
    }

    if (type === 'image') {
      await ClipService.initVision((message) => {
        workerScope.postMessage({ type: 'progress', data: message })
      })

      const imageUrl = URL.createObjectURL(data as File)
      try {
        const image = await RawImage.read(imageUrl)
        const imageInputs = await ClipService.processor(image)
        const output = await ClipService.visionModel(imageInputs)
        const imageOutput = IS_SIGLIP ? output.pooler_output : output.image_embeds
        workerScope.postMessage({
          type: 'image_embedding_ready',
          data: Array.from(imageOutput.data as Float32Array),
        })
      } finally {
        URL.revokeObjectURL(imageUrl)
      }
    }
  } catch (error) {
    workerScope.postMessage({
      type: 'error',
      data: error instanceof Error ? error.message : String(error),
    })
  }
})
