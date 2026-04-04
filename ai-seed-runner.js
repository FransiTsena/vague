async function seedDatabase() {
  console.log("Seeding database via API...");
  try {
    const response = await fetch("http://localhost:3000/api/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestCount: 50,
        roomCount: 20,
        bookingCount: 100,
        calendarCount: 90,
        galleryCount: 8,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("✅ Success:", data.message);
      if (data.seeded) {
        console.log("Seeded counts:", data.seeded);
      }
    } else {
      console.log("❌ Failed:", data.error);
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
    console.log("Note: Ensure the Next.js dev server is running on http://localhost:3000");
  }
}

seedDatabase();
