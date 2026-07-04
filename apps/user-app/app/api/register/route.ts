import { Prisma, prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import { SignUpSchema } from "@repo/validation-schemas";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();

        const parsed = SignUpSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.errors[0]?.message },
                { status: 400 }
            )
        }

        const { name, email, phoneNumber, password } = parsed.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phoneNumber },
                ],
            },
        });

        if (existingUser) {
            const field = existingUser.email === email ? "Email" : "Phone number";
            return NextResponse.json(
                { message: `${field} already registered.` },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phoneNumber,
                    password: hashedPassword
                }
            });

            await tx.balance.create({
                data: {
                    userId: user.id,
                    amount: 0,
                    locked: 0,
                },
            });
        })

        if (process.env.NODE_ENV === "development") {
            console.log("New user registered:", email);
        }

        return NextResponse.json(
            { message: "User created successfully." },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error during user registration:", error);
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            const target = Array.isArray(error.meta?.target) ? error.meta.target[0] : undefined;
            const field = target === "phoneNumber" ? "Phone number" : "Email";
            return NextResponse.json(
                { message: `${field} already registered.` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}