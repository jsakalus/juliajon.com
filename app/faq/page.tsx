"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const faqs: { label: string; accent: string; questions: { q: string; a: ReactNode }[] }[] = [
  {
    label: "the basics",
    accent: "text-terracotta",
    questions: [
      {
        q: "When and where is the wedding?",
        a: (
          <>
            Saturday, May 29, 2027.
            <br /><br />
            <span className="font-semibold text-brown">Ceremony · 4:00 PM</span>
            <br />
            Riverside Park, Canmore, AB
            <br /><br />
            <span className="font-semibold text-brown">Reception · 5:00 PM</span>
            <br />
            A Bear and Bison Inn
            <br />
            705 Benchlands Trail, Canmore, AB
          </>
        ),
      },
      {
        q: "How do I get to the wedding/reception?",
        a: "There is parking at the inn for the reception. For the ceremony at Riverside Park, per Canmore bylaws we're required to limit private vehicle access. We'll help coordinate carpools and Ubers for the ceremony closer to the date.",
      },
      {
        q: "What time does the ceremony start?",
        a: "4:00 PM. Please plan to arrive a little early. Parking can take time and we want everyone in their seats before we start.",
      },
      {
        q: "When do I need to RSVP by?",
        a: "Please RSVP by March 1, 2027. The earlier the better; it really helps us plan!",
      },
      {
        q: "Will there be food and drinks?",
        a: "Yes! A full dinner and open bar will be served at the reception. Please note any dietary restrictions when you RSVP.",
      },
      {
        q: "Can I bring a date?",
        a: "Due to venue capacity, we are only able to accommodate guests listed on the invitation. Reach out if you have questions.",
      },
    ],
  },
  {
    label: "dress code",
    accent: "text-mauve",
    questions: [
      {
        q: "What is the dress code?",
        a: "The theme is wildflowers! The wedding party will be in sage and blue tones. We'd love our guests to come in bright, colorful spring hues. Think florals, bold colors, a meadow in bloom. Ultimately we want you to be comfortable and have fun, so wear something formal but be ready to dance!",
      },
      {
        q: "Any tips for dressing for the mountains?",
        a: "Late May in Canmore can be unpredictable. We recommend layers and comfortable shoes, especially for the outdoor ceremony.",
      },
    ],
  },
];

type Activity = { name: string; description: string; url?: string };

const thingsToDo: { region: string; items: Activity[] }[] = [
  {
    region: "Around Canmore",
    items: [
      {
        name: "Ha Ling Peak",
        description: "A challenging but rewarding hike with stunning Bow Valley views. ~5km roundtrip. Plan a half day.",
        url: "https://www.alltrails.com/trail/canada/alberta/ha-ling-peak-loop",
      },
      {
        name: "Grassi Lakes",
        description: "An accessible hike to two vivid turquoise lakes. Beautiful for all fitness levels.",
        url: "https://www.alltrails.com/trail/canada/alberta/grassi-lakes-trail",
      },
      {
        name: "Canmore Nordic Centre",
        description: "Mountain biking and trails right in town. Rentals available for all levels.",
      },
      {
        name: "Sauvage",
        description: "One of the best restaurants in Canmore. Great food, great wine, great atmosphere.",
      },
      {
        name: "Iron Goat Pub & Grill",
        description: "A local favourite for casual drinks and food with a great patio.",
      },
      {
        name: "Blakes",
        description: "A newer spot in Canmore that's become a go-to. Worth checking out.",
      },
      {
        name: "Canmore Cave Tours",
        description: "Explore underground cave systems in the Rockies. Book ahead, it fills up!",
      },
    ],
  },
  {
    region: "Banff & Lake Louise",
    items: [
      {
        name: "Lake Louise",
        description: "One of the most iconic spots in Canada. Worth it even if you've seen a hundred photos. 45 min from Canmore.",
        url: "https://parks.canada.ca/pn-np/ab/banff",
      },
      {
        name: "Moraine Lake",
        description: "The turquoise lake on the old $20 bill. We rented e-bikes from Lake Louise and biked the road in, which was an absolute highlight. In peak season, vehicle access requires a Parks Canada shuttle reservation. Book ahead.",
        url: "https://reservation.pc.gc.ca",
      },
      {
        name: "Johnston Canyon",
        description: "A stunning canyon walk with waterfalls. Go early morning to beat the crowds.",
        url: "https://www.alltrails.com/trail/canada/alberta/johnston-canyon-trail",
      },
      {
        name: "Banff Townsite",
        description: "Great restaurants, shops, and the iconic Fairmont Banff Springs. Worth a wander.",
        url: "https://www.banff.ca",
      },
    ],
  },
  {
    region: "Calgary",
    items: [
      {
        name: "17th Ave SW",
        description: "The best strip for restaurants and bars in Calgary. Walk it end to end for dinner and drinks.",
      },
      {
        name: "Kensington",
        description: "A charming neighborhood with indie shops, cafes, and great brunch spots.",
      },
      {
        name: "Calgary Tower",
        description: "Classic city landmark with a glass floor observation deck and great skyline views.",
        url: "https://www.calgarytower.com",
      },
      {
        name: "Studio Bell",
        description: "Canada's National Music Centre, a stunning building. Worth a visit for any music fan.",
        url: "https://www.studiobell.ca",
      },
    ],
  },
];

function AccordionItem({
  q,
  a,
  accentClass,
}: {
  q: string;
  a: ReactNode;
  accentClass: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-beige-dark last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 gap-4 text-left"
      >
        <span className="font-serif text-lg text-brown leading-snug">{q}</span>
        <span
          className={`shrink-0 text-lg leading-none transition-transform duration-300 ${accentClass}`}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}
        >
          ✿
        </span>
      </button>
      <div
        className="grid overflow-hidden transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0">
          <div className="pb-5 font-sans text-brown-light leading-relaxed text-base sm:text-sm pr-10">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-16">

      {/* Hero */}
      <div className="text-center">
        <p className="font-handwritten text-sage text-2xl mb-0">got</p>
        <h1
          className="font-serif text-[3rem] md:text-[6rem] leading-none text-brown tracking-tight"
          style={{ fontWeight: 900 }}
        >
          QUESTIONS?
        </h1>
        <p className="font-serif italic text-2xl text-brown-light mt-3">
          we&apos;ve got answers
        </p>
        <p className="font-sans text-brown-light text-sm mt-4 leading-relaxed max-w-sm mx-auto">
          More details will be added as May 2027 gets closer. Check back!
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="flex flex-col gap-10">
        {faqs.map((section) => (
          <div key={section.label}>
            <h2 className={`font-handwritten text-2xl ${section.accent} mb-3`}>
              {section.label}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6">
                {section.questions.map((item) => (
                  <AccordionItem
                    key={item.q}
                    q={item.q}
                    a={item.a}
                    accentClass={section.accent}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Where to Stay */}
      <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-4">
        <div>
          <h2 className="font-handwritten text-2xl text-gold mb-1">where to stay</h2>
          <p className="font-serif text-xl text-brown">Hotel and accommodation recommendations near Canmore.</p>
        </div>
        <p className="font-sans text-brown-light text-base sm:text-sm leading-relaxed">
          We&apos;ve put together recommendations for places to stay near the venue.
        </p>
        <a
          href="/where-to-stay"
          className="self-start px-6 py-2.5 bg-sage text-white text-sm tracking-widest uppercase rounded-full hover:bg-sage-dark transition-colors font-semibold"
        >
          Where to Stay &rarr;
        </a>
      </div>

      {/* Travel */}
      <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-4">
        <div>
          <h2 className="font-handwritten text-2xl text-gold mb-1">getting here</h2>
          <p className="font-serif text-xl text-brown">Flights, driving, and getting around Canmore.</p>
        </div>
        <p className="font-sans text-brown-light text-base sm:text-sm leading-relaxed">
          Calgary International Airport (YYC) is about 1h15min from Canmore. Our travel page has everything you need to plan your trip.
        </p>
        <a
          href="/travel"
          className="self-start px-6 py-2.5 bg-sage text-white text-sm tracking-widest uppercase rounded-full hover:bg-sage-dark transition-colors font-semibold"
        >
          Travel Info &rarr;
        </a>
      </div>

      {/* Things to Do */}
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <p className="font-handwritten text-sage text-2xl">while you&apos;re there</p>
          <h2 className="font-serif text-4xl text-brown" style={{ fontWeight: 700 }}>
            Things to Do
          </h2>
          <p className="font-sans text-brown-light text-sm mt-2 leading-relaxed">
            You came all the way to the Rockies. Make a trip of it.
          </p>
        </div>

        {thingsToDo.map((region) => (
          <div key={region.region}>
            <h3 className="font-handwritten text-xl text-sage mb-4">{region.region}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {region.items.map((activity) => (
                <div
                  key={activity.name}
                  className="bg-white rounded-2xl shadow-sm p-5"
                >
                  {activity.url ? (
                    <a
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-lg text-brown hover:text-sage-dark transition-colors leading-snug underline decoration-beige-dark underline-offset-2"
                    >
                      {activity.name}
                    </a>
                  ) : (
                    <p className="font-serif text-lg text-brown leading-snug">{activity.name}</p>
                  )}
                  <p className="font-sans text-brown-light text-sm mt-1 leading-relaxed">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
