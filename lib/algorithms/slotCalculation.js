// lib/algorithms/slotCalculation.js
export const getAvailableSlotsFor30Days = async (registrationDate) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Query interviewSlots where date is between today and +30 days
  const slotsQuery = query(
    collection(db, 'interviewSlots'),
    where('interviewDate', '>=', today),
    where('interviewDate', '<=', thirtyDaysLater),
    orderBy('interviewDate', 'asc')
  );
  
  const slots = await getDocs(slotsQuery);
  
  return slots.docs.map(doc => ({
    id: doc.id,
    date: doc.data().interviewDate.toDate(),
    available: doc.data().filledCount < doc.data().capacity,
    filledSlots: doc.data().filledCount,
    capacity: doc.data().capacity,
  }));
};