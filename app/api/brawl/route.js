import {createRoomService,SupabaseRoomStore} from '../../../lib/brawl/rooms.mjs';
import data from '../../../lib/brawl/data.json';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
async function handle(request){
  const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!process.env.SUPABASE_URL||!key)return Response.json({error:'Online rooms are temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});
  return createRoomService({data,store:new SupabaseRoomStore({url:process.env.SUPABASE_URL,key})}).handle(request);
}
export const GET=handle;
export const POST=handle;
