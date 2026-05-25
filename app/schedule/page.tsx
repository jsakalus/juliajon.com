import Image from "next/image";
import Link from "next/link";

const DAYS = [
  {
    day: "friday",
    date: "May 28, 2027",
    accentColor: "text-lavender",
    events: [
      {
        accentBg: "bg-lavender",
        timeColor: "text-lavender",
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
    day: "saturday",
    date: "May 29, 2027",
    accentColor: "text-mauve",
    events: [
      {
        accentBg: "bg-mauve",
        timeColor: "text-mauve",
        image: "/illustrations/ceremony.png",
        alt: "Ceremony at Riverside Park, Canmore",
        title: "Ceremony",
        time: "4:00 PM",
        location: "Riverside Park · Canmore, AB",
        locationHref: "https://maps.google.com/?q=Riverside+Park+Canmore+Alberta",
        note: null,
      },
      {
        accentBg: "bg-terracotta",
        timeColor: "text-terracotta",
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
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-12">

      {/* Header */}
      <div className="text-center">
        <p className="font-handwritten text-sage text-3xl mb-2">welcome to our</p>
        <h1 className="font-serif text-5xl md:text-7xl text-brown font-semibold leading-tight mb-3">
          Wedding Weekend
        </h1>
        <p className="font-handwritten text-3xl text-sage">we can&apos;t wait to celebrate with you!</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-16 bg-sage-light/50" />
          <span className="font-handwritten text-sage text-xl">✦</span>
          <div className="h-px w-16 bg-sage-light/50" />
        </div>
      </div>

      {/* Days */}
      {DAYS.map((daySection, dayIdx) => (
        <div key={daySection.day}>

          {/* Wildflower divider between days */}
          {dayIdx > 0 && (
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-beige-dark" />
              <span className="font-handwritten text-sage-light text-3xl leading-none">✿</span>
              <div className="flex-1 h-px bg-beige-dark" />
            </div>
          )}

          <div className="flex flex-col gap-5">

            {/* Day header */}
            <div>
              <h2 className={`font-handwritten text-3xl ${daySection.accentColor}`}>{daySection.day}</h2>
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-brown-light mt-0.5">{daySection.date}</p>
            </div>

            {/* Event cards */}
            {daySection.events.map((evt) => (
              <div key={evt.title} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                {/* Card body */}
                <div className="flex flex-col sm:flex-row">
                  <div className="flex items-center justify-center p-4 sm:w-[320px] sm:shrink-0 sm:border-r sm:border-beige-dark">
                    <Image
                      src={evt.image}
                      alt={evt.alt}
                      width={360}
                      height={270}
                      className="object-contain w-full"
                      loading="eager"
                    />
                  </div>
                  <div className="flex-1 px-6 pb-6 pt-2 sm:pt-6">
                    <h3 className="font-serif text-2xl text-brown mb-1">{evt.title}</h3>
                    <p className={`font-handwritten text-2xl ${evt.timeColor} mb-2`}>{evt.time}</p>
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
        </div>
      ))}

      {/* Stick Around */}
      <div className="pt-10 border-t border-beige-dark">
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
