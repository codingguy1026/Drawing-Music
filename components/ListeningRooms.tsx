"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {createBrowserClient} from "@supabase/ssr";
import {Headphones,Plus,RefreshCw,Users,X} from "lucide-react";
import {publicAuthConfig} from "../lib/publicAuthConfig";
import {DEMO_TRACKS,type DemoTrack} from "../lib/demoTracks";

const db=publicAuthConfig?createBrowserClient(publicAuthConfig.url,publicAuthConfig.publishableKey):null;
type Room={
 id:string;host_id:string;title:string;track_id:string;
 position_seconds:number;playing:boolean;active:boolean;updated_at:string;
};
type Member={room_id:string;user_id:string;joined_at:string};
export type RoomPlayback={trackId:string;position:number;playing:boolean};
type Props={track:DemoTrack;progress:number;playing:boolean;onRemotePlayback:(state:RoomPlayback)=>void};

const MAX_SYNC_DRIFT=5;
function livePosition(room:Room):number{
 const elapsed=room.playing?Math.min(MAX_SYNC_DRIFT,Math.max(0,(Date.now()-new Date(room.updated_at).getTime())/1000)):0;
 const track=DEMO_TRACKS.find(t=>t.id===room.track_id);
 return Math.max(0,Math.min(track?.duration??0,Number(room.position_seconds)+elapsed));
}

export default function ListeningRooms({track,progress,playing,onRemotePlayback}:Props){
 const [userId,setUserId]=useState<string|null>(null);
 const [rooms,setRooms]=useState<Room[]>([]);
 const [current,setCurrent]=useState<Room|null>(null);
 const [members,setMembers]=useState<Member[]>([]);
 const [title,setTitle]=useState("우리의 음악 방");
 const [consent,setConsent]=useState(false);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const latest=useRef({track,progress,playing});
 latest.current={track,progress,playing};

 useEffect(()=>{
  if(!db)return;
  let active=true;
  void db.auth.getUser().then(({data,error})=>{if(active)setUserId(error?null:data.user?.id??null);}).catch(()=>{if(active)setUserId(null)});
  const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{
   if(!active)return;
   setUserId(session?.user?.id??null);
   if(!session){setCurrent(null);setRooms([]);}
  });
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 const refresh=useCallback(async()=>{
  if(!db||!userId)return;
  const {data,error}=await db.from("dm_listening_rooms").select("id,host_id,title,track_id,position_seconds,playing,active,updated_at")
   .eq("active",true).order("updated_at",{ascending:false}).limit(20);
  if(error){setMessage("음악 방이 아직 준비되지 않았어요. 관리자에게 서버 설정을 확인해 달라고 해주세요.");return;}
  setRooms((data??[]) as Room[]);
 },[userId]);
 useEffect(()=>{void refresh()},[refresh]);

 const join=async(room:Room)=>{
  if(!db||!userId||!consent||busy)return;
  setBusy(true);setMessage("");
  try{
   const {error}=await db.from("dm_room_members").insert({room_id:room.id,user_id:userId,consent_at:new Date().toISOString()});
   if(error&&error.code!=="23505")throw error;
   setCurrent(room);setConsent(false);
   setMessage("이 방의 재생 상태를 내 기기에서 동기화해요. 언제든 나갈 수 있어요.");
  }catch{setMessage("방에 참여하지 못했어요. 로그인 상태나 서버 설정을 확인해 주세요.");}
  finally{setBusy(false);}
 };
 const create=async()=>{
  if(!db||!userId||!consent||busy)return;
  const name=title.trim().slice(0,50);
  if(!name)return;
  setBusy(true);setMessage("");
  try{
   const {data,error}=await db.from("dm_listening_rooms").insert({
    host_id:userId,title:name,track_id:latest.current.track.id,position_seconds:latest.current.progress,playing:latest.current.playing
   }).select("*").single();
   if(error||!data)throw error??new Error("Unable to create room");
   const room=data as Room;
   const result=await db.from("dm_room_members").insert({room_id:room.id,user_id:userId,consent_at:new Date().toISOString()});
   if(result.error)throw result.error;
   setCurrent(room);setConsent(false);
   setMessage("방을 만들었어요. 이제 이 브라우저에서 재생하면 참가자와 동기화돼요.");
   void refresh();
  }catch{setMessage("방을 만들지 못했어요. 로그인 상태나 서버 설정을 확인해 주세요.");}
  finally{setBusy(false);}
 };
 const leave=async()=>{
  if(!db||!userId||!current||busy)return;
  setBusy(true);
  try{
   if(current.host_id===userId){
    const {error}=await db.from("dm_listening_rooms").update({active:false,playing:false}).eq("id",current.id);
    if(error)throw error;
   }
   const {error}=await db.from("dm_room_members").delete().eq("room_id",current.id).eq("user_id",userId);
   if(error)throw error;
   setCurrent(null);setMembers([]);setMessage("방에서 나왔어요.");void refresh();
  }catch{setMessage("방에서 나가지 못했어요. 다시 시도해 주세요.");}
  finally{setBusy(false);}
 };

 // The host publishes only original-demo playback metadata, never audio files.
 useEffect(()=>{
  if(!db||!current||!userId||current.host_id!==userId)return;
  const publish=async()=>{
   const state=latest.current;
   const {error}=await db.from("dm_listening_rooms").update({
    track_id:state.track.id,position_seconds:state.progress,playing:state.playing,
    updated_at:new Date().toISOString()
   }).eq("id",current.id).eq("host_id",userId).eq("active",true);
   if(error)setMessage("방 재생 상태를 공유하지 못했어요.");
  };
  void publish();
  const timer=window.setInterval(()=>{void publish()},2000);
  return()=>window.clearInterval(timer);
 },[current?.id,current?.host_id,userId]);

 // Guests explicitly opt into the room; synchronize their own locally synthesized demo.
 useEffect(()=>{
  if(!db||!current||!userId||current.host_id===userId)return;
  let alive=true;
  const poll=async()=>{
   const {data,error}=await db.from("dm_listening_rooms")
    .select("id,host_id,title,track_id,position_seconds,playing,active,updated_at").eq("id",current.id).maybeSingle();
   if(!alive)return;
   if(error){setMessage("방 재생 상태를 가져오지 못했어요.");return;}
   const room=data as Room|null;
   if(!room||!room.active){setCurrent(null);setMessage("방장이 방을 종료했어요.");return;}
   if(DEMO_TRACKS.some(t=>t.id===room.track_id)){
    onRemotePlayback({trackId:room.track_id,position:livePosition(room),playing:room.playing});
   }
  };
  void poll();
  const timer=window.setInterval(()=>{void poll()},2200);
  return()=>{alive=false;window.clearInterval(timer)};
 },[current?.id,current?.host_id,userId,onRemotePlayback]);

 // The host can moderate participation; only pseudonymous participant IDs appear.
 useEffect(()=>{
  if(!db||!current||current.host_id!==userId)return;
  let alive=true;
  const poll=async()=>{
   const {data}=await db.from("dm_room_members").select("room_id,user_id,joined_at").eq("room_id",current.id).limit(30);
   if(alive)setMembers((data??[]) as Member[]);
  };
  void poll();
  const timer=window.setInterval(()=>{void poll()},5000);
  return()=>{alive=false;window.clearInterval(timer)};
 },[current?.id,current?.host_id,userId]);
 const kick=async(target:string)=>{
  if(!db||!current||!userId||current.host_id!==userId||target===userId)return;
  const {error}=await db.from("dm_room_members").delete().eq("room_id",current.id).eq("user_id",target);
  if(error)setMessage("참가자를 내보내지 못했어요.");
  else setMembers(prev=>prev.filter(m=>m.user_id!==target));
 };
 if(!db)return <p role="status">Drawing ID 연결 설정이 없어 음악 방을 이용할 수 없어요.</p>;
 return <section className="dm-room-shell" aria-label="함께 듣기">
  <header><h2><Users size={21}/> 함께 듣기</h2><p>로그인한 사람이 본인의 기기에서 같은 오리지널 데모곡을 재생해요. 음원 전송이나 사용자 프로필 공개는 하지 않아요.</p></header>
  {!userId?<p className="dm-feedback">참여하려면 먼저 화면 상단의 Drawing ID로 로그인해 주세요.</p>:
   current?<div className="dm-room-current">
    <h3>{current.title}</h3>
    <p>{current.host_id===userId?"내가 방장입니다. 내 재생·일시정지·곡 변경이 참가자에게 전달돼요.":"참가 중입니다. 방장의 재생 상태에 맞춰 내 브라우저가 동기화돼요."}</p>
    <button type="button" onClick={()=>void leave()} disabled={busy}><X size={16}/> {current.host_id===userId?"방 종료":"방 나가기"}</button>
    {current.host_id===userId&&members.length>0&&<div className="dm-room-members"><h4>참가자 관리 ({members.length}명)</h4>
      {members.filter(m=>m.user_id!==userId).map(m=><div key={m.user_id}><span>참가자 {m.user_id.slice(0,6)}</span><button type="button" onClick={()=>void kick(m.user_id)}>내보내기</button></div>)}
    </div>}
   </div>:<>
    <div className="dm-room-create">
     <label>음악 방 이름<input maxLength={50} value={title} onChange={e=>setTitle(e.target.value)}/></label>
     <label className="dm-room-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> 방에 참여할 때 내 계정 ID와 참여 사실이 방장에게 표시되는 것에 동의합니다. 이메일과 음악 감상 기록은 공유하지 않아요.</label>
     <button type="button" disabled={!consent||!title.trim()||busy} onClick={()=>void create()}><Plus size={16}/> 방 만들기</button>
    </div>
    <div className="dm-room-list-head"><h3>열려 있는 방</h3><button type="button" onClick={()=>void refresh()}><RefreshCw size={16}/> 새로고침</button></div>
    {rooms.length?rooms.map(room=><article className="dm-room-item" key={room.id}>
     <span><Headphones size={17}/><strong>{room.title}</strong><small>지금 듣는 곡: {DEMO_TRACKS.find(t=>t.id===room.track_id)?.title??"데모곡"}</small></span>
     <button type="button" disabled={!consent||busy} onClick={()=>void join(room)}>참여</button>
    </article>):<p className="dm-feedback">현재 열려 있는 음악 방이 없어요. 첫 번째 방을 만들어 보세요.</p>}
   </>}
  {message&&<p role="status" className="dm-feedback">{message}</p>}
 </section>;
}
