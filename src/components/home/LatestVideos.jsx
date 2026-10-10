import React from "react";
import { Card } from "@/components/ui/card";
import { Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LatestVideos({ videos = [] }) {
  const extractYoutubeId = (url) => {
    if (!url) return '';
    if (url.length === 11 && !url.includes('http')) return url;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const getVideoSource = (video) => {
    if (video.video_type === 'youtube') {
      const id = video.youtube_id || extractYoutubeId(video.video_url || '');
      return extractYoutubeId(id);
    }
    return video.video_url;
  };

  const getThumbnail = (video) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    if (video.video_type === 'youtube' || video.youtube_id) {
      const youtubeId = getVideoSource(video);
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return null;
  };

  const visibleVideos = videos.filter(v => v.visible !== false);
  const displayVideos = visibleVideos.slice(0, 3);

  if (displayVideos.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Últimos Vídeos
          </h2>
          <p className="text-[#D4C5B9] text-lg">
            Confira nossos clipes mais recentes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {displayVideos.map((video) => {
            const videoSource = getVideoSource(video);
            const thumbnail = getThumbnail(video);
            const youtubeUrl = video.video_type === 'youtube' 
              ? `https://www.youtube.com/watch?v=${videoSource}`
              : video.video_url;
            
            return (
              <Card
                key={video.id}
                className="bg-[#1A1A1A] border-[#8B6F47]/30 overflow-hidden group cursor-pointer hover:border-[#F4231E] transition-all"
                onClick={() => window.open(youtubeUrl, "_blank")}
              >
                <div className="relative aspect-video overflow-hidden">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#F4231E] rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  {video.views && (
                    <div className="flex items-center gap-2 text-[#D4C5B9] text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{video.views} visualizações</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to={createPageUrl("Videos")}
            className="text-[#F4231E] hover:text-[#e41914] font-semibold transition-colors"
          >
            Ver todos os vídeos →
          </Link>
        </div>
      </div>
    </section>
  );
}