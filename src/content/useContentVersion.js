import { useSyncExternalStore } from 'react';
import { getContentVersion, subscribeContent } from './siteContent';

/** Re-renders when admin-saved content changes while the page is open. */
export const useContentVersion = () => useSyncExternalStore(subscribeContent, getContentVersion, getContentVersion);
