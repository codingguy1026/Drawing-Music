export const MUSIC_VIEWS = ["home","albums","mixes","for-you","discover","library","visualizer","connection"] as const;
export type MusicView = typeof MUSIC_VIEWS[number];
export const MUSIC_INFO:Record<MusicView,{title:string;subtitle:string}>={
 home:{title:"홈",subtitle:"당신의 하루에 음악으로 색을 칠해요."},
 albums:{title:"앨범 컬렉션",subtitle:"앨범 전체를 탐색하고 감상해 보세요."},
 mixes:{title:"오늘의 믹스",subtitle:"기분에 맞는 세 곡을 이어서 들어보세요."},
 "for-you":{title:"취향 스튜디오",subtitle:"2025년의 추천 실험과 새로운 드뮤직을 연결해요."},
 discover:{title:"음악 탐색",subtitle:"데모곡을 검색하고 새로운 음악을 발견해요."},
 library:{title:"내 보관함",subtitle:"좋아하는 곡과 플레이리스트를 정리해요."},
 visualizer:{title:"사운드 시각화",subtitle:"음표를 색과 리듬으로 만나보세요."},
 connection:{title:"Drawing 연결",subtitle:"Drawing 생태계와의 연동을 준비 중이에요."}
};
export const musicHref=(view:MusicView)=>"#/"+view;
export function musicViewFromHash(hash:string):MusicView{
 const token=hash.replace(/^#\/?/,"").split(/[?&]/)[0];
 const key=token==="collection"?"albums":token;
 return (MUSIC_VIEWS as readonly string[]).includes(key)?key as MusicView:"home";
}
