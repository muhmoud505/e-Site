import { NextResponse } from "next/server";import {exec}from 'child_process';
export async function POST(request){
    try {
        const {ip}=await request.json();
                // 🔴 DELIBERATELY VULNERABLE - Command injection!
                const command=`ping -c 4 ${ip}`;
                console.log('🔴 Executing:', command);
                exec(command,(error,stdout,stderr)=>{
                    if(error){
                        return NextResponse.json({
                            output:stderr || error.message
                        }, {status:400});
                    }
                    return NextResponse.json({
                        output:stdout
                    }, {status:200});
                })
        
    } catch (error) {
        return NextResponse.json({message:"Error pinging"}, {status:500})
    }
}