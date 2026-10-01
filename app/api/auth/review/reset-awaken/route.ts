import { NextResponse } from 'next/server';
import { requireActor } from '../../../../../server/auth/require-actor';
import { isSameOriginRequest } from '../../../../../server/http/same-origin';
import { runReviewReset, ReviewResetRefused } from '../../../../../server/services/review-awaken-reset.mjs';

const origin = 'https://rts-app-review-git-review-deep-dive-teerex1066-7016.vercel.app';
const headers = { 'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store',
  'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'" };
function html(content:string) {
  return new NextResponse(`<!doctype html><html><body style="font:18px system-ui;padding:40px;max-width:700px">${content}</body></html>`,{headers});
}
function allowed(request:Request) {return new URL(request.url).hostname === new URL(origin).hostname;}
function failure(error:unknown) {
  // Only the command's own constant safe messages may be returned. Never return pg/Auth error bodies.
  return NextResponse.json({kind:'reset_not_confirmed',reason:error instanceof ReviewResetRefused?error.message:'Unable to complete reset. No success was confirmed.'},{status:409,headers:{'Cache-Control':'no-store'}});
}
export async function GET(request:Request) {
  if(!allowed(request))return new NextResponse(null,{status:404});
  try {
    const actor=await requireActor();
    const result=await runReviewReset(actor,process.env,false);
    return html(`<h1>Start Awaken fresh</h1><p>This clears only this authenticated review account’s four Awaken lessons and their saved reflections.</p><p>Dry run: ${result.progress} progress rows and ${result.reflections} saved reflections.</p><form method="post"><button style="font:inherit;padding:12px">Clear my four Awaken lessons</button></form>`);
  }catch(error){return failure(error);}
}
export async function POST(request:Request) {
  if(!allowed(request)||!isSameOriginRequest(request))return new NextResponse(null,{status:403});
  try {
    const actor=await requireActor();
    const result=await runReviewReset(actor,process.env,true);
    return html(`<h1>Awaken is clear</h1><p>All four Awaken lessons now have no saved progress or reflections.</p><p>Removed ${result.progress} progress rows and ${result.reflections} reflections. Your account and other curriculum data remain in place.</p><p><a href="/deep-dive/awaken/pay-attention">Start from the beginning</a></p>`);
  }catch(error){return failure(error);}
}
