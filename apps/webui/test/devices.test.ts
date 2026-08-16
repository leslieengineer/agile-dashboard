import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { CLUSTERS } from '@agile/contracts'
import { useDeviceStore } from '../src/stores/devices'

describe('device store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('applies realtime Matter attributes by node, endpoint and cluster', () => {
    const store = useDeviceStore()
    store.apply({
      type: 'event',
      request_id: null,
      node_id: '0x0000000000000001',
      endpoint: 1,
      cluster: CLUSTERS.OnOff,
      attributes: { OnOff: true },
      timestamp: new Date().toISOString(),
    })
    expect(store.attributes('0x0000000000000001', 1, CLUSTERS.OnOff)).toEqual({ OnOff: true })
  })
})
