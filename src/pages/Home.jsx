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
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => base44.entities.Event.filter({ status: "upcoming" }, "date", 1),
  });

  const { data: latestVideos = [] } = useQuery({
    queryKey: ["latestVideos"],
    queryFn: () => base44.entities.Video.list("-created_date", 3),
  });

  const nextEvent = upcomingEvents[0];

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