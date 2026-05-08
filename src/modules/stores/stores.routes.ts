import { Hono } from 'hono'
import { uploadStoreController, getStoresController, deleteStoreController, downloadStoreController } from './stores.controllers'

const app = new Hono()

app.post('/upload', uploadStoreController)
app.get('/get-stores', getStoresController)
app.delete('/delete-store/:id', deleteStoreController)
app.get('/download/:id', downloadStoreController)

export default app