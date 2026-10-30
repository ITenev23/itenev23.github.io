import type { EducationInput, RoleInput } from "./schema";

// Earlier jobs, newest first. Like the projects, they carry no dates.
export const roles: RoleInput[] = [
  {
    title: "Software Engineer",
    company: "Codexio",
    location: "Sofia",
    href: "https://www.codexio.bg/",
    summary:
      "Contractor in mid-level to senior positions at client companies, building complex features: search for a social travel app, microservices for a virtualization software company, a Flutter app. Started as an intern on a microservice ERP.",
    projects: ["codexio-consulting", "codexio-internship"],
  },
  {
    title: "Sales Specialist",
    company: "Agroconsult Engineering",
    location: "Stara Zagora",
    href: "http://agroconsulteng.com/",
    summary:
      "Grew from machine technician to manager of a team of five; it sharpened my communication skills.",
    highlights: [
      "Managed contracts with transport companies, and the documents and timing that kept deliveries on schedule",
      "Deliveries from Bulgaria to Greece, Romania and other countries, and to Russia from time to time",
      "Responsible for the company's expensive machines: travelled across Bulgaria to repair them on site",
    ],
  },
  {
    title: "Three seasons of work and travel",
    company: "J-1 visa",
    location: "USA",
    summary:
      "Worked in restaurants, pubs and clubs as a janitor, busser, dishwasher, cook and security.",
    highlights: [
      "Promoted from dishwasher to second cook at one of the best steakhouses in Cody, Wyoming: the second of four cooking stations, with the first kept for the bosses and the longest-serving cooks",
      "Worked alongside people from all over the world, and learned to understand their cultures",
      "Travelled to Yellowstone, Alaska, California (San Francisco and Los Angeles), Minnesota, New York and Miami",
    ],
    cv: false,
  },
];

export const education: EducationInput[] = [
  {
    degree: "Bachelor's degree, Business Economics",
    school: "Trakia University",
    location: "Stara Zagora",
    href: "http://uni-sz.bg/engl/",
    note: "Grade 6.00 / 6.00",
  },
  {
    degree: "Master's-level courses",
    school: "Massachusetts Institute of Technology (MIT)",
  },
  {
    degree: "Software engineering, Java track",
    school: "Software University (SoftUni)",
    location: "Sofia",
    href: "https://softuni.bg/",
    note: "Among the top 3 students at the time",
    highlights: [
      "One of the most active students, and offered a teaching-assistant role",
      "Got an internship at Codexio while still in the Fundamentals course, and chose it over the assistant role for an earlier start in real work",
    ],
  },
  {
    degree: "Courses",
    school: "Telerik Academy",
    href: "https://www.telerikacademy.com/",
    highlights: [
      "Studied a lot on its learning platform, and attended many of its courses and conferences",
      "When Telerik Academy and SoftUni opened all their courses to students, went well beyond my own curriculum; it showed in my SoftUni ranking",
    ],
  },
  {
    degree: "Conferences and meetups",
    school: "jPrime · DEV.BG All in One · BG JUG",
    highlights: [
      "jPrime and DEV.BG All in One almost every year, Bulgarian Java User Group (BG JUG) meetups, and many other events when time allows",
      "As a junior, went to software events to learn, meet engineers and ask their opinion on problems from my work, the internship included",
    ],
    cv: false,
  },
];
