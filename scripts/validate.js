import fs from 'fs'
import crypto from 'crypto'

const baseUrl = 'http://localhost:3000'
const random = () => crypto.randomBytes(4).toString('hex')

async function http(path, opts = {}) {
  const res = await fetch(baseUrl + path, opts)
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { res, text, json }
}

async function main() {
  console.log('Starting validation sequence')
  const email = `test+${Date.now()}@example.com`
  const password = 'strongpass123'

  // Register
  console.log('Registering', email)
  let r = await http('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Validation User',
      email,
      password,
      phone: '9998887776',
      addressLine1: '1 Test St',
      city: 'Testville',
      state: 'TS',
      postalCode: '123456'
    })
  })
  console.log('register', r.res.status, r.json || r.text)

  // Login
  console.log('Logging in')
  r = await http('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  console.log('login', r.res.status, r.json || r.text)
  const setCookie = r.res.headers.get('set-cookie')
  if (!setCookie) {
    console.error('No set-cookie from login; aborting')
    process.exit(2)
  }
  // extract just the cookie pair before ';'
  const cookie = setCookie.split(';')[0]

  // Create order - pick a real product id from public catalog
  console.log('Fetching products to pick a productId')
  const prodRes = await fetch(baseUrl + '/api/products')
  const prodJson = await prodRes.json()
  const productId = prodJson?.products?.[0]?.id
  if (!productId) {
    console.error('No products available to create order')
    process.exit(4)
  }
  console.log('Using productId', productId)
  console.log('Creating order')
  const orderBody = {
    items: [{ productId, quantity: 1 }],
    customer: { name: 'Validation User', email, phone: '9998887776' },
    address: { line1: '1 Test St', city: 'Testville', state: 'TS', postalCode: '123456' },
    payment: { utrNumber: 'UTR' + random(), upiId: 'test@upi' }
  }
  r = await http('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(orderBody)
  })
  console.log('create order', r.res.status, r.json || r.text)
  if (!r.json || !r.json.orderId) {
    console.error('Order creation failed; aborting')
    process.exit(3)
  }
  const orderId = r.json.orderId

  // Upload proof (1x1 PNG)
  console.log('Uploading proof for order', orderId)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQImWNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
  const buf = Buffer.from(pngBase64, 'base64')
  const form = new FormData()
  form.append('orderId', orderId)
  form.append('file', new Blob([buf], { type: 'image/png' }), 'proof.png')

  r = await fetch(baseUrl + '/api/orders/upload-proof', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: form
  })
  const uploadText = await r.text()
  let uploadJson = null
  try { uploadJson = JSON.parse(uploadText) } catch {}
  console.log('upload-proof', r.status, uploadJson || uploadText)

  console.log('Validation sequence complete')
}

main().catch(err => { console.error(err); process.exit(1) })
