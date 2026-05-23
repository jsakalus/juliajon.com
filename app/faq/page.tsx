const faqs = [
  {
    category: "The Basics",
    accent: "bg-sage",
    questions: [
      { q: "When and where is the wedding?", a: "Saturday, May 29, 2027. The ceremony will be held at Riverside Park in Canmore, Alberta, followed by a reception at The Bear and Bison Inn." },
      { q: "What time does the ceremony start?", a: "Time TBD — check back closer to the date." },
      { q: "When do I need to RSVP by?", a: "Please RSVP by March 1, 2027." },
    ],
  },
  {
    category: "Dress Code",
    accent: "bg-mauve",
    questions: [
      { q: "What is the dress code?", a: "TBD — details to follow." },
      { q: "Any tips for dressing for the mountains?", a: "Late May in Canmore can be unpredictable — we recommend layers and comfortable shoes, especially for the outdoor ceremony. More specific guidance to follow." },
    ],
  },
  {
    category: "Getting There",
    accent: "bg-gold",
    questions: [
      { q: "What is the closest airport?", a: "Calgary International Airport (YYC) is approximately 1 hour and 15 minutes from Canmore." },
      { q: "Is parking available?", a: "Parking details TBD." },
      { q: "Will there be a shuttle?", a: "Shuttle information to follow." },
    ],
  },
  {
    category: "The Reception",
    accent: "bg-terracotta",
    questions: [
      { q: "Is the reception the same day as the ceremony?", a: "Yes — ceremony, cocktail hour, and reception all take place on Saturday, May 29." },
      { q: "Will there be food and drinks?", a: "Yes! A full dinner and open bar will be served at the reception. Please note any dietary restrictions when you RSVP." },
      { q: "Can I bring a date?", a: "Due to venue capacity, we are only able to accommodate guests listed on the invitation. Reach out if you have questions." },
    ],
  },
  {
    category: "Other",
    accent: "bg-lavender",
    questions: [
      { q: "Are children welcome?", a: "TBD." },
      { q: "What if I have a question not answered here?", a: "Feel free to reach out to us directly — contact info to follow." },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-14">

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-terracotta font-semibold">Got questions?</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">FAQ</h1>
        <p className="font-sans text-brown leading-relaxed mt-1">Answers to common questions. More details to come as the date approaches.</p>
      </div>

      {faqs.map((section) => (
        <div key={section.category} className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${section.accent} shrink-0`}></div>
            <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown">{section.category}</h2>
          </div>
          <div className="flex flex-col gap-5 pl-5 border-l border-beige-dark">
            {section.questions.map((item) => (
              <div key={item.q} className="flex flex-col gap-1">
                <p className="font-serif text-lg text-brown">{item.q}</p>
                <p className="font-sans text-brown leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
