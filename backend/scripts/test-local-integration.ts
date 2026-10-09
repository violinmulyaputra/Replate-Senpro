import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { writeFile, mkdir } from 'node:fs/promises'
import { createDatabase } from '../src/database.js'

// This runner creates dedicated demo data only in the project's local database.
if (!process.env.DATABASE_URL?.startsWith('sqlserver://localhost:14339;database=ReplateLocal;')) {
  throw new Error('This runner is restricted to ReplateLocal on localhost:14339.')
}
const base = 'http://localhost:5052'
const { prisma } = createDatabase(process.env.DATABASE_URL)
const password = 'Demo!'+randomBytes(18).toString('hex')
const runId = Date.now().toString()
const cases: Array<{name: string; result: string}> = []
async function api(path: string, method = 'GET', body?: unknown, token?: string, expected = 200) {
  const response = await fetch(base+path, {method, headers: {'Content-Type':'application/json', ...(token ? {Authorization:'Bearer '+token} : {})}, ...(body ? {body:JSON.stringify(body)} : {})})
  assert.equal(response.status, expected, `${method} ${path}: HTTP ${response.status}, expected ${expected}`)
  return response.json()
}
try {
  const owner = await api('/api/auth/register','POST',{name:'Owner Demo Lokal',email:`owner-${runId}@replate.test`,password,role:'RestaurantOwner'},undefined,201)
  const customer = await api('/api/auth/register','POST',{name:'Customer Demo Lokal',email:`customer-${runId}@replate.test`,password,role:'Customer'},undefined,201)
  const other = await api('/api/auth/register','POST',{name:'Other Owner Demo',email:`other-${runId}@replate.test`,password,role:'RestaurantOwner'},undefined,201)
  const otherCustomer = await api('/api/auth/register','POST',{name:'Other Customer Demo',email:`other-customer-${runId}@replate.test`,password,role:'Customer'},undefined,201)
  const restaurant = await api('/api/owner/restaurants','POST',{name:'Replate Bakery Demo Lokal',address:'Jalan Demo Yogyakarta',phone:'081234567890',isOpen:true},owner.token,201)
  const menu = await api(`/api/owner/restaurants/${restaurant.restaurantId}/menus`,'POST',{name:'Croissant Demo Lokal',description:'Data demonstrasi database lokal',category:'Bakery',normalPrice:20000,allergens:[],dietTags:[],allergenNote:null,isActive:true,photos:[]},owner.token,201)
  const date = new Date().toISOString().slice(0,10)
  const path = `/api/owner/menus/${menu.menuId}/production/${date}`
  const production = await api(path,'PUT',{producedQuantity:10,soldQuantity:8,surplusQuantity:2},owner.token)
  await api(path,'PUT',{producedQuantity:10,soldQuantity:5,surplusQuantity:2},owner.token,400)
  const saved = await prisma.productionRecord.findUniqueOrThrow({where:{productionRecordId:production.productionRecordId}})
  assert.equal(saved.soldQuantity,8)
  const history = await api(`/api/owner/restaurants/${restaurant.restaurantId}/production/history?menuId=${menu.menuId}&from=${date}&to=${date}`,'GET',undefined,owner.token)
  assert.equal(history.length,1);assert.equal(history[0].productionRecordId,production.productionRecordId)
  await api(`/api/owner/restaurants/${restaurant.restaurantId}/production/history`,'GET',undefined,other.token,404)
  cases.push({name:'production persistence, consistency, filtered history, owner isolation',result:'PASS'})
  const listing = await api(`/api/owner/restaurants/${restaurant.restaurantId}/listings`,'POST',{productionRecordId:production.productionRecordId,rescuePrice:10000,initialQuantity:2,pickupStart:new Date(Date.now()+3600000).toISOString(),pickupEnd:new Date(Date.now()+7200000).toISOString(),status:'Active'},owner.token,201)
  const checkout={items:[{surplusListingId:listing.surplusListingId,quantity:2}]}
  const order = await api('/api/customer/orders','POST',checkout,customer.token,201)
  assert.equal(order.status,'Pending');assert.match(order.pickupCode,/^[A-F0-9]{12}$/)
  assert.equal((await prisma.surplusListing.findUniqueOrThrow({where:{surplusListingId:listing.surplusListingId}})).availableQuantity,0)
  cases.push({name:'order creation, stock reduction, pickup code persisted',result:'PASS'})
  const count = await prisma.order.count({where:{customerId:customer.userId}})
  await api('/api/customer/orders','POST',checkout,customer.token,409)
  assert.equal(await prisma.order.count({where:{customerId:customer.userId}}),count)
  cases.push({name:'out of stock rejected without extra order',result:'PASS'})
  await api(`/api/customer/orders/${order.orderId}`,'GET',undefined,otherCustomer.token,404)
  cases.push({name:'different customer order access rejected',result:'PASS'})
  const verify = `/api/owner/orders/${order.orderId}/verify-pickup`
  const wrong = order.pickupCode === '000000000000' ? '111111111111' : '000000000000'
  await api(verify,'POST',{pickupCode:wrong},owner.token,400)
  assert.equal((await prisma.order.findUniqueOrThrow({where:{orderId:order.orderId}})).status,'Pending')
  assert.equal((await prisma.pickup.findUniqueOrThrow({where:{orderId:order.orderId}})).verifiedAt,null)
  await api(verify,'POST',{pickupCode:order.pickupCode},other.token,404)
  cases.push({name:'wrong pickup code and different owner rejected',result:'PASS'})
  // Keep one pending order for browser demo; the API-tested order is completed here.
  await api(verify,'POST',{pickupCode:order.pickupCode},owner.token)
  const pickup = await prisma.pickup.findUniqueOrThrow({where:{orderId:order.orderId}})
  assert.equal(pickup.status,'Verified');assert.ok(pickup.verifiedAt)
  await api(verify,'POST',{pickupCode:order.pickupCode},owner.token,409)
  const reloaded = await api(`/api/customer/orders/${order.orderId}`,'GET',undefined,customer.token)
  assert.equal(reloaded.status,'Completed');assert.equal((await prisma.pickup.findUniqueOrThrow({where:{orderId:order.orderId}})).verifiedAt?.toISOString(),pickup.verifiedAt?.toISOString())
  cases.push({name:'correct pickup, persisted completion, reused code rejected',result:'PASS'})
  const demoMenu = await api(`/api/owner/restaurants/${restaurant.restaurantId}/menus`,'POST',{name:'Sandwich Demo Lokal',description:'Pesanan untuk demonstrasi browser',category:'Bakery',normalPrice:30000,allergens:[],dietTags:[],allergenNote:null,isActive:true,photos:[]},owner.token,201)
  const demoProduction = await api(`/api/owner/menus/${demoMenu.menuId}/production/${date}`,'PUT',{producedQuantity:10,soldQuantity:5,surplusQuantity:5},owner.token)
  const demoListing = await api(`/api/owner/restaurants/${restaurant.restaurantId}/listings`,'POST',{productionRecordId:demoProduction.productionRecordId,rescuePrice:15000,initialQuantity:5,pickupStart:new Date(Date.now()+3600000).toISOString(),pickupEnd:new Date(Date.now()+7200000).toISOString(),status:'Active'},owner.token,201)
  const demoOrder = await api('/api/customer/orders','POST',{items:[{surplusListingId:demoListing.surplusListingId,quantity:1}]},customer.token,201)
  await writeFile('.env.demo-sessions',JSON.stringify({owner,customer,password,restaurantId:restaurant.restaurantId,orderId:demoOrder.orderId,pickupCode:demoOrder.pickupCode},null,2),{mode:0o600})
  await writeFile('.env.demo-accounts',`OWNER_EMAIL=${owner.email}\nCUSTOMER_EMAIL=${customer.email}\nDEMO_PASSWORD=${password}\n`,{mode:0o600})
  await mkdir('../docs/evidence/local-integration',{recursive:true})
  await writeFile('../docs/evidence/local-integration/api-results.json',JSON.stringify({database:'SQL Server local Docker / ReplateLocal',testedAt:new Date().toISOString(),cases,ids:{restaurantId:restaurant.restaurantId,menuId:menu.menuId,orderId:order.orderId,demoOrderId:demoOrder.orderId}},null,2))
  console.log(`PASS: ${cases.length} integration groups against SQL Server local. Demo sessions saved locally (ignored by Git).`)
} catch(error) {
  console.error(error instanceof assert.AssertionError ? error.message : 'Integration failed; check local API/database logs. No credentials printed.')
  process.exitCode=1
} finally {await prisma.$disconnect()}
