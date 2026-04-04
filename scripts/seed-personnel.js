const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/hms";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const members = db.collection('members');
        const depts = db.collection('departments');

        const adminDept = await depts.findOneAndUpdate(
            { name: "Administration" },
            { $setOnInsert: { description: "System administrators" } },
            { upsert: true, returnDocument: 'after' }
        );

        const culinaryDept = await depts.findOneAndUpdate(
            { name: "Culinary & Banquets" },
            { $setOnInsert: { description: "Fine dining" } },
            { upsert: true, returnDocument: 'after' }
        );

        const guestServicesDept = await depts.findOneAndUpdate(
            { name: "Guest Services" },
            { $setOnInsert: { description: "Front desk" } },
            { upsert: true, returnDocument: 'after' }
        );

        const passwordHash = await bcrypt.hash("changeme", 10);

        const users = [
            { email: "gm@hotel.local", name: "Thomas Miller", role: "General Manager", accessRole: "ADMIN", departmentId: adminDept._id || adminDept.value._id },
            { email: "head.culinarybanquets@hotel.local", name: "Chef Elena Rodriguez", role: "Executive Chef", accessRole: "DEPT_HEAD", departmentId: culinaryDept._id || culinaryDept.value._id },
            { email: "staff.bellman@hotel.local", name: "James Wilson", role: "Bell Captain", accessRole: "STAFF", departmentId: guestServicesDept._id || guestServicesDept.value._id },
            { email: "admin@hotel.local", name: "General Admin", role: "Administrator", accessRole: "ADMIN", departmentId: adminDept._id || adminDept.value._id }
        ];

        for (const user of users) {
            await members.updateOne(
                { email: user.email },
                { $set: { ...user, passwordHash, portalToken: Math.random().toString(36).substring(7) } },
                { upsert: true }
            );
            console.log(`Synced: ${user.email}`);
        }

    } finally {
        await client.close();
    }
}

main();
