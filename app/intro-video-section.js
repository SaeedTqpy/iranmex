import {getIntroVideo} from '../lib/server/intro-video-store.mjs';
import IntroVideo from './intro-video';

export default function IntroVideoSection({locale='fa'}){
  const {video}=getIntroVideo();
  if(!video)return null;
  const title=locale==='en'?'Exhibition introduction video':locale==='ar'?'فيلم تعريفي بالمعرض':'فیلم معرفی نمایشگاه';
  return <div data-reveal className="event-video"><h2 id="event-video-title">{title}</h2><IntroVideo key={video.id} locale={locale} src={video.src}/></div>;
}
