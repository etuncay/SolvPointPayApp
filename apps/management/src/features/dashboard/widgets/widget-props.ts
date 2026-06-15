import type { DetailLevel } from '../domain/types';

export type WidgetProps = {
  onFullscreen?: () => void;
  mode?: 'compact' | 'scr_fullscreen';
  filterText?: string;
  detailLevel?: DetailLevel;
};

/** Tam ekran / full detail */
export const WIDGET_MAX_ROWS = 10;
/** Kompakt kart — mockup 6 satır */
export const WIDGET_COMPACT_ROWS = 6;
