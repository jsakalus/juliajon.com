export default function WhereToStay() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-12">

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-lavender font-semibold">Canmore, Alberta</p>
        <h1 className="font-serif italic text-4xl text-brown font-light">Where to Stay</h1>
        <p className="font-sans text-brown leading-relaxed mt-1">
          We recommend booking early — the mountains are popular in late May.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown border-b border-beige-dark pb-3">
          Our Venue
        </h2>
        <div className="bg-white p-6 border-l-4 border-l-sage">
          <p className="font-serif text-xl text-brown mb-1">The Bear and Bison Inn</p>
          <p className="font-sans text-brown">Canmore, AB</p>
          <p className="font-sans text-sage text-sm mt-3">Room block details to follow.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown border-b border-beige-dark pb-3">
          Nearby Hotels
        </h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 border-l-4 border-l-beige-dark">
              <p className="font-serif text-lg text-brown-light italic">Hotel details to follow</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-sans text-xs tracking-[0.25em] uppercase font-bold text-brown border-b border-beige-dark pb-3">
          Vacation Rentals
        </h2>
        <p className="font-sans text-brown leading-relaxed">
          Canmore has many vacation rentals on Airbnb and VRBO — a great option
          if you're travelling with a group. We recommend staying in downtown Canmore for
          easy access to the venue and restaurants.
        </p>
      </div>

    </div>
  );
}
