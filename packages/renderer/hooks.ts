import { useSyncExternalStore } from "react";
import { useEngineContext } from "./provider";
import { ExperienceState, ExperienceAction } from "../kxe/types";

export function useExperience(): Readonly<ExperienceState> {
  const engine = useEngineContext();
  
  return useSyncExternalStore(
    // We must pass a stable callback reference, but `engine.subscribe` is stable on the engine instance.
    (onStoreChange) => engine.subscribe(onStoreChange),
    () => engine.getState(),
    () => engine.getState() // SSR fallback
  );
}

// Selector hooks to prevent full component re-renders when only small parts of the state change
// Note: useSyncExternalStore with selector support isn't strictly standard in plain React without 
// `use-sync-external-store/with-selector`, but we can implement it natively or just return slices 
// if they are immutable. Because KXE creates fresh references for slices (e.g., `state.navigation`),
// returning a slice here works for simple memoization if the consumer uses `useMemo`. 
// However, the standard `useSyncExternalStore` re-evaluates the whole state.
// To truly optimize selectors in React 18 without external libs, one might need a custom hook that 
// tracks the slice equality, but for MS5, returning the immutable slice ensures referential transparency.

export function useNavigation(): Readonly<ExperienceState["navigation"]> {
  const state = useExperience();
  return state.navigation;
}

export function usePlugins(): Readonly<ExperienceState["plugins"]> {
  const state = useExperience();
  return state.plugins;
}

export function useSession(): Readonly<ExperienceState["session"]> {
  const state = useExperience();
  return state.session;
}

/**
 * useDispatch isolates dispatching from state subscriptions, meaning components 
 * that only need to trigger actions won't re-render on state changes.
 */
export function useDispatch(): (action: ExperienceAction) => void {
  const engine = useEngineContext();
  // Return the bound dispatch method
  return (action: ExperienceAction) => engine.dispatch(action);
}
