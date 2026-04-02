require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleCourses = [
  {
    title: 'Full-Stack JavaScript Foundations',
    slug: 'full-stack-javascript-foundations',
    description: 'Build production-ready APIs and React frontends with modern JavaScript patterns.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1700000001/learnhub/js-foundations.jpg',
    price: 49900,
    lessons: [
      { title: 'Course Orientation and Setup', description: 'Get your local environment and repository workflow ready.', duration: 640, order: 1, isFree: true },
      { title: 'Node Runtime Deep Dive', description: 'Understand the event loop, modules, and process lifecycle.', duration: 910, order: 2, isFree: true },
      { title: 'Express Architecture', description: 'Design scalable route, controller, and service layers.', duration: 1020, order: 3, isFree: false },
      { title: 'Prisma Data Modeling', description: 'Create robust schemas, constraints, and migration plans.', duration: 980, order: 4, isFree: false },
      { title: 'Authentication and Session Security', description: 'Implement JWT flows and secure cookie strategies.', duration: 1140, order: 5, isFree: false },
      { title: 'Validation and Error Boundaries', description: 'Build consistent request validation and error handling.', duration: 860, order: 6, isFree: false },
      { title: 'Deployment and Runtime Hardening', description: 'Ship resilient services with production readiness checks.', duration: 890, order: 7, isFree: false }
    ]
  },
  {
    title: 'React UI Engineering Masterclass',
    slug: 'react-ui-engineering-masterclass',
    description: 'Create polished, maintainable interfaces using React, hooks, and query patterns.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1700000002/learnhub/react-ui.jpg',
    price: 54900,
    lessons: [
      { title: 'Interface Systems and Information Hierarchy', description: 'Plan clear user journeys and robust component boundaries.', duration: 720, order: 1, isFree: true },
      { title: 'State, Effects, and Derived Data', description: 'Use hooks effectively while avoiding stale state pitfalls.', duration: 940, order: 2, isFree: true },
      { title: 'Server State with React Query', description: 'Model async caching, retries, and loading states correctly.', duration: 1020, order: 3, isFree: false },
      { title: 'Form Workflows with React Hook Form', description: 'Build reliable forms with validation and ergonomic APIs.', duration: 880, order: 4, isFree: false },
      { title: 'Routing and Layout Composition', description: 'Compose nested routes and protected shells cleanly.', duration: 830, order: 5, isFree: false },
      { title: 'Accessible Components', description: 'Apply semantics, keyboard support, and focus management.', duration: 760, order: 6, isFree: false },
      { title: 'Performance Tuning in React', description: 'Measure and optimize renders, bundles, and critical paths.', duration: 850, order: 7, isFree: false },
      { title: 'Production Build and Monitoring Basics', description: 'Ship stable builds and add practical observability hooks.', duration: 790, order: 8, isFree: false }
    ]
  },
  {
    title: 'Practical Database Design with Prisma',
    slug: 'practical-database-design-prisma',
    description: 'Model relational systems, soft-delete patterns, and transaction-safe workflows.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1700000003/learnhub/prisma-db.jpg',
    price: 59900,
    lessons: [
      { title: 'Relational Modeling Essentials', description: 'Map entities, constraints, and ownership relationships.', duration: 780, order: 1, isFree: true },
      { title: 'Indexing for Real Query Patterns', description: 'Design indexes around read and write workloads.', duration: 910, order: 2, isFree: true },
      { title: 'Migrations and Drift Control', description: 'Keep migration history safe across teams and environments.', duration: 840, order: 3, isFree: false },
      { title: 'Soft Delete and Data Lifecycle', description: 'Implement reversible deletion strategies in production.', duration: 800, order: 4, isFree: false },
      { title: 'Transactions and Concurrency Handling', description: 'Prevent race conditions in multi-user purchase flows.', duration: 970, order: 5, isFree: false },
      { title: 'Prisma Query Optimization', description: 'Use include/select patterns and reduce round trips.', duration: 860, order: 6, isFree: false },
      { title: 'Seeding and Environment Parity', description: 'Build repeatable, idempotent seed scripts for teams.', duration: 740, order: 7, isFree: false }
    ]
  },
  {
    title: 'Authentication and Account Security',
    slug: 'authentication-account-security',
    description: 'Implement robust login, verification, OTP, and account recovery flows.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1700000004/learnhub/auth-security.jpg',
    price: 44900,
    lessons: [
      { title: 'Security Foundations for Web Apps', description: 'Understand common attack vectors and baseline controls.', duration: 700, order: 1, isFree: true },
      { title: 'Email Verification with OTP', description: 'Design secure OTP lifecycle and anti-bruteforce checks.', duration: 890, order: 2, isFree: true },
      { title: 'Password Storage and Rotation', description: 'Apply hashing, peppering, and credential hygiene patterns.', duration: 820, order: 3, isFree: false },
      { title: 'JWT Access and Refresh Strategy', description: 'Balance token lifetime, revocation, and UX tradeoffs.', duration: 940, order: 4, isFree: false },
      { title: 'Session Invalidation and Logout', description: 'Handle compromised tokens and logout across devices.', duration: 760, order: 5, isFree: false },
      { title: 'Rate Limiting and Abuse Detection', description: 'Throttle risky endpoints and capture suspicious patterns.', duration: 800, order: 6, isFree: false },
      { title: 'Audit Trails for Auth Events', description: 'Record and query auth events for compliance and support.', duration: 730, order: 7, isFree: false },
      { title: 'Account Recovery and Support Flows', description: 'Build safe recovery UX without leaking sensitive data.', duration: 790, order: 8, isFree: false },
      { title: 'Security Checklist Before Launch', description: 'Validate configuration and response plans before go-live.', duration: 650, order: 9, isFree: false }
    ]
  },
  {
    title: 'Learning Platform Backend Architecture',
    slug: 'learning-platform-backend-architecture',
    description: 'Design resilient APIs for courses, lessons, access control, and reporting.',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1700000005/learnhub/lms-backend.jpg',
    price: 64900,
    lessons: [
      { title: 'LMS Domain Modeling', description: 'Translate business rules into normalized backend structures.', duration: 760, order: 1, isFree: true },
      { title: 'Route Design and Versioning', description: 'Create maintainable API surfaces and routing strategy.', duration: 840, order: 2, isFree: true },
      { title: 'Course and Lesson Lifecycle', description: 'Handle draft, publish, and archival workflows safely.', duration: 930, order: 3, isFree: false },
      { title: 'Purchase and Access Gate Logic', description: 'Wire payment outcomes to course entitlement records.', duration: 980, order: 4, isFree: false },
      { title: 'Progress Tracking at Scale', description: 'Store and query lesson progress efficiently.', duration: 860, order: 5, isFree: false },
      { title: 'Background Jobs and Notifications', description: 'Offload email and media tasks from request threads.', duration: 810, order: 6, isFree: false },
      { title: 'Observability and Incident Readiness', description: 'Build logging, metrics, and practical alerting signals.', duration: 770, order: 7, isFree: false },
      { title: 'Data Export and Admin Workflows', description: 'Support operational tooling with secure admin endpoints.', duration: 790, order: 8, isFree: false },
      { title: 'Launch Hardening and Rollback Strategy', description: 'Prepare a safe production rollout and rollback checklist.', duration: 720, order: 9, isFree: false },
      { title: 'Post-Launch Stability Review', description: 'Run early feedback loops and reliability improvements.', duration: 680, order: 10, isFree: false }
    ]
  }
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail || !adminPassword || !adminName) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME are required.');
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isVerified: true,
      deletedAt: null
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: adminName,
      role: Role.ADMIN,
      isVerified: true
    }
  });

  console.log('\u2713 Admin seeded');

  for (const courseData of sampleCourses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        description: courseData.description,
        thumbnailUrl: courseData.thumbnailUrl,
        price: courseData.price,
        isPublished: true,
        instructorId: admin.id,
        deletedAt: null
      },
      create: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        thumbnailUrl: courseData.thumbnailUrl,
        price: courseData.price,
        isPublished: true,
        instructorId: admin.id
      }
    });

    let lessonCount = 0;

    for (const lessonData of courseData.lessons) {
      const existingLesson = await prisma.lesson.findFirst({
        where: {
          courseId: course.id,
          order: lessonData.order
        }
      });

      if (existingLesson) {
        await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            title: lessonData.title,
            description: lessonData.description,
            videoUrl: 'pending-upload',
            duration: lessonData.duration,
            order: lessonData.order,
            isFree: lessonData.isFree,
            deletedAt: null
          }
        });
      } else {
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: lessonData.title,
            description: lessonData.description,
            videoUrl: 'pending-upload',
            duration: lessonData.duration,
            order: lessonData.order,
            isFree: lessonData.isFree
          }
        });
      }

      lessonCount += 1;
    }

    console.log(`\u2713 Course upserted: ${course.title}`);
    console.log(`  \u2514\u2500 ${lessonCount} lessons seeded`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });