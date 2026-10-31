const GOLDEN_ANGLE = 137.508;
const HUES_PER_BAND = 12;
const LIGHTNESS_BANDS = [36, 46, 56];

/**
 * Stable color derived from an id only, so it never changes when other items
 * are added. Close ids get well-spread hues (golden angle); lightness varies in
 * bands to keep large groups of siblings distinguishable.
 * Dark enough for white text.
 */
export const getIdColor = (id: number): string => {
  const hue = Math.round(((Math.abs(id) * GOLDEN_ANGLE) % 360) * 10) / 10;
  const band =
    Math.floor(Math.abs(id) / HUES_PER_BAND) % LIGHTNESS_BANDS.length;
  return `hsl(${hue}, 55%, ${LIGHTNESS_BANDS[band]}%)`;
};
