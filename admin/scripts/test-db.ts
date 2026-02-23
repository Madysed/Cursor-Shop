import prisma from '../src/lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');

    // Create admin user
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    const hashedPassword = await hash(password, 12);

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    let user;
    if (existingUser) {
      // Update through Account model if password needs to be updated
      user = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          // Password is handled in a different way, possibly through accounts
        }
      });
      
      console.log('Admin user updated:', {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: 'Admin User',
          role: 'ADMIN',
          // For new user, create with proper authentication mechanism
          // This depends on your auth scheme - NextAuth, etc.
        }
      });
      
      console.log('Admin user created:', {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }

    // Test query
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 