import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import NextShowBox from "../components/home/NextShowBox";
import MusicPlayer from "../components/home/MusicPlayer";
import LatestVideos from "../components/home/LatestVideos";
import TestimonialSection from "../components/home/TestimonialSection";
import PollSection from "../components/home/PollSection";
import CTASection from "../components/home/CTASection";

export default function Home() {
  const { data: allEvents = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.list(),
  });

  const { data: latestVideos = [] } = useQuery({
    queryKey: ["latestVideos"],
    queryFn: () => base44.entities.Video.list("-created_date", 3),
  });

  const nextEvent = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return allEvents
      .filter((e) => new Date(e.date) >= now && e.status !== "past")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [allEvents]);

  return (
    <div>
      <HeroSection />
      {nextEvent && <NextShowBox event={nextEvent} />}
      <MusicPlayer />
      <LatestVideos videos={latestVideos} />
      <TestimonialSection />
      <PollSection />
      <CTASection />
    </div>
  );
}