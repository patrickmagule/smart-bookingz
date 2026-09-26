export function getGreeting(userName: string = "") {
  const hour = new Date().getHours();
  const nameSuffix = userName ? `, ${userName}` : "";

  // Standard time-based greetings
  if (hour >= 5 && hour < 12) {
    return `Good morning${nameSuffix}`;
  } 
  
  if (hour >= 12 && hour < 17) {
    return `Good afternoon${nameSuffix}`;
  } 
  
  if (hour >= 17 && hour < 22) {
    return `Good evening${nameSuffix}`;
  }

  // Late Night Logic (10 PM to 5 AM): Pick a random greeting
  const nightGreetings = [
    "Good to see you",
    "Welcome back",
    "Working late?",
    "Hope you're having a pleasant evening"
  ];

  const randomIndex = Math.floor(Math.random() * nightGreetings.length);
  const selectedGreeting = nightGreetings[randomIndex];

  // Fix punctuation formatting when attaching the user's name
  if (selectedGreeting.endsWith("?")) {
    return userName ? `${selectedGreeting.slice(0, -1)}, ${userName}?` : selectedGreeting;
  }

  return `${selectedGreeting}${nameSuffix}`;
}
