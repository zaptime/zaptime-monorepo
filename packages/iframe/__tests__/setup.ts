import { vi } from 'vitest'
import { setZaptimeComponent } from '../src/zaptime-init/components/Modal'

// Mock the Zaptime component for testing
const mockZaptimeInstance = {
  render: vi.fn(),
}

const mockZaptimeComponent = vi.fn().mockReturnValue(mockZaptimeInstance)

// Register the mock component
setZaptimeComponent(mockZaptimeComponent)

// Export for use in tests
export { mockZaptimeComponent, mockZaptimeInstance }

// Reset function for tests
export function resetMockZaptime(): void {
  mockZaptimeComponent.mockClear()
  mockZaptimeInstance.render.mockClear()
  setZaptimeComponent(mockZaptimeComponent)
}
