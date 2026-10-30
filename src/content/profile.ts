import type { Profile } from "./schema";

export const profile: Profile = {
  name: "Ivaylo Tenev",
  headline: "Senior Software Engineer",
  tagline: "takes the red pill on every bug",
  location: "Bulgaria",
  pitch:
    "I build backend systems that integrate with many external parties, and keep them correct when those parties fail.",
  intro:
    "I build backends that talk to lots of other systems, and keep their cool when those systems don't.",
  invite: "Got systems that don't get along? Let's talk.",
  yearsOfExperience: 8,
  // No GitHub link: the site's own address (itenev23.github.io) already carries it.
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/itenev/" },
    { label: "Facebook", href: "https://www.facebook.com/ivailo.tenev", cv: false },
    { label: "Instagram", href: "https://www.instagram.com/itenev23", cv: false },
  ],
  notes: [
    "Mentored engineers from junior to senior level, including a group of 10 for Paysafe.",
    "The projects here are the main ones; I've delivered many more over the years.",
    "Took part in hackathons, building all kinds of things, mostly games.",
  ],
};
