import Express from "express"
const app = Express()
const port = 3000

app.get('/', (_, res) => {
  res.send('Server is Running!')
})

app.listen(port, () => {
  console.log(`Pdnode Account Backend listening on port ${port}`)
  console.log(`Server is running on http://localhost:${port}/`)
  console.log(`Server is running on http://127.0.0.1:${port}/`)

})

