// Intent Matching Example
const addMatch = transcript.match(/^add (.+?)(?: quantity (\d+))?$/i);
if (addMatch) {
  const nameTerm = addMatch[1].toLowerCase();
  const qty = addMatch[2] ? +addMatch[2] : 1;
  // Locate matching product and update cart
}
