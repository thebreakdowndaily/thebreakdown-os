/**
 * Compatibility aliases for the Plugin SDK.
 * These are kept for backward compatibility and are marked as deprecated.
 * They will be removed in SDK v2.0.
 */

import { ExperienceAction } from "../kxe/types";
import { EngineContext } from "../engine/types";

/**
 * @deprecated Use ExperienceAction instead.
 * @see ExperienceAction
 * Planned removal in SDK v2.0.
 */
export type KXEAction = ExperienceAction;

/**
 * @deprecated Use EngineContext instead.
 * @see EngineContext
 * Planned removal in SDK v2.0.
 */
export type EnginePluginContext = EngineContext;
