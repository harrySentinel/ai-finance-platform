"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId},
        });

        if(!user) {
            throw new Error("User not found");
        }

        // Convert balance to float before saving
        const balanceFloat = parseFloat(data.balance)
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance amount")
        }

        // check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where: { userId: user.id},
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        
    } catch(error) {

    }
}