import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(request) {
    try {
        const { ip } = await request.json();

        // 🔴 VULNERABLE: Command injection possible
        const command = `ping -n 4 ${ip}`;

        console.log('🔴 Executing:', command);

        // Wrap exec in a Promise so Next.js can await it
        const output = await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve(stderr || error.message);
                } else {
                    resolve(stdout);
                }
            });
        });

        return NextResponse.json({ output });

    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}