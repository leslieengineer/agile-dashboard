import { CommandRegistry } from '../registry/CommandRegistry.js'
import { levelControlModule } from './levelControl.js'
import { onOffModule } from './onOff.js'
import { vendorCooktopModule } from './vendorCooktop.js'
import { windowCoveringModule } from './windowCovering.js'

export function createCommandRegistry(): CommandRegistry {
  const registry = new CommandRegistry()
  registry.register(onOffModule)
  registry.register(levelControlModule)
  registry.register(windowCoveringModule)
  registry.register(vendorCooktopModule)
  return registry
}
