/**
 * Promote an existing account to the operator (admin) role.
 * Usage (from the repo root):  npm run make-admin --workspace server -- you@example.com
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-admin --workspace server -- <email>');
    process.exitCode = 1;
    return;
  }

  await connectDatabase();
  try {
    const user = await UserModel.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) {
      console.error(`No account found for ${email}. Register it on the site first.`);
      process.exitCode = 1;
      return;
    }
    console.log(`${user.email} is now an admin. Sign out and back in to refresh the session.`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
