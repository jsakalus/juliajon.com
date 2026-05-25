type Hotel = {
  name: string;
  url: string;
  description: string;
  ceremonyDrive: string;
  ceremonyWalk?: string;
  receptionDrive: string;
};

type Tier = {
  label: string;
  accent: string;
  blockNote?: string;
  hotels: Hotel[];
};

const tiers: Tier[] = [
  {
    label: "budget-friendly",
    accent: "text-terracotta",
    hotels: [
      {
        name: "The Canmore Hotel",
        url: "https://thecanmorehotel.com/rooms-suites/",
        description:
          "A solid option right in the heart of downtown Canmore. Easy on the wallet and easy to get around from.",
        ceremonyDrive: "~5 min drive",
        ceremonyWalk: "~10 min walk",
        receptionDrive: "~7 min drive",
      },
    ],
  },
  {
    label: "our picks",
    accent: "text-sage",
    blockNote:
      "We're working on securing a room block at one or both of these. We'll update this page when details are confirmed.",
    hotels: [
      {
        name: "Mountain View Inn",
        url: "https://www.mountainviewinn.ca/",
        description:
          "A comfortable inn with great mountain views. Slightly outside of downtown but a quick drive to everything.",
        ceremonyDrive: "~8 min drive",
        receptionDrive: "~12 min drive",
      },
      {
        name: "Georgetown Inn",
        url: "https://www.georgetowninn.ca/",
        description:
          "A charming boutique inn right in the heart of downtown Canmore. Lots of character, great location, and a short hop to both venues.",
        ceremonyDrive: "~5 min drive",
        ceremonyWalk: "~12 min walk",
        receptionDrive: "~7 min drive",
      },
    ],
  },
  {
    label: "the splurge",
    accent: "text-lavender",
    hotels: [
      {
        name: "The Malcolm Hotel",
        url: "https://www.malcolmhotel.ca/",
        description:
          "A stunning full-service luxury hotel in the Spring Creek neighbourhood. If you want to make a romantic trip of it, this is the place.",
        ceremonyDrive: "~5 min drive",
        ceremonyWalk: "~10 min walk",
        receptionDrive: "~7 min drive",
      },
    ],
  },
];

export default function WhereToStay() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-16">

      {/* Hero */}
      <div className="text-center">
        <p className="font-handwritten text-sage text-2xl mb-0">sweet dreams await</p>
        <h1
          className="font-serif text-[2.5rem] md:text-[5rem] leading-none text-brown tracking-tight"
          style={{ fontWeight: 900 }}
        >
          WHERE TO STAY
        </h1>
        <p className="font-serif italic text-2xl text-brown-light mt-3">
          book early. the mountains fill up fast.
        </p>
        <p className="font-sans text-brown-light text-sm mt-4 leading-relaxed max-w-sm mx-auto">
          End of May is the start of peak season in Canmore. We recommend reserving your room as soon as you RSVP.
        </p>
      </div>

      {/* Venue note */}
      <div>
        <h2 className="font-handwritten text-2xl text-gold mb-3">the venue</h2>
        <p className="font-serif text-xl text-brown mb-3">
          Our cozy venue is reserved for the wedding party.
        </p>
        <p className="font-sans text-brown-light text-sm leading-relaxed">
          A Bear and Bison Inn is a 10-room inn tucked into the benchlands above Canmore. It&apos;s where our reception will be held, and those rooms are all reserved for our wedding party. All of the hotels below are within a short drive. The reception is up on the benchlands so a car or rideshare is recommended for that leg. The ceremony at Riverside Park is an easy walk from most downtown options.
        </p>
      </div>

      {/* Hotel tiers */}
      <div className="flex flex-col gap-10">
        {tiers.map((tier) => (
          <div key={tier.label}>
            <h2 className={`font-handwritten text-2xl ${tier.accent} mb-3`}>
              {tier.label}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6">
                {tier.hotels.map((hotel, i) => (
                  <div
                    key={hotel.name}
                    className={`py-6 ${i < tier.hotels.length - 1 ? "border-b border-beige-dark" : ""}`}
                  >
                    <a
                      href={hotel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-xl text-brown hover:text-sage-dark transition-colors"
                    >
                      {hotel.name}{" "}
                      <span className="text-sage text-base font-sans">↗</span>
                    </a>
                    <p className="font-sans text-brown-light text-sm mt-2 leading-relaxed">
                      {hotel.description}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-sans">
                      <div>
                        <p className="uppercase tracking-widest text-brown font-bold text-[0.65rem]">
                          Ceremony
                        </p>
                        <p className="text-brown-light mt-0.5">
                          {hotel.ceremonyDrive}
                          {hotel.ceremonyWalk && <> &middot; {hotel.ceremonyWalk}</>}
                        </p>
                      </div>
                      <div>
                        <p className="uppercase tracking-widest text-brown font-bold text-[0.65rem]">
                          Reception
                        </p>
                        <p className="text-brown-light mt-0.5">{hotel.receptionDrive}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {tier.blockNote && (
              <div className="mt-3 bg-sage/10 rounded-xl px-5 py-3 flex items-start gap-2 border border-sage/20">
                <span className="text-sage mt-0.5 shrink-0">✿</span>
                <p className="font-sans text-sm text-sage-dark leading-relaxed">
                  {tier.blockNote}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vacation rentals */}
      <div>
        <h2 className="font-handwritten text-2xl text-mauve mb-3">vacation rentals</h2>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <p className="font-serif text-xl text-brown mb-3">Want your own space or stay for longer?</p>
          <p className="font-sans text-brown-light text-sm leading-relaxed">
            Canmore has a great selection of vacation rentals on Airbnb and VRBO. A solid option if you&apos;re coming with family or a group of friends and want more space. We recommend staying in or near downtown Canmore for easy access to both venues and the restaurant scene.
          </p>
        </div>
      </div>

    </div>
  );
}
