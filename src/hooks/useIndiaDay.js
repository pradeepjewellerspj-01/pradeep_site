import { useEffect, useState } from 'react';
import { indiaToday } from '../data/promotions';

/**
 * Today's date in India ('YYYY-MM-DD'), updated when the day changes. Lists
 * that depend on start and end dates (offers, advertisements) re-check with
 * it, so a page left open overnight (the showroom TV) follows the calendar.
 */
export function useIndiaDay() {
  const [day, setDay] = useState(() => indiaToday());
  useEffect(() => {
    const t = window.setInterval(() => setDay(indiaToday()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return day;
}
