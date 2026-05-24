import Image from "next/image";
import Link from "next/link";

const EVENTS = [
  {
    day: "Friday",
    date: "May 28, 2027",
    events: [
      {
        dot: "bg-lavender",
        ring: "ring-lavender/30",
        image: "/illustrations/welcome-dinner.png",
        alt: "Welcome Dinner",
        title: "Welcome Dinner",
        time: "Evening",
        location: "Location TBD",
        locationHref: null,
        note: "Kick off the weekend with us. More details to come.",
      },
    ],
  },
  {
    day: "Saturday",
    date: "May 29, 2027",
    events: [
      {
        dot: "bg-mauve",
        ring: "ring-mauve/30",
        image: "/illustrations/ceremony.png",
        alt: "Ceremony at Riverside Park, Canmore",
        title: "Ceremony",
        time: "4:00 PM",
        location: "Riverside Park · Canmore, AB",
        locationHref: "https://maps.google.com/?q=Riverside+Park+Canmore+Alberta",
        note: null,
      },
      {
        dot: "bg-terracotta",
        ring: "ring-terracotta/30",
        image: "/illustrations/reception.png",
        alt: "Reception at A Bear and Bison Inn",
        title: "Reception",
        time: "5:00 PM onwards",
        location: "A Bear and Bison Inn · Canmore, AB",
        locationHref: "https://maps.google.com/?q=Bear+and+Bison+Inn+Canmore+Alberta",
        note: "Cocktail hour, dinner, and dancing all in one place. No end time.",
      },
    ],
  },
];

export default function Schedule() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">

      {/* ── Header ── */}
      <div className="text-center mb-20">
        <p className="font-handwritten text-3xl text-sage mb-2">welcome to our</p>
        <h1 className="font-serif text-6xl md:text-7xl text-brown font-semibold leading-tight mb-3">
          Wedding Weekend
        </h1>
        <p className="font-handwritten text-3xl text-sage mb-3">we can&apos;t wait to celebrate with you!</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-16 bg-sage-light/50" />
          <span className="font-handwritten text-sage text-xl">✦</span>
          <div className="h-px w-16 bg-sage-light/50" />
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="relative">

        {/* Vertical spine */}
        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-sage-light/40" />

        {EVENTS.map(({ day, date, events }, sectionIdx) => (
          <div key={day} className="mb-4">

            {/* Divider between days */}
            {sectionIdx > 0 && (
              <div className="flex items-center gap-4 mb-10 pl-8">
                <div className="flex-1 h-px bg-beige-dark" />
              </div>
            )}

            {/* Day label */}
            <div className="flex items-center gap-5 mb-8 pl-8">
              <div>
                <p className="font-handwritten text-sage text-3xl leading-none">{day}</p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-brown-light mt-0.5">{date}</p>
              </div>
            </div>

            {/* Events */}
            {events.map((evt, i) => (
              <div key={evt.title} className="flex gap-5 mb-2">

                {/* Dot + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`relative z-10 w-6 h-6 rounded-full ${evt.dot} ring-4 ${evt.ring} shadow-md shrink-0`} />
                  {i < events.length - 1 && (
                    <div className="w-0.5 flex-1 bg-sage-light/40 mt-1" />
                  )}
                </div>

                {/* Event card */}
                <div className="flex flex-col sm:flex-row gap-5 flex-1 pb-12">
                  <Image
                    src={evt.image}
                    alt={evt.alt}
                    width={300}
                    height={225}
                    className="object-contain w-full sm:w-[300px] h-auto"
                    loading="eager"
                  />
                  <div className="flex-1 pt-1">
                    <h2 className="font-serif text-3xl text-brown mb-1">{evt.title}</h2>
                    <p className="font-handwritten text-sage text-2xl mb-2">{evt.time}</p>
                    {evt.locationHref ? (
                      <Link
                        href={evt.locationHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-brown-light hover:text-sage transition-colors text-sm inline-flex items-center gap-1 group"
                      >
                        {evt.location}
                        <span className="opacity-50 group-hover:opacity-100 transition-opacity text-xs">↗</span>
                      </Link>
                    ) : (
                      <p className="font-sans text-brown-light/60 text-sm italic">{evt.location}</p>
                    )}
                    {evt.note && (
                      <p className="font-sans text-brown-light/70 text-sm mt-3 italic leading-relaxed">
                        {evt.note}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ))}

          </div>
        ))}

      </div>

      {/* ── Stick Around section ── */}
      <div className="mt-8 pt-12 border-t border-beige-dark">
        <p className="font-handwritten text-sage text-3xl mb-4">Stick around?</p>
        <div className="flex flex-col gap-4 font-sans text-brown leading-relaxed">
          <p>
            We&apos;re staying in Calgary for the week after the wedding. We know a lot of you are travelling from far
            away, and if you&apos;re thinking of making a trip out of it, you really should.
          </p>
          <p>
            If you&apos;ve never seen the Canadian Rockies, they are genuinely some of the most beautiful scenery on
            earth. Banff, Jasper, Lake Louise, Moraine Lake. Just go.
          </p>
          <p>
            If you&apos;re planning to stick around, please let us know! We would love nothing more than some extra
            time with our favourite people.
          </p>
        </div>
      </div>

    </div>
  );
}
