import type { Credential } from "./schema";

const credly = (id: string) => `https://www.credly.com/badges/${id}`;
const coursera = (id: string) => `https://coursera.org/verify/${id}`;

// Certifications first, then certificates, courses and events. Every entry links to the
// issuer's own verification page where one exists; the source files stay off the site.
export const credentials: Credential[] = [
  {
    name: "Oracle Cloud Infrastructure 2019 Certified Architect Professional",
    issuer: "Oracle",
    kind: "certification",
    year: 2020,
    href: credly("3d03df40-dadd-4991-8503-8ee4f2c7dcec"),
    badge: "/badges/oci-architect-professional.webp",
  },
  {
    name: "Oracle Cloud Infrastructure 2019 Certified Architect Associate",
    issuer: "Oracle",
    kind: "certification",
    year: 2020,
    href: credly("a8610f35-7e4b-4062-9b5a-c0c73053aedc"),
    badge: "/badges/oci-architect-associate.webp",
  },
  {
    name: "Oracle Cloud Infrastructure Developer 2020 Certified Associate",
    issuer: "Oracle",
    kind: "certification",
    year: 2020,
    href: credly("ac565b38-d863-49a4-af64-e6fb8c1f5a2f"),
    badge: "/badges/oci-developer-associate.webp",
  },
  {
    name: "Oracle Autonomous Database Cloud 2019 Certified Specialist",
    issuer: "Oracle",
    kind: "certification",
    year: 2020,
    href: credly("1944722a-3495-4776-ae4d-19e3b4d04177"),
    badge: "/badges/oracle-autonomous-database.webp",
  },
  {
    name: "Google IT Support Professional Certificate",
    issuer: "Google · Coursera",
    kind: "certificate",
    year: 2020,
    href: "https://coursera.org/verify/professional-cert/33USWBH4FH2Y",
    note: "5 courses: support, networking, operating systems, system administration, IT security",
    parts: [
      { name: "Technical Support Fundamentals", href: coursera("Q9R9YDE886ZK") },
      { name: "The Bits and Bytes of Computer Networking", href: coursera("UMGSS7EK2ZW5") },
      { name: "Operating Systems and You: Becoming a Power User", href: coursera("G9FU8LUZJ2PP") },
      {
        name: "System Administration and IT Infrastructure Services",
        href: coursera("YAX74R25KTXJ"),
      },
      {
        name: "IT Security: Defense against the digital dark arts",
        href: coursera("6V3Q62KRANL8"),
      },
    ],
  },
  {
    name: "Java Advanced",
    issuer: "Software University (SoftUni)",
    kind: "course",
    year: 2019,
    href: "https://softuni.bg/Certificates/Details/68031/9f65d3f4",
    note: "Grade 6.00 / 6.00",
  },
  {
    name: "Java OOP",
    issuer: "Software University (SoftUni)",
    kind: "course",
    year: 2019,
    href: "https://softuni.bg/Certificates/Details/69509/b0411ce4",
    note: "Grade 6.00 / 6.00",
  },
  {
    name: "Java Programming: Solving Problems with Software",
    issuer: "Duke University · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("N7Y8RMET4BRE"),
  },
  {
    name: "Programming Foundations with JavaScript, HTML and CSS",
    issuer: "Duke University · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("D9Y58LQGEG3Q"),
  },
  {
    name: "Google Cloud IAM and Networking for AWS Professionals",
    issuer: "Google Cloud · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("VM9MHXT9DVCQ"),
  },
  {
    name: "Introduction to Cloud Identity",
    issuer: "Google Cloud · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("9BRYWC8DF6BW"),
  },
  {
    name: "Managing Machine Learning Projects with Google Cloud",
    issuer: "Google Cloud · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("EYA4G8DUG9YE"),
  },
  {
    name: "Building Conversational Experiences with Dialogflow",
    issuer: "Google Cloud · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("SMZ6QKYEDCFN"),
  },
  {
    name: "Industrial IoT on Google Cloud",
    issuer: "Google Cloud · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("CT5XCHE7QZYF"),
  },
  {
    name: "Getting Started with AWS Machine Learning",
    issuer: "Amazon Web Services · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("T863WYAZDE3M"),
  },
  {
    name: "SQL",
    issuer: "365 Data Science",
    kind: "course",
    year: 2020,
  },
  {
    name: "Chinese for Beginners",
    issuer: "Peking University · Coursera",
    kind: "course",
    year: 2020,
    href: coursera("R62AK2XQQNU6"),
  },
  {
    name: "Worldwide Software Architecture Summit '23",
    issuer: "Geekle",
    kind: "event",
    year: 2023,
    note: "Attendee",
  },
];
