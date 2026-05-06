import { Hono } from 'hono'
import { bills, Bill, nextBillId, flats, users } from '../data/store'

const billingRoute = new Hono()

billingRoute.get('/', (c) => {
  const { status, month, flatId, residentId } = c.req.query()
  let result = [...bills]
  if (status) result = result.filter(b => b.status === status)
  if (month) result = result.filter(b => b.month === month)
  if (flatId) result = result.filter(b => b.flatId === flatId)
  if (residentId) result = result.filter(b => b.residentId === residentId)
  return c.json(result.sort((a, b) => b.month.localeCompare(a.month)))
})

billingRoute.get('/stats', (c) => {
  const totalBills = bills.length
  const paid = bills.filter(b => b.status === 'paid')
  const unpaid = bills.filter(b => b.status === 'unpaid')
  const overdue = bills.filter(b => b.status === 'overdue')
  const totalRevenue = paid.reduce((sum, b) => sum + b.totalAmount, 0)
  const pendingRevenue = [...unpaid, ...overdue].reduce((sum, b) => sum + b.totalAmount, 0)
  return c.json({ totalBills, paid: paid.length, unpaid: unpaid.length, overdue: overdue.length, totalRevenue, pendingRevenue })
})

billingRoute.get('/:id', (c) => {
  const id = c.req.param('id')
  const bill = bills.find(b => b.id === id)
  if (!bill) return c.json({ error: 'Bill not found' }, 404)
  return c.json(bill)
})

billingRoute.post('/generate', async (c) => {
  const body = await c.req.json()
  const { month, maintenanceAmount, waterCharges, parkingCharges } = body
  if (!month) return c.json({ error: 'Month is required (format: YYYY-MM)' }, 400)

  const occupiedFlats = flats.filter(f => f.status === 'occupied')
  const generated: Bill[] = []

  for (const flat of occupiedFlats) {
    const existing = bills.find(b => b.flatId === flat.id && b.month === month)
    if (existing) continue

    const owner = flat.ownerId ? users.find(u => u.id === flat.ownerId) : null
    const hasParking = flat.vehicles.some(v => v.type === 'car')
    const [year, monthNum] = month.split('-').map(Number)
    const dueDate = new Date(year, monthNum - 1, 10).toISOString().split('T')[0]

    const newBill: Bill = {
      id: nextBillId(),
      flatId: flat.id,
      flatNo: flat.flatNo,
      residentId: flat.ownerId || flat.residents[0] || '',
      residentName: owner?.name || 'Resident',
      month,
      year,
      maintenanceAmount: maintenanceAmount || 2500,
      waterCharges: waterCharges || 500,
      parkingCharges: hasParking ? (parkingCharges || 500) : 0,
      penalty: 0,
      totalAmount: 0,
      status: 'unpaid',
      dueDate,
      createdAt: new Date().toISOString()
    }
    newBill.totalAmount = newBill.maintenanceAmount + newBill.waterCharges + newBill.parkingCharges
    bills.push(newBill)
    generated.push(newBill)
  }

  return c.json({ generated: generated.length, bills: generated }, 201)
})

billingRoute.put('/:id/pay', async (c) => {
  const id = c.req.param('id')
  const idx = bills.findIndex(b => b.id === id)
  if (idx === -1) return c.json({ error: 'Bill not found' }, 404)
  const body = await c.req.json()
  const { paymentMethod, transactionId } = body
  bills[idx].status = 'paid'
  bills[idx].paidDate = new Date().toISOString().split('T')[0]
  bills[idx].paymentMethod = paymentMethod || 'Online'
  bills[idx].transactionId = transactionId || `TXN${Date.now()}`
  return c.json(bills[idx])
})

billingRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  const idx = bills.findIndex(b => b.id === id)
  if (idx === -1) return c.json({ error: 'Bill not found' }, 404)
  const body = await c.req.json()
  Object.assign(bills[idx], body)
  bills[idx].totalAmount = bills[idx].maintenanceAmount + bills[idx].waterCharges + bills[idx].parkingCharges + (bills[idx].penalty || 0)
  return c.json(bills[idx])
})

billingRoute.delete('/:id', (c) => {
  const id = c.req.param('id')
  const idx = bills.findIndex(b => b.id === id)
  if (idx === -1) return c.json({ error: 'Bill not found' }, 404)
  bills.splice(idx, 1)
  return c.json({ message: 'Bill deleted' })
})

export default billingRoute
