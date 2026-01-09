/**
 * Get the appropriate greeting based on the current time of day
 * Morning: 5:00 AM - 11:59 AM
 * Afternoon: 12:00 PM - 5:59 PM
 * Evening: 6:00 PM - 4:59 AM
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};
