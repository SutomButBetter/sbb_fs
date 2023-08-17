// User
const userWithAccounts = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: { accounts: true, sessions: true },
});
type UserWithAccounts = Prisma.UserGetPayload<typeof userWithAccounts>;

// Game
const gameWithAttempts = Prisma.validator<Prisma.GameDefaultArgs>()({
	include: { attempts: true },
});
type GameWithAttempts = Prisma.GameGetPayload<typeof gameWithAttempts>;

// GameAttempt
const attemptWithGame = Prisma.validator<Prisma.GameAttempt>()({
	include: { game: true },
});
type AttemptWithGame = Prisma.GameGetPayload<typeof attemptWithGame>;
