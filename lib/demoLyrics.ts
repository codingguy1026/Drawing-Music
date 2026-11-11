/** Original demo listening captions (not a recording or transcription).
 * The synthesized demo melodies contain no vocals.
 * Cue times are in track-local seconds.
 */
export type LyricCue = Readonly<{start:number;end:number;text:string}>;
const cues:Readonly<Record<string,readonly LyricCue[]>>={
 afterglow:[
  {start:0,end:17,text:"빛이 접힌 창가에 작은 하루가 남아"},
  {start:17,end:35,text:"어제의 물결은 천천히 멀어지고"},
  {start:35,end:54,text:"너울진 밤의 끝에서 색을 다시 골라"},
  {start:54,end:73,text:"아무 말 없이도 이어지는 선율"},
  {start:73,end:102,text:"오늘의 마지막 빛을 오래 기억해"},
 ],
 paperplanets:[
  {start:0,end:24,text:"종이 위에 작은 행성을 접어"},
  {start:24,end:48,text:"책상 끝에서 별빛을 기다려"},
  {start:48,end:73,text:"흩어진 생각에 동그라미 하나"},
  {start:73,end:98,text:"페이지 너머로 조용히 날아가"},
  {start:98,end:128,text:"우리만의 우주를 다시 펼쳐"},
 ],
};
export function getDemoLyrics(trackId:string):readonly LyricCue[]{
 return cues[trackId]??[];
}
export function currentLyricIndex(items:readonly LyricCue[],seconds:number):number{
 return items.findIndex(c=>seconds>=c.start&&seconds<c.end);
}
